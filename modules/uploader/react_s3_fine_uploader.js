import React from 'react';
import update from 'react-addons-update'
import FineUploader from './vendor/s3.fine-uploader';

import FileStatus from './constants/file_status';
import ValidationErrors from './constants/validation_errors';

import { validFilesFilter } from './utils/file_filters';
import MimeTypeMapping from './utils/mime_type_mapping';
import { transformAllowedExtensionsToInputAcceptProp } from './utils/private/dom_utils';

import FileSelector from '../file_handlers/file_selector';

import { extractFileExtensionFromString } from '../utils/file';
import { arrayFrom, isShallowEqual, safeInvoke } from '../utils/general';


const { bool, func, node, object } = React.PropTypes;

// ReactS3FineUploader is essentially just a react layer around FineUploader's s3 uploader that
// mirrors the internally tracked files of FineUploader to pass them down as props for child
// components to access (ie. be able to display and manipulate) the files submitted to the uploader.
//
// Although most of the component API is similar to FineUploader, see the comments below for the
// full descriptions of available callbacks and options.
const ReactS3FineUploader = React.createClass({
    propTypes: {
        /**
         * UI Component
         * ============
         *
         * Uploading functionality of ReactS3FineUploader is disconnected from its UI layer.
         * Children are cloned with these additional props to help them render uploader
         * specific states:
         *   * allowedExtensions: Allowed file extensions for the uploader
         *   * disabled: Whether the uploader is disabled (possibly due to hitting a file limit)
         *   * uploaderFiles: Files currently tracked by the uploader
         *   * uploadInProgress: Whether there is an upload in progress
         */
        children: node.isRequired,

        /**
         * Called if FineUploader is unable to automatically handle the deletion of a file because
         * of the file originating from an online source requested as part of the initial session.
         *
         * It is expected that `handleDeleteOnlineFile` will attempt to delete the given file from
         * the online source, returning a promise that resolves if the attempt succeeded or rejects
         * if the attempt failed.
         *
         * This is not necessary unless your uploader works with an initial session. When a
         * deletion that requires this function occurs and this is not specified, an error will
         * be thrown.
         *
         * @param  {object}  file File to delete
         * @return {Promise}      Promise that resolves when the deletion suceeds or rejects if
         *                        an error occurred
         */
        handleDeleteOnlineFile: func,

        /**
         * Mapping used to transform file extensions to mime types for filtering file types
         * selectable through the input element's accept prop.
         */
        mimeTypeMapping: object,

        /**
         * Callbacks
         * =========
         *
         * Available callbacks to allow for a parent component to handle uploader events.
         *
         * Most of these callbacks are similar to FineUploader's own event callbacks (see
         * http://docs.fineuploader.com/branch/master/api/events.html), with a few exceptions:
         *   * When FineUploader would give an `id` and a `name` argument, these callbacks will
         *     instead give an object representing the file
         *   * They are usually invoked later than FineUploader's own event invocations, as any
         *     callback that changes a file's status as a side effect will wait until after this
         *     component's state has been set with the new status
         *   * Not all of FineUploader's events are available or behave exactly the same;
         *     reference the list below. If you'd like to use another one, feel free to update
         *     this component and submit pull requests.
         */

        /**
         * Similar to FineUploader's onAllComplete
         * (http://docs.fineuploader.com/branch/master/api/events.html#allComplete)
         *
         * @param {object[]} succeeded Array of succeeded file representations **(not ids)**
         * @param {object[]} failed    Array of failed file representations **(not ids)**
         */
        onAllComplete: func,

        /**
         * Similar to FineUploader's onAutoRetry
         * (http://docs.fineuploader.com/branch/master/api/events.html#autoRetry).
         *
         * @param {object} file          File that was retried
         * @param {number} attemptNumber Number of times the file has been retried manually
         */
        onAutoRetry: func,

        /**
         * Called when a file has been canceled. Similar to FineUploader's onCancel
         * (http://docs.fineuploader.com/branch/master/api/events.html#cancel), except it does not
         * allow you to return false or a promise to prevent the cancellation. The given file will
         * already have been queued to cancel.
         *
         * @param {object} file File that was canceled
         */
        onCanceled: func,

        /**
         * Similar to FineUploader's onDeleteComplete
         * (http://docs.fineuploader.com/branch/master/api/events.html#deleteComplete). This is
         * also called upon resolution of `handleDeleteOnlineFile()`.
         *
         * @param {object}  file    File that was deleted
         * @param {xhr|xdr} xhr     The xhr used to make the request, `null` if called after
         *                          `handleDeleteOnlineFile()`
         * @param {boolean} isError If the delete completed with an error or not
         */
        onDeleteComplete: func,

        /**
         * Similar to FineUploader's onError
         * (http://docs.fineuploader.com/branch/master/api/events.html#error)
         *
         * @param {object}  file        File that errored
         * @param {string}  errorReason Reason for the error
         * @param {xhr|xdr} xhr         The xhr used to make the request
         */
        onError: func,

        /**
         * Called when an error occurs with the internal files tracked by this component
         * (**NOT** FineUploader's), such as trying to set the status of a nonexisting
         * (or for example, filtered out) file.
         *
         * Errors:
         *   'Delete completed for unfound file with id: ${id}'
         *   'Failed to set status of unfound file with id: {id} to: {status}'
         *
         * @param {string} desc  Description of error
         */
        onFileError: func,

        /**
         * Called whenever any of the internal files tracked by this component changes (ie. a file
         * is added, or a file's status was changed)
         *
         * @param {object[]} files Files tracked by this component
         */
        onFilesChanged: func,

        /**
         * Similar to FineUploader's onManualRetry
         * (http://docs.fineuploader.com/branch/master/api/events.html#manualRetry), except like
         * onAutoRetry, this will also give the number of previous retry attempts for the file.
         *
         * @param {object} file          File that was retried
         * @param {number} attemptNumber Number of times the file has been retried manually
         */
        onManualRetry: func,

        /**
         * Called when a file has been paused.
         *
         * @param {object} file File that was paused
         */
        onPause: func,

        /**
         * Similar to FineUploader's onProgress
         * (http://docs.fineuploader.com/branch/master/api/events.html#progress).
         * Files will automatically have their `progress` property updated to be a percentage
         * of the current upload progress (ie. uploadedBytes / totalBytes * 100).
         *
         * @param {object} file          File in progress
         * @param {number} uploadedBytes Number of bytes that have been uploaded so far
         * @param {number} totalBytes    Total number of bytes that comprise this file
         */
        onProgress: func,

        /**
         * Called when the uploader will reset.
         */
        onReset: func,

        /**
         * Unlike FineUploader's onResume (of which its docs are slightly misleading), this is
         * called when a file in the current session is resumed from a paused state.
         * FineUploader's onResume seems to only be called for the resuming of persistently paused
         * files from previous sessions.
         *
         * @param {object} file File that was resumed
         */
        onResume: func,

        /**
         * Similar to FineUploader's onSessionRequestComplete
         * (http://docs.fineuploader.com/branch/master/api/events.html#sessionRequestComplete).
         *
         * `onSessionRequestComplete` must be defined if FineUploader's session
         * (http://docs.fineuploader.com/branch/master/features/session.html) feature is used.
         *
         * It is expected that `onSessionRequestComplete` will return an array of files that
         * will be tracked by this uploader. All files obtained through `onSessionRequestComplete`
         * will automatically have their status set to FileStatus.ONLINE and progress set to 100.
         *
         * @param  {object[]} response Response from session request
         * @param  {boolean}  success  If the session request was successful or not
         * @param  {xhr|xdr}  xhr      The xhr used to make the request
         * @return {object[]}          Array of files to be tracked by this component
         */
        onSessionRequestComplete: func,

        /**
         * Similar to FineUploader's onStatusChange
         * (http://docs.fineuploader.com/branch/master/api/events.html#statusChange), except that
         * it is only invoked on the following status changes:
         *   * FileStatus.CANCELED
         *   * FileStatus.DELETED
         *   * FileStatus.PAUSED
         *   * FileStatus.ONLINE (only when deletion failed)
         *   * FileStatus.UPLOADING
         *   * FileStatus.UPLOAD_FAILED
         *   * FileStatus.UPLOAD_RETRYING
         *   * FileStatus.UPLOAD_SUCCESSFUL
         *
         * @param {object}     file      File whose status changed
         * @param {FileStatus} oldStatus Previous status of the file
         * @param {FileStatus} newStatus New status of the file
         */
        onStatusChange: func,

        /**
         * Similar to FineUploader's onSubmit
         * (http://docs.fineuploader.com/branch/master/api/events.html#submit), except that it
         * gives the entire list of submitted files. Called just before user selected files are
         * submitted to FineUploader's upload queue.
         *
         * You can think of this as a general transform function that enables you to do anything
         * you want with the files a user has selected for uploading just before they're added to
         * the upload queue (for example, change all the file names, do client side encoding, etc).
         *
         * It is expected that `onSubmitFiles` will return a promise that resolves with an array
         * of files to be added to the upload queue. Rejecting the promise will ignore the files
         * and add nothing to the queue. Resolving with an empty array or something that is not
         * an array is the same as rejecting.
         *
         * @param  {object[]} files Files to be uploaded
         * @return {Promise}        Promise that resolves with an array of files to be added to the
         *                          upload queue
         */
        onSubmitFiles: func,

        /**
         * Similar to FineUploader's onSubmitted
         * (http://docs.fineuploader.com/branch/master/api/events.html#submitted).
         * You can use this to check that the successfully submitted files are the same as those
         * that you resolved in `onSubmitFiles`.
         *
         * @param {object} file File that was submitted
         */
        onSubmitted: func,

        /**
         * Similar to FineUploader's onComplete
         * (http://docs.fineuploader.com/branch/master/api/events.html#complete), except that it
         * only gets called when the file was uploaded successfully (rather than also getting
         * called when an error occurs).
         *
         * @param {object}  file File that was uploaded successfully
         * @param {object}  res  The raw response from the server
         * @param {xhr|xdr} xhr  The xhr used to make the request
         */
        onSuccess: func,

        /**
         * Similar to FineUploader's onTotalProgress
         * (http://docs.fineuploader.com/branch/master/api/events.html#totalProgress).
         *
         * @param {number} totalUploadedBytes Total number of bytes that have been uploaded so far
         * @param {number} totalBytes         Total number of bytes that comprise this file
         */
        onTotalProgress: func,

        /**
         * Similar to FineUploader's onUpload
         * (http://docs.fineuploader.com/branch/master/api/events.html#upload).
         *
         * @param {object} file File that will start uploading
         */
        onUpload: func,

        /**
         * Called when validation of the submitted files fails.
         *
         * @param {object} file            File that failed validation, can be `null` if validation
         *                                 applies in general and not just one file
         * @param {object} validationError Error object describing the validation failure
         * @param {string} validationError.error         Description of the failure
         * @param {ValidationErrors} validationError.type Type of the failure
         */
        onValidationFailed: func,

        /**
         * FineUploader options
         * ====================
         *
         * For an explaination of how to use these options, see the docs:
         *   * http://docs.fineuploader.com/branch/master/api/options.html
         *   * http://docs.fineuploader.com/branch/master/api/options-s3.html
         */
        debug: bool,

        autoUpload: bool,
        chunking: object,
        cors: object,
        deleteFile: object,
        formatFileName: func,
        messages: object,
        multiple: bool,
        objectProperties: object,
        request: object,
        resume: object,
        retry: object,
        session: object,
        signature: object,
        uploadSuccess: object,
        validation: object
    },

    childContextTypes: {
        /**
         * Attempts to cancel the given file tracked by this uploader
         *
         * @param {object} File File to cancel
        */
        handleCancelFile: func,

        /**
         * Attempts to delete the given file tracked by this uploader
         *
         * @param {object} File File to delete
        */
        handleDeleteFile: func,

        /**
         * Attempts to pause the given file tracked by this uploader
         *
         * @param {object} File File to pause
        */
        handlePauseFile: func,

        /**
         * Attempts to resume the given file tracked by this uploader
         *
         * @param {object} File File to resume
        */
        handleResumeFile: func,

        /**
         * Attempts to retry the given file tracked by this uploader
         *
         * @param {object} File File to retry
        */
        handleRetryFile: func,

        /**
         * Submits the given files to the uploader
         *
         * @param {File[]} Files Files to submit
        */
        handleSubmitFiles: func
    },

    getDefaultProps() {
        return {
            mimeTypeMapping: MimeTypeMapping,

            // FineUploader options
            debug: false,

            autoUpload: true,
            chunking: {
                enabled: true,
                concurrent: {
                    enabled: true
                }
            },
            cors: {
                expected: true,
                sendCredentials: true
            },
            deleteFile: {},
            formatFileName: (name) => {
                return (name && name.length > 30) ? `${name.slice(0, 15)}...${name.slice(-15)}`
                                                  : name;
            },
            messages: {},
            multiple: false,
            objectProperties: {},
            onSubmitFiles: (files) => Promise.resolve(files),
            request: {},
            resume: {
                enabled: true
            },
            retry: {
                enableAuto: false
            },
            session: {
                endpoint: null
            },
            uploadSuccess: {
                params: {
                    isBrowserPreviewCapable: FineUploader.supportedFeatures.imagePreviews
                }
            },
            validation: {
                itemLimit: 0,
                sizeLimit: 0
            }
        };
    },

    getInitialState() {
        return {
            uploader: this.createNewFineUploader(),
            uploaderFiles: [],
            uploadInProgress: false,

            // for logging
            chunks: {}
        };
    },

    getChildContext() {
        // Pass through an uploader API as context so any child component in the subtree
        // can access and use them
        return {
            handleCancelFile: this.handleCancelFile,
            handleDeleteFile: this.handleDeleteFile,
            handlePauseFile: this.handlePauseFile,
            handleResumeFile: this.handleResumeFile,
            handleRetryFile: this.handleRetryFile,
            handleSubmitFiles: this.handleSubmitFiles
        };
    },

    componentWillUnmount() {
        // If we don't do this, FineUploader will continue to try to upload files
        // even though this component is not mounted any more.
        // Therefore we clean up after ourselves and cancel all uploads
        this.state.uploader.cancelAll();
    },

    /** EXPOSED METHODS FOR PARENTS **/
    getUploader() {
        return this.state.uploader;
    },

    getUploaderFiles() {
        return this.state.uploaderFiles;
    },

    // Resets the whole react FineUploader component to its initial state
    reset() {
        // Tell the parent we're reseting
        safeInvoke(this.props.onReset);

        // then cancel all currently ongoing uploads
        this.cancelUploads();

        // reset uploader
        this.state.uploader.reset();

        // and finally reset internal data structures of component
        this.setState(this.getInitialState());
    },

    /** PRIVATE METHODS **/
    // Cancel uploads and clear previously selected files on the input element
    cancelUploads(fileId) {
        typeof fileId !== 'undefined' ? this.state.uploader.cancel(fileId) : this.state.uploader.cancelAll();

        // Reset the file input element to clear the previously selected files so that
        // the user can reselect them again.
        this.clearFileSelection();
    },

    clearFileSelection() {
        const { fileSelector } = this;

        if (fileSelector) {
            fileSelector.clearFileSelection();
        }
    },

    createNewFineUploader() {
        const {
            autoUpload,
            chunking,
            cors,
            debug,
            deleteFile,
            formatFileName,
            messages,
            multiple,
            objectProperties,
            request,
            resume,
            retry,
            session,
            signature,
            uploadSuccess,
            validation
        } = this.props;

        const uploaderConfig = {
            autoUpload,
            chunking,
            cors,
            debug,
            deleteFile,
            formatFileName,
            multiple,
            messages,
            objectProperties,
            request,
            resume,
            retry,
            session,
            signature,
            uploadSuccess,
            validation,
            callbacks: {
                onAllComplete: this.onAllComplete,
                onAutoRetry: this.onAutoRetry,
                onCancel: this.onCancel,
                onComplete: this.onComplete,
                onDeleteComplete: this.onDeleteComplete,
                onError: this.onError,
                onManualRetry: this.onManualRetry,
                onProgress: this.onProgress,
                onSessionRequestComplete: this.onSessionRequestComplete,
                onStatusChange: this.onStatusChange,
                onSubmitted: this.onSubmitted,
                onTotalProgress: this.onTotalProgress,
                onUpload: this.onUpload,
                onUploadChunk: this.onUploadChunk,
                onUploadChunkSuccess: this.onUploadChunkSuccess
            }
        };

        return new FineUploader.s3.FineUploaderBasic(uploaderConfig);
    },

    getAllowedExtensions() {
        const { mimeTypeMapping, validation: { allowedExtensions } } = this.props;

        return transformAllowedExtensionsToInputAcceptProp(allowedExtensions, mimeTypeMapping);
    },

    isFileTrackedByUploader(file) {
        return isShallowEqual(file, this.state.uploaderFiles[file.id]);
    },

    isFileValid(file) {
        const { onValidationFailed, validation: { allowedExtensions, sizeLimit }  } = this.props;
        const fileExt = extractFileExtensionFromString(file.name);
        let validationError;

        if (sizeLimit && file.size > sizeLimit) {
            validationError = {
                error: `A file you submitted is bigger than ${sizeLimit / 1000000} MB`,
                type: ValidationErrors.SIZE,
            };
        } else if (allowedExtensions && !allowedExtensions.includes(fileExt)) {
            validationError = {
                error: `The file you've submitted is of an invalid file format: Valid format(s): ${allowedExtensions.join(', ')}`,
                type: ValidationErrors.EXTENSION
            };
        }

        if (validationError) {
            safeInvoke(onValidationFailed, file, validationError);

            return false;
        } else {
            return true;
        }
    },

    isUploaderDisabled() {
        if (!this.props.multiple) {
            const filesToDisplay = this.state.uploaderFiles.filter(validFilesFilter);
            return filesToDisplay.length > 0;
        }
    },

    selectValidFiles(files) {
        return arrayFrom(files).filter(this.isFileValid);
    },

    // This method has been made promise-based to allow a callback function
    // to execute immediately after the state is set.
    setStatusOfFile(fileId, status, changeSet = {}) {
        const { onFileError, onFilesChanged, onStatusChange } = this.props;

        return new Promise((resolve) => {
            const file = this.state.uploaderFiles[fileId];

            if (file) {
                const oldStatus = file.status;

                changeSet.status = { $set: status };
                if (status === FileStatus.DELETED || status === FileStatus.CANCELED || status === FileStatus.UPLOAD_FAILED) {
                    changeSet.progress = { $set: 0 };
                }

                const uploaderFiles = update(this.state.uploaderFiles, { [fileId]: changeSet });

                this.setState({ uploaderFiles }, () => {
                    const updatedFile = this.state.uploaderFiles[fileId];

                    safeInvoke(onStatusChange, updatedFile, oldStatus, status);
                    safeInvoke(onFilesChanged, this.state.uploaderFiles);
                    resolve(updatedFile);
                });
            } else {
                safeInvoke(onFileError, `Failed to change status of unfound file with id: ${fileId} to: ${status}`);
                reject();
            }
        });
    },


    /***** FINEUPLOADER SPECIFIC CALLBACK FUNCTION HANDLERS *****/
    onAllComplete(succeeded, failed) {
        const { uploaderFiles, uploadInProgress } = this.state;

        if (uploadInProgress) {
            this.setState({
                uploadInProgress: false
            });
        }

        safeInvoke({
            fn: this.props.onAllComplete,
            params: () => [
                succeeded.map((succeededId) => uploaderFiles[succeededId]),
                failed.map((failedId) => uploaderFiles[failedId])
            ]
        });
    },

    onAutoRetry(fileId, name, attemptNumber) {
        this.setStatusOfFile(fileId, FileStatus.UPLOAD_RETRYING)
            .then((file) => safeInvoke(this.props.onAutoRetry, file, attemptNumber));
    },

    onCancel(fileId) {
        this.setStatusOfFile(fileId, FileStatus.CANCELED)
            .then((file) => safeInvoke(this.props.onCanceled, file));

        // FineUploader's onAllComplete event doesn't fire if all files are canceled
        // so we need to double check if this is the last file getting canceled.
        //
        // Because we're calling FineUploader.getInProgress() in a cancel callback,
        // the current file getting canceled is still considered to be in progress
        // so there will be one file left in progress when we're cancelling the last file.
        if (this.state.uploader.getInProgress() === 1) {
            this.setState({
                uploadInProgress: false
            });
        }

        return true;
    },

    onComplete(fileId, name, res, xhr) {
        // onComplete is still called even if the upload failed.
        // onError will catch any errors, so we can ignore them here
        if (!res.error && res.success) {
            // Set the state of the completed file to 'upload successful' in order to
            // remove it from the GUI
            this.setStatusOfFile(fileId, FileStatus.UPLOAD_SUCCESSFUL, {
                    key: { $set: this.state.uploader.getKey(fileId) }
                })
                .then((file) => safeInvoke(this.props.onSuccess, file, res, xhr));
        }
    },

    onDeleteComplete(fileId, xhr, isError) {
        const { onDeleteComplete, onFileError } = this.prop;s

        const invokeCallback = (file = this.state.uploaderFiles[fileId]) => {
            if (file) {
                safeInvoke(onDeleteComplete, file, xhr, isError);
            } else {
                safeInvoke(onFileError, `Delete completed for unfound file with id: ${fileId}`);
            }
        }

        if (isError) {
            this.setStatusOfFile(fileId, FileStatus.ONLINE)
                .then(invokeCallback);
        } else {
            invokeCallback();
        }
    },

    onError(fileId, name, errorReason, xhr) {
        this.setStatusOfFile(fileId, FileStatus.UPLOAD_FAILED)
            .then((file) => safeInvoke(this.props.onError, file, errorReason, xhr));
    },

    onManualRetry(fileId, name) {
        this.setStatusOfFile(fileId, FileStatus.UPLOAD_RETRYING, {
                manualRetryAttempt: { $set: uploaderFiles[fileId].manualRetryAttempt + 1 }
            })
            .then((file) => safeInvoke(this.props.onManualRetry, file, file.manualRetryAttempt));
    },

    onProgress(fileId, name, uploadedBytes, totalBytes) {
        const { onFilesChanged, onProgress } = this.props;

        const uploaderFiles = update(this.state.uploaderFiles, {
            [fileId]: {
                progress: { $set: (uploadedBytes / totalBytes) * 100}
            }
        });

        this.setState({ uploaderFiles }, () => {
            safeInvoke(onProgress, this.state.uploaderFiles[fileId], uploadedBytes, totalBytes)
            safeInvoke(onFilesChanged, this.state.uploaderFiles);
        });
    },

    onSessionRequestComplete(...params) {
        const { onFilesChanged, onSessionRequestComplete } = this.props;

        const { invoked, result: sessionFiles } = safeInvoke({
            fn: onSessionRequestComplete,
            params: params,
            error: new Error("FineUploader's session feature was used without providing an " +
                             'onSessionRequestComplete() callback to ReactS3FineUploader')
        });

        if (!Array.isArray(sessionFiles)) {
            throw new Error("ReactS3FineUploader's onSessionRequestComplete() did not return an " +
                            'array of files.');
        }

        sessionFiles.forEach((file) => {
            file.status = FileStatus.ONLINE;
            file.progress = 100;
        });

        // Update our tracked files with the ones loaded from the session
        this.setState({ uploaderFiles: this.state.uploaderFiles.concat(sessionFiles) }, () => {
            safeInvoke(onFilesChanged, this.state.uploaderFiles);
        });
    },

    onStatusChange(fileId, oldStatus, newStatus) {
        // Only DELETE_FAILED, REJECTED, and QUEUED are status changes that we can't catch otherwise
        if (newStatus === FileStatus.DELETE_FAILED ||
            newStatus === FileStatus.REJECTED ||
            newStatus === FileStatus.QUEUED) {
            // setStatusOfFile will propagate the event to this.props.onStatusChange
            this.setStatusOfFile(fileId, newStatus);
        }
    },

    onSubmitted(fileId, name) {
        const { onFilesChanged, onSubmitted } = this.props;
        const { uploader } = this.state;

        const submittedFile = uploader.getUploads({ id: fileId });
        const submittedFileObject = uploader.getFile(fileId);

        // Unfortunately, FineUploader does not keep all of a file's properties if we query for
        // them via .getUploads (it removes the type, key, and some others) so we need to re-add them
        // manually back to our mirrored instance every time files are submitted.
        const uploaderFiles = update(this.state.uploaderFiles, {
            [fileId]: {
                $set: {
                    ...submittedFile,
                    manualRetryAttempt: 0,
                    progress: 0,
                    type: submittedFileObject.type,
                    url: URL.createObjectURL(submittedFileObject)
                }
            }
        });

        this.setState({ uploaderFiles }, () => {
            safeInvoke(onSubmitted, this.state.uploaderFiles[fileId])
            safeInvoke(onFilesChanged, this.state.uploaderFiles);
        });
    },

    onTotalProgress(totalUploadedBytes, totalBytes) {
        safeInvoke(this.props.onTotalProgress, totalUploadedBytes, totalBytes);
    },

    onUpload(fileId, name) {
        if (!this.state.uploadInProgress) {
            this.setState({
                uploadInProgress: true
            });
        }

        this.setStatusOfFile(fileId, FileStatus.UPLOADING)
            .then((file) => safeInvoke(this.props.onUpload, file));
    },

    onUploadChunk(fileId, name, chunkData) {
        const chunkKey = `${fileId}-${chunkData.startByte}-${chunkData.endByte}`;

        const chunks = update(this.state.chunks, {
            [chunkKey]: {
                $set: {
                    name,
                    chunkData,
                    completed: false,
                    id: fileId
                }
            }
        });

        this.setState({ chunks });
    },

    onUploadChunkSuccess(fileId, chunkData, responseJson, xhr) {
        const chunkKey = `${fileId}-${chunkData.startByte}-${chunkData.endByte}`;

        if (this.state.chunks[chunkKey]) {
            const chunks = update(this.state.chunks, {
                [chunkKey]: {
                    completed: { $set: true },
                    responseJson: { $set: responseJson },
                    xhr: { $set: xhr }
                }
            });

            this.setState({ chunks });
        }
    },


    /***** HANDLERS FOR ACTIONS *****/
    handleCancelFile(file) {
        if (process.env.NODE_ENV !== 'production' && !this.isFileTrackedByUploader(file)) {
            console.warn('Ignoring attempt to cancel file not tracked by this uploader', file);
            return;
        }

        this.cancelUploads(file.id);
    },

    handleDeleteFile(file) {
        const { handleDeleteOnlineFile, onFileError } = this.props;
        const { uploader, uploaderFiles } = this.state;

        if (process.env.NODE_ENV !== 'production' && !this.isFileTrackedByUploader(file)) {
            console.warn('Ignoring attempt to delete file not tracked by this uploader', file);
            return;
        }

        // FineUploader does not register an id on the file unless it handles the upload
        // of the file itself (however, we always do internally; don't be confused by this!).
        // This is problematic in some instances when FineUploader fetches an already uploaded
        // file as part of its session (ie. when the file was already uploaded to S3 and
        // is just pulled to be displayed to the user).
        //
        // Since FineUploader can only handle file deletions if it can find an id associated with
        // that file, it's not able to delete files that were loaded only as part of its session.
        // Unfortunately, this means that you have to supply your own way of deleting these files
        // that are already online.
        //
        // To check which files were uploaded from previous sessions we can check their status;
        // If they are online, the status will be "online".
        if (file.status !== FileStatus.ONLINE) {
            // FineUploader handled this file and internally registered an id to it, so
            // we can just let FineUploader handle the deletion
            //
            // To check on the status of the deletion, see onDeleteComplete as
            // FineUploader's deleteFile does not return a callback or promise
            uploader.deleteFile(file.id);
        } else {
            safeInvoke({
                fn: handleDeleteOnlineFile,
                params: [file],
                error: new Error(`ReactS3FineUploader cannot delete file (${file.name}) ` +
                                 'originating from a previous session because ' +
                                 'handleDeleteOnlineFile() was not was specified as a prop.')
            }).result.then(() => this.onDeleteComplete(file.id, null, false))
                     .catch(() => this.onDeleteComplete(file.id, null, true));
        }

        // We set the files state to 'deleted' immediately, so that the user is not confused with
        // the unresponsiveness of the UI
        //
        // If there is an error during the deletion, we will just change the status back to FileStatus.ONLINE
        // and display an error message
        this.setStatusOfFile(file.id, FileStatus.DELETED);
    },

    handlePauseFile(file) {
        if (process.env.NODE_ENV !== 'production' && !this.isFileTrackedByUploader(file)) {
            console.warn('Ignoring attempt to pause file not tracked by this uploader', file);
            return;
        }

        if (this.state.uploader.pauseUpload(file.id)) {
            this.setStatusOfFile(file.id, FileStatus.PAUSED)
                .then((file) => safeInvoke(this.props.onPause, file));
        } else {
            throw new Error('File upload could not be paused.');
        }
    },

    handleResumeFile(file) {
        if (process.env.NODE_ENV !== 'production' && !this.isFileTrackedByUploader(file)) {
            console.warn('Ignoring attempt to resume file not tracked by this uploader', file);
            return;
        }

        const resumeSuccessful = this.state.uploader.continueUpload(file.id);

        if (resumeSuccessful) {
            // FineUploader's onResume callback is **ONLY** used for when a file is resumed from
            // persistent storage, not when they're paused and continued, so we have to handle
            // this callback ourselves
            this.setStatusOfFile(file.id, FileStatus.UPLOADING)
                .then((file) => safeInvoke(this.props.onResume, file));
        } else {
            throw new Error('File upload could not be resumed.');
        }
    },

    handleRetryFile(file) {
        if (process.env.NODE_ENV !== 'production' && !this.isFileTrackedByUploader(file)) {
            console.warn('Ignoring attempt to manually retry file not tracked by this uploader', file);
            return;
        }

        // Our onManualRetry handler for FineUploader will take care of setting the status of our tracked file
        this.state.uploader.retry(file.id);
    },

    handleSubmitFiles(files) {
        const { multiple, onSubmitFiles, onValidationFailed, validation: { itemLimit } } = this.props;
        const { uploader, uploaderFiles } = this.state;

        // If multiple is set and user has already uploaded a work, cancel upload
        if (!multiple && uploaderFiles.filter(validFilesFilter).length) {
            this.clearFileSelection();
            return;
        }

        // Select only the submitted files that fit the file size and allowed extensions
        files = this.selectValidFiles(files);

        // If the user selects or drops too many files, take as many as possible and use
        // onValidationFailed to notify the parent component that some files were omitted
        let extraFilesError;

        if ((!multiple || itemLimit === 1) && files.length > 1) {
            // If multiple is set to false, the user shouldn't be able to select more than
            // one file using the file selector, but he could always drop multiple files
            // into the dropzone.
            extraFilesError = 'Only one file allowed (took first one)';
            files = files.slice(0, 1);
        } else if (itemLimit && files.length > itemLimit) {
            extraFilesError = `Too many files selected (only took first ${itemLimit})`;
            files = files.slice(0, itemLimit);
        }

        if (extraFilesError) {
            safeInvoke(onValidationFailed, null, {
                error: extraFilesError,
                type: ValidationErrors.EXTRA_FILES
            });
        }

        if (files.length) {
            onSubmitFiles(files).then((files) => {
                if (Array.isArray(files) && files.length) {
                    uploader.addFiles(files);
                }
            });
        }

        // Reset file input once we've handle the file submission
        this.clearFileSelection();
    },

    render() {
        const { children, multiple } = this.props;
        const { uploaderFiles, uploadInProgress } = this.state;
        const allowedExtensions = this.getAllowedExtensions();
        const uploaderDisabled = this.isUploaderDisabled();

        return (
            <FileSelector
                ref={(ref) => { this.fileSelector = ref; }}
                accept={allowedExtensions}
                disabled={uploaderDisabled}
                multiple={multiple}
                onSelectFiles={this.handleSubmitFiles}>
                {React.Children.map(children, (child) => {
                    return React.cloneElement(child, {
                        allowedExtensions,
                        uploaderFiles,
                        uploadInProgress,
                        disabled: child.props.disabled || uploaderDisabled
                    });
                })}
            </FileSelector>
        );
    }
});

export default ReactS3FineUploader;
