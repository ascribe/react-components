'use strict';

import React from 'react/addons';
import fineUploader from 'fineUploader';
import Q from 'q';

import S3Fetcher from '../../fetchers/s3_fetcher';

import FileDragAndDrop from './ascribe_file_drag_and_drop/file_drag_and_drop';

import GlobalNotificationModel from '../../models/global_notification_model';
import GlobalNotificationActions from '../../actions/global_notification_actions';

import AppConstants from '../../constants/application_constants';

import { computeHashOfFile } from '../../utils/file_utils';
import { displayValidFilesFilter, transformAllowedExtensionsToInputAcceptProp } from './react_s3_fine_uploader_utils';
import { getCookie } from '../../utils/fetch_api_utils';
import { getLangText } from '../../utils/lang_utils';


let ReactS3FineUploader = React.createClass({
    propTypes: {
        keyRoutine: React.PropTypes.shape({
            url: React.PropTypes.string,
            fileClass: React.PropTypes.string,
            pieceId: React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.number
            ])
        }),
        createBlobRoutine: React.PropTypes.shape({
            url: React.PropTypes.string,
            pieceId: React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.number
            ])
        }),
        submitFile: React.PropTypes.func,
        autoUpload: React.PropTypes.bool,
        debug: React.PropTypes.bool,
        objectProperties: React.PropTypes.shape({
            acl: React.PropTypes.string
        }),
        request: React.PropTypes.shape({
            endpoint: React.PropTypes.string,
            accessKey: React.PropTypes.string,
            params: React.PropTypes.shape({
                csrfmiddlewaretoken: React.PropTypes.string
            })
        }),
        signature: React.PropTypes.shape({
            endpoint: React.PropTypes.string
        }).isRequired,
        uploadSuccess: React.PropTypes.shape({
            method: React.PropTypes.string,
            endpoint: React.PropTypes.string,
            params: React.PropTypes.shape({
                isBrowserPreviewCapable: React.PropTypes.any, // maybe fix this later
                bitcoin_ID_noPrefix: React.PropTypes.string
            })
        }),
        cors: React.PropTypes.shape({
            expected: React.PropTypes.bool
        }),
        chunking: React.PropTypes.shape({
            enabled: React.PropTypes.bool
        }),
        resume: React.PropTypes.shape({
            enabled: React.PropTypes.bool
        }),
        deleteFile: React.PropTypes.shape({
            enabled: React.PropTypes.bool,
            method: React.PropTypes.string,
            endpoint: React.PropTypes.string,
            customHeaders: React.PropTypes.object
        }).isRequired,
        session: React.PropTypes.shape({
            customHeaders: React.PropTypes.object,
            endpoint: React.PropTypes.string,
            params: React.PropTypes.object,
            refreshOnRequests: React.PropTypes.bool
        }),
        validation: React.PropTypes.shape({
            itemLimit: React.PropTypes.number,
            sizeLimit: React.PropTypes.string,
            allowedExtensions: React.PropTypes.arrayOf(React.PropTypes.string)
        }),
        messages: React.PropTypes.shape({
            unsupportedBrowser: React.PropTypes.string
        }),
        formatFileName: React.PropTypes.func,
        multiple: React.PropTypes.bool,
        retry: React.PropTypes.shape({
            enableAuto: React.PropTypes.bool
        }),
        uploadStarted: React.PropTypes.func,
        setIsUploadReady: React.PropTypes.func,
        isReadyForFormSubmission: React.PropTypes.func,
        areAssetsDownloadable: React.PropTypes.bool,
        areAssetsEditable: React.PropTypes.bool,
        defaultErrorMessage: React.PropTypes.string,
        onInactive: React.PropTypes.func,

        // We encountered some cases where people had difficulties to upload their
        // works to ascribe due to a slow internet connection.
        // One solution we found in the process of tackling this problem was to hash
        // the file in the browser using md5 and then uploading the resulting text document instead
        // of the actual file.
        // This boolean essentially enables that behavior
        enableLocalHashing: React.PropTypes.bool,

        // automatically injected by React-Router
        query: React.PropTypes.object,

        // A class of a file the user has to upload
        // Needs to be defined both in singular as well as in plural
        fileClassToUpload: React.PropTypes.shape({
            singular: React.PropTypes.string,
            plural: React.PropTypes.string
        }),

        // Uploading functionality of react fineuploader is disconnected from its UI
        // layer, which means that literally every (properly adjusted) react element
        // can handle the UI handling.
        fileInputElement: React.PropTypes.oneOfType([
            React.PropTypes.func,
            React.PropTypes.element
        ]),

        location: React.PropTypes.object
    },

    getDefaultProps() {
        return {
            autoUpload: true,
            debug: false,
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
            },
            multiple: false,
            defaultErrorMessage: getLangText('Unexpected error. Please contact us if this happens repeatedly.'),
            fileClassToUpload: {
                singular: getLangText('file'),
                plural: getLangText('files')
            },
            fileInputElement: FileDragAndDrop
        };
    },

    getInitialState() {
        return {
            filesToUpload: [],
            uploader: new fineUploader.s3.FineUploaderBasic(this.propsToConfig()),
            csrfToken: getCookie(AppConstants.csrftoken),

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
                uploader: new fineUploader.s3.FineUploaderBasic(this.propsToConfig()),
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

    propsToConfig() {
        let objectProperties = this.props.objectProperties;
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
                console.logGlobal(err, false, {
                    files: this.state.filesToUpload,
                    chunks: this.state.chunks
                });
                reject(err);
            });
        });
    },

    createBlob(file) {
        return Q.Promise((resolve, reject) => {
            window.fetch(this.props.createBlobRoutine.url, {
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
                    'piece_id': this.props.createBlobRoutine.pieceId
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
                } else {
                    throw new Error(getLangText('Could not find a url to download.'));
                }
                resolve(res);
            })
            .catch((err) => {
                console.logGlobal(err, false, {
                    files: this.state.filesToUpload,
                    chunks: this.state.chunks
                });
                reject(err);
            });
        });
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

    onComplete(id, name, res, xhr) {
        // there has been an issue with the server's connection
        if((xhr && xhr.status === 0) || res.error) {
            console.logGlobal(new Error(res.error || 'Complete was called but there wasn\t a success'), false, {
                files: this.state.filesToUpload,
                chunks: this.state.chunks
            });
        } else {
            let files = this.state.filesToUpload;

            // Set the state of the completed file to 'upload successful' in order to
            // remove it from the GUI
            files[id].status = 'upload successful';
            files[id].key = this.state.uploader.getKey(id);

            let filesToUpload = React.addons.update(this.state.filesToUpload, { $set: files });
            this.setState({ filesToUpload });

            // Only after the blob has been created server-side, we can make the form submittable.
            this.createBlob(files[id])
                .then(() => {
                    // since the form validation props isReadyForFormSubmission, setIsUploadReady and submitFile
                    // are optional, we'll only trigger them when they're actually defined
                    if(this.props.submitFile) {
                        this.props.submitFile(files[id]);
                    } else {
                        console.warn('You didn\'t define submitFile in as a prop in react-s3-fine-uploader');
                    }

                    // for explanation, check comment of if statement above
                    if(this.props.isReadyForFormSubmission && this.props.setIsUploadReady) {
                        // also, lets check if after the completion of this upload,
                        // the form is ready for submission or not
                        if(this.props.isReadyForFormSubmission(this.state.filesToUpload)) {
                            // if so, set uploadstatus to true
                            this.props.setIsUploadReady(true);
                        } else {
                            this.props.setIsUploadReady(false);
                        }
                    } else {
                        console.warn('You didn\'t define the functions isReadyForFormSubmission and/or setIsUploadReady in as a prop in react-s3-fine-uploader');
                    }
                })
                .catch((err) => {
                    console.logGlobal(err, false, {
                        files: this.state.filesToUpload,
                        chunks: this.state.chunks
                    });
                    let notification = new GlobalNotificationModel(err.message, 'danger', 5000);
                    GlobalNotificationActions.appendGlobalNotification(notification);
                });
        }
    },

    onError(id, name, errorReason, xhr) {
        const errorComment = {
            files: this.state.filesToUpload,
            chunks: this.state.chunks,
        };
        if (xhr) {
            errorComment.xhr = {
                response: xhr.response,
                status: xhr.status,
                statusText: xhr.statusText
            };
        }
        console.logGlobal(errorReason, false, errorComment);

        this.cancelUploads();

        let notification = new GlobalNotificationModel(errorReason || this.props.defaultErrorMessage, 'danger', 5000);
        GlobalNotificationActions.appendGlobalNotification(notification);
    },

    isFileValid(file) {
        if(file.size > this.props.validation.sizeLimit) {

            let fileSizeInMegaBytes = this.props.validation.sizeLimit / 1000000;

            let notification = new GlobalNotificationModel(getLangText('A file you submitted is bigger than ' + fileSizeInMegaBytes + 'MB.'), 'danger', 5000);
            GlobalNotificationActions.appendGlobalNotification(notification);

            return false;
        } else {
            return true;
        }
    },

    onCancel(id) {
        // when a upload is canceled, we need to update this components file array
        this.setStatusOfFile(id, 'canceled');

        let notification = new GlobalNotificationModel(getLangText('File upload canceled'), 'success', 5000);
        GlobalNotificationActions.appendGlobalNotification(notification);

        // since the form validation props isReadyForFormSubmission, setIsUploadReady and submitFile
        // are optional, we'll only trigger them when they're actually defined
        if(this.props.isReadyForFormSubmission && this.props.setIsUploadReady) {
            if(this.props.isReadyForFormSubmission(this.state.filesToUpload)) {
                // if so, set uploadstatus to true
                this.props.setIsUploadReady(true);
            } else {
                this.props.setIsUploadReady(false);
            }
        } else {
            console.warn('You didn\'t define the functions isReadyForFormSubmission and/or setIsUploadReady in as a prop in react-s3-fine-uploader');
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
                file.status = 'online';
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
            this.setStatusOfFile(id, 'online');

            let notification = new GlobalNotificationModel(getLangText('There was an error deleting your file.'), 'danger', 10000);
            GlobalNotificationActions.appendGlobalNotification(notification);
        } else {
            let notification = new GlobalNotificationModel(getLangText('File deleted'), 'success', 5000);
            GlobalNotificationActions.appendGlobalNotification(notification);
        }

        // since the form validation props isReadyForFormSubmission, setIsUploadReady and submitFile
        // are optional, we'll only trigger them when they're actually defined
        if(this.props.isReadyForFormSubmission && this.props.setIsUploadReady) {
            // also, lets check if after the completion of this upload,
            // the form is ready for submission or not
            if(this.props.isReadyForFormSubmission(this.state.filesToUpload)) {
                // if so, set uploadstatus to true
                this.props.setIsUploadReady(true);
            } else {
                this.props.setIsUploadReady(false);
            }
        } else {
            console.warn('You didn\'t define the functions isReadyForFormSubmission and/or setIsUploadReady in as a prop in react-s3-fine-uploader');
        }
    },

    handleDeleteFile(fileId) {
        // We set the files state to 'deleted' immediately, so that the user is not confused with
        // the unresponsiveness of the UI
        //
        // If there is an error during the deletion, we will just change the status back to 'online'
        // and display an error message
        this.setStatusOfFile(fileId, 'deleted');

        // In some instances (when the file was already uploaded and is just displayed to the user
        // - for example in the contract or additional files dialog)
        // fineuploader does not register an id on the file (we do, don't be confused by this!).
        // Since you can only delete a file by its id, we have to implement this method ourselves
        //
        //  So, if an id is not present, we delete the file manually
        //  To check which files are already uploaded from previous sessions we check their status.
        //  If they are, it is "online"

        if(this.state.filesToUpload[fileId].status !== 'online') {
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
            this.setStatusOfFile(fileId, 'paused');
        } else {
            throw new Error(getLangText('File upload could not be paused.'));
        }

    },

    handleResumeFile(fileId) {
        if(this.state.uploader.continueUpload(fileId)) {
            this.setStatusOfFile(fileId, 'uploading');
        } else {
            throw new Error(getLangText('File upload could not be resumed.'));
        }
    },

    handleUploadFile(files) {
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

        // Call this method to signal the outside component that an upload is in progress
        if(typeof this.props.uploadStarted === 'function' && files.length > 0) {
            this.props.uploadStarted();
        }

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
        // as when the correct query parameter is present in the url ('hash' and not 'upload')
        let queryParams = this.props.location.query;
        if(this.props.enableLocalHashing && queryParams && queryParams.method === 'hash') {

            let convertedFilePromises = [];
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
                // status === 'upload successful'.
                // This poses a problem as we depend on the amount of files that have
                // status === 'upload successful', therefore once the file is synced,
                // we need to tag its status as 'deleted' (which basically happens here)
                if(oldAndNewFiles[i].size === -1 && (!oldAndNewFiles[i].progress || oldAndNewFiles[i].progress === 0)) {
                    oldAndNewFiles[i].status = 'deleted';
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

        this.setState({ filesToUpload });
    },

    setStatusOfFile(fileId, status) {
        let changeSet = {};

        if(status === 'deleted' || status === 'canceled') {
            changeSet.progress = { $set: 0 };
        }

        changeSet.status = { $set: status };

        let filesToUpload = React.addons.update(this.state.filesToUpload, { [fileId]: changeSet });

        this.setState({ filesToUpload });
    },

    isDropzoneInactive() {
        let filesToDisplay = this.state.filesToUpload.filter((file) => file.status !== 'deleted' && file.status !== 'canceled' && file.size !== -1);
        let queryParams = this.props.location.query;

        if((this.props.enableLocalHashing && !queryParams.method) || !this.props.areAssetsEditable || !this.props.multiple && filesToDisplay.length > 0) {
            return true;
        } else {
            return false;
        }

    },

    getAllowedExtensions() {
        let { validation } = this.props;

        if(validation && validation.allowedExtensions && validation.allowedExtensions.length > 0) {
            return transformAllowedExtensionsToInputAcceptProp(validation.allowedExtensions);
        } else {
            return null;
        }
    },

    render() {
        const {
             multiple,
             areAssetsDownloadable,
             areAssetsEditable,
             onInactive,
             enableLocalHashing,
             fileClassToUpload,
             validation,
             fileInputElement: FileInputElement,
             location } = this.props;

        const props = {
            multiple,
            areAssetsDownloadable,
            areAssetsEditable,
            onInactive,
            enableLocalHashing,
            fileClassToUpload,
            location,
            onDrop: this.handleUploadFile,
            filesToUpload: this.state.filesToUpload,
            handleDeleteFile: this.handleDeleteFile,
            handleCancelFile: this.handleCancelFile,
            handlePauseFile: this.handlePauseFile,
            handleResumeFile: this.handleResumeFile,
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
