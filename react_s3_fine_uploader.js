'use strict';

import React from 'react/addons';
import fineUploader from 'fineUploader';
import Q from 'q';

import S3Fetcher from '../../fetchers/s3_fetcher';

import FileDragAndDrop from './ascribe_file_drag_and_drop/file_drag_and_drop';

import ErrorQueueStore from '../../stores/error_queue_store';

import GlobalNotificationModel from '../../models/global_notification_model';
import GlobalNotificationActions from '../../actions/global_notification_actions';

import AppConstants from '../../constants/application_constants';
import { ErrorClasses, testErrorAgainstAll } from '../../constants/error_constants';

import { displayValidFilesFilter, FileStatus, transformAllowedExtensionsToInputAcceptProp } from './react_s3_fine_uploader_utils';
import { computeHashOfFile } from '../../utils/file_utils';
import { getCookie } from '../../utils/fetch_api_utils';
import { getLangText } from '../../utils/lang_utils';


const { shape,
        string,
        oneOfType,
        number,
        func,
        bool,
        any,
        object,
        oneOf,
        element,
        arrayOf } = React.PropTypes;

// After 5 manual retries, show the contact us prompt.
const RETRY_ATTEMPT_TO_SHOW_CONTACT_US = 5;

const ReactS3FineUploader = React.createClass({
    propTypes: {
        areAssetsDownloadable: bool,
        areAssetsEditable: bool,
        errorNotificationMessage: string,
        showErrorPrompt: bool,
        setWarning: func, // for when the parent component wants to be notified of uploader warnings (ie. upload failed)

        handleChangedFile: func, // for when a file is dropped or selected, TODO: rename to onChangedFile
        submitFile: func, // for when a file has been successfully uploaded, TODO: rename to onSubmitFile
        onInactive: func, // for when the user does something while the uploader's inactive

        // Handle form validation
        setIsUploadReady: func,     //TODO: rename to setIsUploaderValidated
        isReadyForFormSubmission: func,

        // We encountered some cases where people had difficulties to upload their
        // works to ascribe due to a slow internet connection.
        // One solution we found in the process of tackling this problem was to hash
        // the file in the browser using md5 and then uploading the resulting text document instead
        // of the actual file.
        //
        // This boolean and string essentially enable that behavior.
        // Right now, we determine which upload method to use by appending a query parameter,
        // which should be passed into 'uploadMethod':
        //   'hash':   upload using the hash
        //   'upload': upload full file (default if not specified)
        enableLocalHashing: bool,
        uploadMethod: oneOf(['hash', 'upload']),

        // A class of a file the user has to upload
        // Needs to be defined both in singular as well as in plural
        fileClassToUpload: shape({
            singular: string,
            plural: string
        }),

        // Uploading functionality of react fineuploader is disconnected from its UI
        // layer, which means that literally every (properly adjusted) react element
        // can handle the UI handling.
        fileInputElement: oneOfType([
            func,
            element
        ]),

        // S3 helpers
        keyRoutine: shape({
            url: string,
            fileClass: string,
            pieceId: oneOfType([
                string,
                number
            ])
        }),
        createBlobRoutine: shape({
            url: string,
            pieceId: oneOfType([
                string,
                number
            ])
        }),

        // FineUploader options
        autoUpload: bool,
        debug: bool,
        multiple: bool,
        objectProperties: shape({
            acl: string
        }),
        request: shape({
            endpoint: string,
            accessKey: string,
            params: shape({
                csrfmiddlewaretoken: string
            })
        }),
        signature: shape({
            endpoint: string
        }).isRequired,
        uploadSuccess: shape({
            method: string,
            endpoint: string,
            params: shape({
                isBrowserPreviewCapable: any, // maybe fix this later
                bitcoin_ID_noPrefix: string
            })
        }),
        cors: shape({
            expected: bool
        }),
        chunking: shape({
            enabled: bool
        }),
        resume: shape({
            enabled: bool
        }),
        deleteFile: shape({
            enabled: bool,
            method: string,
            endpoint: string,
            customHeaders: object
        }).isRequired,
        session: shape({
            customHeaders: object,
            endpoint: string,
            params: object,
            refreshOnRequests: bool
        }),
        validation: shape({
            itemLimit: number,
            sizeLimit: string,
            allowedExtensions: arrayOf(string)
        }),
        messages: shape({
            unsupportedBrowser: string
        }),
        formatFileName: func,
        retry: shape({
            enableAuto: bool
        })
    },

    getDefaultProps() {
        return {
            errorNotificationMessage: getLangText('Oops, we had a problem uploading your file. Please contact us if this happens repeatedly.'),
            showErrorPrompt: false,
            fileClassToUpload: {
                singular: getLangText('file'),
                plural: getLangText('files')
            },
            fileInputElement: FileDragAndDrop,

            // FineUploader options
            autoUpload: true,
            debug: false,
            multiple: false,
            objectProperties: {
                acl: 'public-read',
                bucket: 'exampleBucket'
            },
            request: {
                //endpoint: 'http://example-cdn-endpoint.com',
                endpoint: 'http://example-amazons3-bucket.com',
                accessKey: 'exampleAccessKey'
            },
            uploadSuccess: {
                params: {
                    isBrowserPreviewCapable: fineUploader.supportedFeatures.imagePreviews
                }
            },
            cors: {
                expected: true,
                sendCredentials: true
            },
            chunking: {
                enabled: true,
                concurrent: {
                    enabled: true
                }
            },
            resume: {
                enabled: true
            },
            retry: {
                enableAuto: false
            },
            session: {
                endpoint: null
            },
            messages: {
                unsupportedBrowser: '<h3>' + getLangText('Upload is not functional in IE7 as IE7 has no support for CORS!') + '</h3>'
            },
            formatFileName: function(name){// fix maybe
                if (name !== undefined && name.length > 26) {
                    name = name.slice(0, 15) + '...' + name.slice(-15);
                }
                return name;
            }
        };
    },

    getInitialState() {
        return {
            filesToUpload: [],
            uploader: this.createNewFineUploader(),
            csrfToken: getCookie(AppConstants.csrftoken),
            errorState: {
                manualRetryAttempt: 0,
                errorClass: undefined
            },
            uploadInProgress: false,

            // -1: aborted
            // -2: uninitialized
            hashingProgress: -2,

            // this is for logging
            chunks: {}
        };
    },

    componentWillUpdate() {
        // since the csrf header is defined in this component's props,
        // everytime the csrf cookie is changed we'll need to reinitalize
        // fineuploader and update the actual csrf token
        let potentiallyNewCSRFToken = getCookie(AppConstants.csrftoken);
        if(this.state.csrfToken !== potentiallyNewCSRFToken) {
            this.setState({
                uploader: this.createNewFineUploader(),
                csrfToken: potentiallyNewCSRFToken
            });
        }
    },

    componentWillUnmount() {
        // Without this method, fineuploader will continue to try to upload artworks
        // even though this component is not mounted any more.
        // Therefore we cancel all uploads
        this.state.uploader.cancelAll();
    },

    createNewFineUploader() {
        return new fineUploader.s3.FineUploaderBasic(this.propsToConfig());
    },

    propsToConfig() {
        const objectProperties = Object.assign({}, this.props.objectProperties);
        objectProperties.key = this.requestKey;

        return {
            autoUpload: this.props.autoUpload,
            debug: this.props.debug,
            objectProperties: objectProperties, // do a special key handling here
            request: this.props.request,
            signature: this.props.signature,
            uploadSuccess: this.props.uploadSuccess,
            cors: this.props.cors,
            chunking: this.props.chunking,
            resume: this.props.resume,
            deleteFile: this.props.deleteFile,
            session: this.props.session,
            validation: this.props.validation,
            messages: this.props.messages,
            formatFileName: this.props.formatFileName,
            multiple: this.props.multiple,
            retry: this.props.retry,
            callbacks: {
                onAllComplete: this.onAllComplete,
                onComplete: this.onComplete,
                onCancel: this.onCancel,
                onProgress: this.onProgress,
                onDeleteComplete: this.onDeleteComplete,
                onSessionRequestComplete: this.onSessionRequestComplete,
                onError: this.onError,
                onUploadChunk: this.onUploadChunk,
                onUploadChunkSuccess: this.onUploadChunkSuccess
            }
        };
    },

    // Resets the whole react fineuploader component to its initial state
    reset() {
        // Cancel all currently ongoing uploads
        this.cancelUploads();

        // and reset component in general
        this.state.uploader.reset();

        // proclaim that upload is not ready
        this.props.setIsUploadReady(false);

        // reset any warnings propagated to parent
        this.setWarning(false);

        // reset internal data structures of component
        this.setState(this.getInitialState());
    },

    // Cancel uploads and clear previously selected files on the input element
    cancelUploads(id) {
        !!id ? this.state.uploader.cancel(id) : this.state.uploader.cancelAll();

        // Reset the file input element to clear the previously selected files so that
        // the user can reselect them again.
        this.clearFileSelection();
    },

    clearFileSelection() {
        const { fileInput } = this.refs;
        if (fileInput && typeof fileInput.clearSelection === 'function') {
            fileInput.clearSelection();
        }
    },

    requestKey(fileId) {
        let filename = this.state.uploader.getName(fileId);
        let uuid = this.state.uploader.getUuid(fileId);

        return Q.Promise((resolve, reject) => {
            window.fetch(this.props.keyRoutine.url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie(AppConstants.csrftoken)
                },
                credentials: 'include',
                body: JSON.stringify({
                    'filename': filename,
                    'category': this.props.keyRoutine.fileClass,
                    'uuid': uuid,
                    'piece_id': this.props.keyRoutine.pieceId
                })
            })
            .then((res) => {
                return res.json();
            })
            .then((res) =>{
                resolve(res.key);
            })
            .catch((err) => {
                this.onErrorPromiseProxy(err);
                reject(err);
            });
        });
    },

    createBlob(file) {
        const { createBlobRoutine } = this.props;

        return Q.Promise((resolve, reject) => {

            // if createBlobRoutine is not defined,
            // we're progressing right away without posting to S3
            // so that this can be done manually by the form
            if(!createBlobRoutine) {
                // still we warn the user of this component
                console.warn('createBlobRoutine was not defined for ReactS3FineUploader. Continuing without creating the blob on the server.');
                resolve();
            }

            window.fetch(createBlobRoutine.url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie(AppConstants.csrftoken)
                },
                credentials: 'include',
                body: JSON.stringify({
                    'filename': file.name,
                    'key': file.key,
                    'piece_id': createBlobRoutine.pieceId
                })
            })
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if(res.otherdata) {
                    file.s3Url = res.otherdata.url_safe;
                    file.s3UrlSafe = res.otherdata.url_safe;
                } else if(res.digitalwork) {
                    file.s3Url = res.digitalwork.url_safe;
                    file.s3UrlSafe = res.digitalwork.url_safe;
                } else if(res.contractblob) {
                    file.s3Url = res.contractblob.url_safe;
                    file.s3UrlSafe = res.contractblob.url_safe;
                } else if(res.thumbnail) {
                    file.s3Url = res.thumbnail.url_safe;
                    file.s3UrlSafe = res.thumbnail.url_safe;
                } else {
                    throw new Error(getLangText('Could not find a url to download.'));
                }
                resolve(res);
            })
            .catch((err) => {
                this.onErrorPromiseProxy(err);
                reject(err);
            });
        });
    },

    setThumbnailForFileId(fileId, url) {
        const { filesToUpload } = this.state;

        if(fileId < filesToUpload.length) {
            const changeSet = { $set: url };
            const newFilesToUpload = React.addons.update(filesToUpload, { [fileId]: { thumbnailUrl: changeSet } });

            this.setState({ filesToUpload: newFilesToUpload });
        } else {
            throw new Error("You're accessing an index out of range of filesToUpload");
        }
    },

    setWarning(hasWarning) {
        if (typeof this.props.setWarning === 'function') {
            this.props.setWarning(hasWarning);
        }
    },

    checkFormSubmissionReady() {
        const { isReadyForFormSubmission, setIsUploadReady } = this.props;

        // since the form validation props isReadyForFormSubmission and setIsUploadReady
        // are optional, we'll only trigger them when they're actually defined
        if (typeof isReadyForFormSubmission === 'function' && typeof setIsUploadReady === 'function') {
            // set uploadReady to true if the uploader's ready for submission
            setIsUploadReady(isReadyForFormSubmission(this.state.filesToUpload));
        } else {
            console.warn('You didn\'t define the functions isReadyForFormSubmission and/or setIsUploadReady in as a prop in react-s3-fine-uploader');
        }
    },

    isFileValid(file) {
        const { validation } = this.props;

        if (validation && file.size > validation.sizeLimit) {
            const fileSizeInMegaBytes = validation.sizeLimit / 1000000;

            const notification = new GlobalNotificationModel(getLangText('A file you submitted is bigger than ' + fileSizeInMegaBytes + 'MB.'), 'danger', 5000);
            GlobalNotificationActions.appendGlobalNotification(notification);

            return false;
        } else {
            return true;
        }
    },

    getUploadErrorClass({ type = 'upload', reason, xhr }) {
        const { manualRetryAttempt } = this.state.errorState;
        let matchedErrorClass;

        // Use the contact us error class if they've retried a number of times
        // and are still unsuccessful
        if (manualRetryAttempt === RETRY_ATTEMPT_TO_SHOW_CONTACT_US) {
            matchedErrorClass = ErrorClasses.upload.contactUs;
        } else {
            matchedErrorClass = testErrorAgainstAll({ type, reason, xhr });

            // If none found, show the next error message
            if (!matchedErrorClass) {
                matchedErrorClass = ErrorQueueStore.getNextError('upload');
            }
        }

        return matchedErrorClass;
    },

    getXhrErrorComment(xhr) {
        if (xhr) {
            return {
                response: xhr.response,
                url: xhr.responseURL,
                status: xhr.status,
                statusText: xhr.statusText
            };
        }
    },

    /* FineUploader specific callback function handlers */

    onUploadChunk(id, name, chunkData) {
        let chunks = this.state.chunks;

        chunks[id + '-' + chunkData.startByte + '-' + chunkData.endByte] = {
            id,
            name,
            chunkData,
            completed: false
        };

        let startedChunks = React.addons.update(this.state.startedChunks, { $set: chunks });

        this.setState({ startedChunks });
    },

    onUploadChunkSuccess(id, chunkData, responseJson, xhr) {
        let chunks = this.state.chunks;
        let chunkKey = id + '-' + chunkData.startByte + '-' + chunkData.endByte;

        if(chunks[chunkKey]) {
            chunks[chunkKey].completed = true;
            chunks[chunkKey].responseJson = responseJson;
            chunks[chunkKey].xhr = xhr;

            let startedChunks = React.addons.update(this.state.startedChunks, { $set: chunks });

            this.setState({ startedChunks });
        }
    },

    onAllComplete(succeed, failed) {
        if (this.state.uploadInProgress) {
            this.setState({
                uploadInProgress: false
            });
        }
    },

    onComplete(id, name, res, xhr) {
        // There has been an issue with the server's connection
        if (xhr && xhr.status === 0 && res.success) {
            console.logGlobal(new Error('Upload succeeded with a status code 0'), false, {
                files: this.state.filesToUpload,
                chunks: this.state.chunks,
                xhr: this.getXhrErrorComment(xhr)
            });
        // onError will catch any errors, so we can ignore them here
        } else if (!res.error && res.success) {
            let files = this.state.filesToUpload;

            // Set the state of the completed file to 'upload successful' in order to
            // remove it from the GUI
            files[id].status = FileStatus.UPLOAD_SUCCESSFUL;
            files[id].key = this.state.uploader.getKey(id);

            let filesToUpload = React.addons.update(this.state.filesToUpload, { $set: files });
            this.setState({ filesToUpload });

            // Only after the blob has been created server-side, we can make the form submittable.
            this.createBlob(files[id])
                .then(() => {
                    if (typeof this.props.submitFile === 'function') {
                        this.props.submitFile(files[id]);
                    } else {
                        console.warn('You didn\'t define submitFile as a prop in react-s3-fine-uploader');
                    }

                    this.checkFormSubmissionReady();
                });
        }
    },

    /**
     * We want to channel all errors in this component through one single method.
     * As fineuploader's `onError` method cannot handle the callback parameters of
     * a promise we define this proxy method to crunch them into the correct form.
     *
     * @param  {error} err a plain Javascript error
     */
    onErrorPromiseProxy(err) {
        this.onError(null, null, err.message);
    },

    onError(id, name, errorReason, xhr) {
        const { errorNotificationMessage, showErrorPrompt } = this.props;
        const { chunks, filesToUpload } = this.state;

        console.logGlobal(errorReason, false, {
            files: filesToUpload,
            chunks: chunks,
            xhr: this.getXhrErrorComment(xhr)
        });

        let notificationMessage;

        if (showErrorPrompt) {
            this.setStatusOfFile(id, FileStatus.UPLOAD_FAILED);

            // If we've already found an error on this upload, just ignore other errors
            // that pop up. They'll likely pop up again when the user retries.
            if (!this.state.errorState.errorClass) {
                notificationMessage = errorNotificationMessage;

                const errorState = React.addons.update(this.state.errorState, {
                    errorClass: {
                        $set: this.getUploadErrorClass({
                            reason: errorReason,
                            xhr
                        })
                    }
                });

                this.setState({ errorState });
                this.setWarning(true);
            }
        } else {
            notificationMessage = errorReason || errorNotificationMessage;
            this.cancelUploads();
        }

        if (notificationMessage) {
            const notification = new GlobalNotificationModel(notificationMessage, 'danger', 5000);
            GlobalNotificationActions.appendGlobalNotification(notification);
        }
    },

    onCancel(id) {
        // when a upload is canceled, we need to update this components file array
        this.setStatusOfFile(id, FileStatus.CANCELED)
            .then(() => {
                if(typeof this.props.handleChangedFile === 'function') {
                    this.props.handleChangedFile(this.state.filesToUpload[id]);
                }
            });

        let notification = new GlobalNotificationModel(getLangText('File upload canceled'), 'success', 5000);
        GlobalNotificationActions.appendGlobalNotification(notification);

        this.checkFormSubmissionReady();

        // FineUploader's onAllComplete event doesn't fire if all files are cancelled
        // so we need to double check if this is the last file getting cancelled.
        //
        // Because we're calling FineUploader.getInProgress() in a cancel callback,
        // the current file getting cancelled is still considered to be in progress
        // so there will be one file left in progress when we're cancelling the last file.
        if (this.state.uploader.getInProgress() === 1) {
            this.setState({
                uploadInProgress: false
            });
        }

        return true;
    },

    onProgress(id, name, uploadedBytes, totalBytes) {
        let filesToUpload = React.addons.update(this.state.filesToUpload, {
            [id]: {
                progress: { $set: (uploadedBytes / totalBytes) * 100}
            }
        });
        this.setState({ filesToUpload });
    },

    onSessionRequestComplete(response, success) {
        if(success) {
            // fetch blobs for images
            response = response.map((file) => {
                file.url = file.s3UrlSafe;
                file.status = FileStatus.ONLINE;
                file.progress = 100;
                return file;
            });

            // add file to filesToUpload
            let updatedFilesToUpload = this.state.filesToUpload.concat(response);

            // refresh all files ids,
            updatedFilesToUpload = updatedFilesToUpload.map((file, i) => {
                file.id = i;
                return file;
            });

            let filesToUpload = React.addons.update(this.state.filesToUpload, {$set: updatedFilesToUpload});

            this.setState({filesToUpload });
        } else {
            // server has to respond with 204
            //let notification = new GlobalNotificationModel('Could not load attached files (Further data)', 'danger', 10000);
            //GlobalNotificationActions.appendGlobalNotification(notification);
            //
            //throw new Error('The session request failed', response);
        }
    },

    onDeleteComplete(id, xhr, isError) {
        if(isError) {
            this.setStatusOfFile(id, FileStatus.ONLINE);

            let notification = new GlobalNotificationModel(getLangText('There was an error deleting your file.'), 'danger', 10000);
            GlobalNotificationActions.appendGlobalNotification(notification);
        } else {
            let notification = new GlobalNotificationModel(getLangText('File deleted'), 'success', 5000);
            GlobalNotificationActions.appendGlobalNotification(notification);
        }

        this.checkFormSubmissionReady();
    },

    handleDeleteFile(fileId) {
        // We set the files state to 'deleted' immediately, so that the user is not confused with
        // the unresponsiveness of the UI
        //
        // If there is an error during the deletion, we will just change the status back to FileStatus.ONLINE
        // and display an error message
        this.setStatusOfFile(fileId, FileStatus.DELETED)
            .then(() => {
                if(typeof this.props.handleChangedFile === 'function') {
                    this.props.handleChangedFile(this.state.filesToUpload[fileId]);
                }
            });

        // In some instances (when the file was already uploaded and is just displayed to the user
        // - for example in the contract or additional files dialog)
        // fineuploader does not register an id on the file (we do, don't be confused by this!).
        // Since you can only delete a file by its id, we have to implement this method ourselves
        //
        //  So, if an id is not present, we delete the file manually
        //  To check which files are already uploaded from previous sessions we check their status.
        //  If they are, it is "online"

        if(this.state.filesToUpload[fileId].status !== FileStatus.ONLINE) {
            // delete file from server
            this.state.uploader.deleteFile(fileId);
            // this is being continued in onDeleteFile, as
            // fineuploaders deleteFile does not return a correct callback or
            // promise
        } else {
            let fileToDelete = this.state.filesToUpload[fileId];
            S3Fetcher
                .deleteFile(fileToDelete.s3Key, fileToDelete.s3Bucket)
                .then(() => this.onDeleteComplete(fileToDelete.id, null, false))
                .catch(() => this.onDeleteComplete(fileToDelete.id, null, true));
        }
    },

    handleCancelFile(fileId) {
        this.cancelUploads(fileId);
    },

    handlePauseFile(fileId) {
        if(this.state.uploader.pauseUpload(fileId)) {
            this.setStatusOfFile(fileId, FileStatus.PAUSED);
        } else {
            throw new Error(getLangText('File upload could not be paused.'));
        }
    },

    handleResumeFile(fileId) {
        if(this.state.uploader.continueUpload(fileId)) {
            this.setStatusOfFile(fileId, FileStatus.UPLOADING);
        } else {
            throw new Error(getLangText('File upload could not be resumed.'));
        }
    },

    handleRetryFiles(fileIds) {
        let filesToUpload = this.state.filesToUpload;

        if (fileIds.constructor !== Array) {
            fileIds = [ fileIds ];
        }

        fileIds.forEach((fileId) => {
            this.state.uploader.retry(fileId);
            filesToUpload = React.addons.update(filesToUpload, { [fileId]: { status: { $set: FileStatus.UPLOADING } } });
        });

        this.setState({
            // Reset the error class along with the retry
            errorState: {
                manualRetryAttempt: this.state.errorState.manualRetryAttempt + 1
            },
            filesToUpload
        });

        this.setWarning(false);
    },

    handleUploadFile(files) {
        // While files are being uploaded, the form cannot be ready
        // for submission
        this.props.setIsUploadReady(false);

        // If multiple set and user already uploaded its work,
        // cancel upload
        if(!this.props.multiple && this.state.filesToUpload.filter(displayValidFilesFilter).length > 0) {
            this.clearFileSelection();
            return;
        }

        // validate each submitted file if it fits the file size
        let validFiles = [];
        for(let i = 0; i < files.length; i++) {
            if(this.isFileValid(files[i])) {
                validFiles.push(files[i]);
            }
        }
        // override standard files list with only valid files
        files = validFiles;

        // if multiple is set to false and user drops multiple files into the dropzone,
        // take the first one and notify user that only one file can be submitted
        if(!this.props.multiple && files.length > 1) {
            let tempFilesList = [];
            tempFilesList.push(files[0]);

            // replace filelist with first-element file list
            files = tempFilesList;
            // TOOD translate?
            let notification = new GlobalNotificationModel(getLangText('Only one file allowed (took first one)'), 'danger', 10000);
            GlobalNotificationActions.appendGlobalNotification(notification);
        }

        // As mentioned already in the propTypes declaration, in some instances we need to calculate the
        // md5 hash of a file locally and just upload a txt file containing that hash.
        //
        // In the view this only happens when the user is allowed to do local hashing as well
        // as when the correct method prop is present ('hash' and not 'upload')
        if (this.props.enableLocalHashing && this.props.uploadMethod === 'hash') {
            const convertedFilePromises = [];
            let overallFileSize = 0;

            // "files" is not a classical Javascript array but a Javascript FileList, therefore
            // we can not use map to convert values
            for(let i = 0; i < files.length; i++) {
                // for calculating the overall progress of all submitted files
                // we'll need to calculate the overall sum of all files' sizes
                overallFileSize += files[i].size;

                // also, we need to set the files' initial progress value
                files[i].progress = 0;

                // since the actual computation of a file's hash is an async task ,
                // we're using promises to handle that
                let hashedFilePromise = computeHashOfFile(files[i]);
                convertedFilePromises.push(hashedFilePromise);
            }

            // To react after the computation of all files, we define the resolvement
            // with the all function for iterables and essentially replace all original files
            // with their txt representative
            Q.all(convertedFilePromises)
                .progress(({index, value: {progress, reject}}) => {
                    // hashing progress has been aborted from outside
                    // To get out of the executing, we need to call reject from the
                    // inside of the promise's execution.
                    // This is why we're passing (along with value) a function that essentially
                    // just does that (calling reject(err))
                    //
                    // In the promises catch method, we're then checking if the interruption
                    // was due to that error or another generic one.
                    if(this.state.hashingProgress === -1) {
                        reject(new Error(getLangText('Hashing canceled')));
                    }

                    // update file's progress
                    files[index].progress = progress;

                    // calculate weighted average for overall progress of all
                    // currently hashing files
                    let overallHashingProgress = 0;
                    for(let i = 0; i < files.length; i++) {
                        let filesSliceOfOverall = files[i].size / overallFileSize;
                        overallHashingProgress += filesSliceOfOverall * files[i].progress;
                    }

                    // Multiply by 100, since react-progressbar expects decimal numbers
                    this.setState({ hashingProgress: overallHashingProgress * 100});
                })
                .then((convertedFiles) => {
                    // clear hashing progress, since its done
                    this.setState({ hashingProgress: -2});

                    // actually replacing all files with their txt-hash representative
                    files = convertedFiles;

                    // routine for adding all the files submitted to fineuploader for actual uploading them
                    // to the server
                    this.state.uploader.addFiles(files);
                    this.synchronizeFileLists(files);

                })
                .catch((err) => {
                    // If the error is that hashing has been canceled, we want to display a success
                    // message instead of a danger message
                    let typeOfMessage = 'danger';

                    if(err.message === getLangText('Hashing canceled')) {
                        typeOfMessage = 'success';
                        this.setState({ hashingProgress: -2 });
                    } else {
                        // if there was a more generic error, we also log it
                        console.logGlobal(err);
                    }

                    let notification = new GlobalNotificationModel(err.message, typeOfMessage, 5000);
                    GlobalNotificationActions.appendGlobalNotification(notification);
                });

        // if we're not hashing the files locally, we're just going to hand them over to fineuploader
        // to upload them to the server
        } else {
            if(files.length > 0) {
                this.state.uploader.addFiles(files);
                this.synchronizeFileLists(files);
                this.setState({
                    uploadInProgress: true
                });
            }
        }
    },

    handleCancelHashing() {
        // Every progress tick of the hashing function in handleUploadFile there is a
        // check if this.state.hashingProgress is -1. If so, there is an error thrown that cancels
        // the hashing of all files immediately.
        this.setState({ hashingProgress: -1 });
    },

    // ReactFineUploader is essentially just a react layer around s3 fineuploader.
    // However, since we need to display the status of a file (progress, uploading) as well as
    // be able to execute actions on a currently uploading file we need to exactly sync the file list
    // fineuploader is keeping internally.
    //
    // Unfortunately though fineuploader is not keeping all of a File object's properties after
    // submitting them via .addFiles (it deletes the type, key as well as the ObjectUrl (which we need for
    // displaying a thumbnail)), we need to readd them manually after each file that gets submitted
    // to the dropzone.
    // This method is essentially taking care of all these steps.
    synchronizeFileLists(files) {
        let oldFiles = this.state.filesToUpload;
        let oldAndNewFiles = this.state.uploader.getUploads();

        // Add fineuploader specific information to new files
        for(let i = 0; i < oldAndNewFiles.length; i++) {
            for(let j = 0; j < files.length; j++) {
                if(oldAndNewFiles[i].originalName === files[j].name) {
                    oldAndNewFiles[i].progress = 0;
                    oldAndNewFiles[i].type = files[j].type;
                    oldAndNewFiles[i].url = URL.createObjectURL(files[j]);
                }
            }
        }

        // and re-add fineuploader specific information for old files as well
        for(let i = 0; i < oldAndNewFiles.length; i++) {
            for(let j = 0; j < oldFiles.length; j++) {

                // EXCEPTION:
                //
                // Files do not necessarily come from the user's hard drive but can also be fetched
                // from Amazon S3. This is handled in onSessionRequestComplete.
                //
                // If the user deletes one of those files, then fineuploader will still keep it in his
                // files array but with key, progress undefined and size === -1 but
                // status === FileStatus.UPLOAD_SUCCESSFUL.
                // This poses a problem as we depend on the amount of files that have
                // status === FileStatus.UPLOAD_SUCCESSFUL, therefore once the file is synced,
                // we need to tag its status as FileStatus.DELETED (which basically happens here)
                if(oldAndNewFiles[i].size === -1 && (!oldAndNewFiles[i].progress || oldAndNewFiles[i].progress === 0)) {
                    oldAndNewFiles[i].status = FileStatus.DELETED;
                }

                if(oldAndNewFiles[i].originalName === oldFiles[j].name) {
                    oldAndNewFiles[i].progress = oldFiles[j].progress;
                    oldAndNewFiles[i].type = oldFiles[j].type;
                    oldAndNewFiles[i].url = oldFiles[j].url;
                    oldAndNewFiles[i].key = oldFiles[j].key;
                }
            }
        }

        // set the new file array
        let filesToUpload = React.addons.update(this.state.filesToUpload, { $set: oldAndNewFiles });

        this.setState({ filesToUpload }, () => {
            // when files have been dropped or selected by a user, we want to propagate that
            // information to the outside components, so they can act on it (in our case, because
            // we want the user to define a thumbnail when the actual work is not renderable
            // (like e.g. a .zip file))
            if(typeof this.props.handleChangedFile === 'function') {
                // its save to assume that the last file in `filesToUpload` is always
                // the latest file added
                this.props.handleChangedFile(this.state.filesToUpload.slice(-1)[0]);
            }
        });
    },

    // This method has been made promise-based to immediately afterwards
    // call a callback function (instantly after this.setState went through)
    // This is e.g. needed when showing/hiding the optional thumbnail upload
    // field in the registration form
    setStatusOfFile(fileId, status) {
        return Q.Promise((resolve) => {
            let changeSet = {};

            if (status === FileStatus.DELETED || status === FileStatus.CANCELED || status === FileStatus.UPLOAD_FAILED) {
                changeSet.progress = { $set: 0 };
            }

            changeSet.status = { $set: status };

            let filesToUpload = React.addons.update(this.state.filesToUpload, { [fileId]: changeSet });

            this.setState({ filesToUpload }, resolve);
        });
    },

    isDropzoneInactive() {
        const { areAssetsEditable, enableLocalHashing, multiple, showErrorPrompt, uploadMethod } = this.props;
        const { errorState, filesToUpload } = this.state;

        const filesToDisplay = filesToUpload.filter((file) => {
            return file.status !== FileStatus.DELETED &&
                        file.status !== FileStatus.CANCELED &&
                        file.status !== FileStatus.UPLOAD_FAILED &&
                        file.size !== -1;
        });

        if ((enableLocalHashing && !uploadMethod) || !areAssetsEditable ||
                (showErrorPrompt && errorState.errorClass) ||
                (!multiple && filesToDisplay.length > 0)) {
            return true;
        } else {
            return false;
        }
    },

    getAllowedExtensions() {
        const { validation } = this.props;

        if(validation && validation.allowedExtensions && validation.allowedExtensions.length > 0) {
            return transformAllowedExtensionsToInputAcceptProp(validation.allowedExtensions);
        } else {
            return null;
        }
    },

    render() {
        const { errorState: { errorClass }, filesToUpload, uploadInProgress } = this.state;
        const {
            multiple,
            areAssetsDownloadable,
            areAssetsEditable,
            onInactive,
            enableLocalHashing,
            fileClassToUpload,
            fileInputElement: FileInputElement,
            showErrorPrompt,
            uploadMethod } = this.props;

        // Only show the error state once all files are finished
        const showError = !uploadInProgress && showErrorPrompt && errorClass != null;

        const props = {
            multiple,
            areAssetsDownloadable,
            areAssetsEditable,
            onInactive,
            enableLocalHashing,
            uploadMethod,
            fileClassToUpload,
            filesToUpload,
            uploadInProgress,
            errorClass,
            showError,
            onDrop: this.handleUploadFile,
            handleDeleteFile: this.handleDeleteFile,
            handleCancelFile: this.handleCancelFile,
            handlePauseFile: this.handlePauseFile,
            handleResumeFile: this.handleResumeFile,
            handleRetryFiles: this.handleRetryFiles,
            handleCancelHashing: this.handleCancelHashing,
            dropzoneInactive: this.isDropzoneInactive(),
            hashingProgress: this.state.hashingProgress,
            allowedExtensions: this.getAllowedExtensions()
        };

        return (
            <FileInputElement
                ref="fileInput"
                {...props} />
        );
    }
});

export default ReactS3FineUploader;
