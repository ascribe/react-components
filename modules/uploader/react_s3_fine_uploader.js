import React from 'react';
import update from 'react-addons-update';

import fineUploader from './vendor/s3.fine-uploader';

import { arrayFrom, isShallowEqual, noop, omitFromObject, safeInvoke } from 'js-utility-belt/es6';

import FileStatus from './constants/file_status';

import { validFilesFilter } from './utils/file_filters';
import MimeTypeMapping from './utils/mime_type_mapping';
import { transformAllowedExtensionsToInputAcceptProp } from './utils/private/dom_utils';

import FileSelector from '../file_handlers/file_selector';


const { func, node, object } = React.PropTypes;

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
         *   @param {boolean} disabled         Whether the uploader is disabled (possibly due to
         *                                     hitting a file limit)
         *   @param {File[]}  uploaderFiles    Files currently tracked by the uploader
         *   @param {boolean} uploadInProgress Whether there is an upload in progress
         *
         * Note that for most use cases, you should use Uploadify rather than this prop directly.
         */
        children: node.isRequired,

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
         * @param {File[]} succeeded Array of succeeded file representations **(not ids)**
         * @param {File[]} failed    Array of failed file representations **(not ids)**
         */
        onAllComplete: func,

        /**
         * Similar to FineUploader's onAutoRetry
         * (http://docs.fineuploader.com/branch/master/api/events.html#autoRetry).
         *
         * @param {File}   file          File that was retried
         * @param {number} attemptNumber Number of times the file has been retried automatically
         */
        onAutoRetry: func,

        /**
         * Called when a file has been canceled. Similar to FineUploader's onCancel
         * (http://docs.fineuploader.com/branch/master/api/events.html#cancel), except it does not
         * allow you to return false or a promise to prevent the cancellation. The given file will
         * already have been queued to cancel.
         *
         * @param {File} file File that was canceled
         */
        onCanceled: func,

        /**
         * Similar to FineUploader's onDelete
         * (http://docs.fineuploader.com/branch/master/api/events.html#delete)
         *
         * @param {File} file File that will be deleted
         */
        onDelete: func,

        /**
         * Similar to FineUploader's onDeleteComplete
         * (http://docs.fineuploader.com/branch/master/api/events.html#deleteComplete). This is
         * also called upon resolution of `onDeleteOnlineFile()`.
         *
         * @param {File}    file    File that was deleted
         * @param {Xhr|Xdr} xhr     The xhr used to make the request, `null` if called after
         *                          `onDeleteOnlineFile()`
         * @param {boolean} isError If the delete completed with an error or not
         */
        onDeleteComplete: func,

        /**
         * Similar to FineUploader's onDelete, but only for files originating from an online source
         * as part of the initial session loading (see documentation for initial file lists:
         * http://docs.fineuploader.com/branch/master/features/session.html).
         *
         * While FineUploader can handle most deletes from these sources out of the box, you may
         * need additional logic, such as extra authentication or etc, to process the deletes. If
         * provided, it is expected that `onDeleteOnlineFile` will attempt to delete the given file
         * from the online source, returning a promise that resolves if the attempt succeeded or
         * rejects if the attempt failed.
         *
         * @param  {File}    file File to delete
         * @return {Promise}      Promise that resolves when the deletion suceeds or rejects if
         *                        an error occurred
         */
        onDeleteOnlineFile: func,

        /**
         * Similar to FineUploader's onError
         * (http://docs.fineuploader.com/branch/master/api/events.html#error)
         *
         * @param {File}    file        File that errored
         * @param {string}  errorReason Reason for the error
         * @param {Xhr|Xdr} xhr         The xhr used to make the request
         */
        onError: func,

        /**
         * Called when an error occurs with the internally tracked files by this component
         * (**NOT** FineUploader's), such as trying to set the status of a nonexisting (or for
         * example, filtered out) file. Usually there's not much you can do besides logging it to
         * your bug tracker and investigating later.
         *
         * Possible error descriptions (may be extended by uploader extensions):
         *   'Delete completed for an untracked file'
         *   'Cancel attempted for an untracked file'
         *   'Delete attempted for an untracked file' (with file)
         *   'Pause attempted for an untracked file' (with file)
         *   'Resume attempted for an untracked file' (with file)
         *   'Manually retry attempted for untracked file' (with file)
         *   'Failed to change upload status of untracked file to: ${status}'
         *
         * @param {string} desc   Description of error
         * @param {File}   [file] File that caused the error, if available
         */
        onFileError: func,

        /**
         * Called whenever any of the internal files tracked by this component changes (ie. a file
         * is added, or a file's status was changed)
         *
         * @param {File[]} files Files tracked by this component
         */
        onFilesChanged: func,

        /**
         * Similar to FineUploader's onManualRetry
         * (http://docs.fineuploader.com/branch/master/api/events.html#manualRetry), except like
         * onAutoRetry, this will also give the number of previous retry attempts for the file.
         *
         * @param {File}   file          File that was retried
         * @param {number} attemptNumber Number of times the file has been retried manually
         */
        onManualRetry: func,

        /**
         * Called when a file has been paused.
         *
         * @param {File} file File that was paused
         */
        onPause: func,

        /**
         * Similar to FineUploader's onProgress
         * (http://docs.fineuploader.com/branch/master/api/events.html#progress).
         * Files will automatically have their `progress` property updated to be a percentage
         * of the current upload progress (ie. uploadedBytes / totalBytes * 100).
         *
         * @param {File}   file          File in progress
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
         * @param {File} file File that was resumed
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
         * will be tracked by this uploader, otherwise, no previous session state will be saved.
         * All files obtained through `onSessionRequestComplete` will automatically have their
         * status set to FileStatus.ONLINE and progress set to 100.
         *
         * @param  {object[]} response Response from session request
         * @param  {boolean}  success  If the session request was successful or not
         * @param  {Xhr|Xdr}  xhr      The xhr used to make the request
         * @return {File[]}            Array of files to be tracked by this component
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
         * @param {File}       file      File whose status changed
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
         * It is expected that `onSubmitFiles` will return an array of files (or a promise that
         * resolves with an array of files) to be added to the upload queue. Returning or resolving
         * with an empty array or something that is not an array will ignore any submitted files and
         * add nothing to the queue. Rejecting the promise will also do this.
         *
         * @param  {File[]} files   Files to be uploaded
         * @return {File[]|Promise} Either a promise that resolves with an array of files or an
         *                          actual array of files to be added to the upload queue
         */
        onSubmitFiles: func,

        /**
         * Similar to FineUploader's onSubmitted
         * (http://docs.fineuploader.com/branch/master/api/events.html#submitted).
         * You can use this to check that the successfully submitted files are the same as those
         * that you resolved in `onSubmitFiles`.
         *
         * @param {File} file File that was submitted
         */
        onSubmitted: func,

        /**
         * Similar to FineUploader's onComplete
         * (http://docs.fineuploader.com/branch/master/api/events.html#complete), except that it
         * only gets called when the file was uploaded successfully (rather than also getting
         * called when an error occurs).
         *
         * @param {File}    file File that was uploaded successfully
         * @param {object}  res  The raw response from the server
         * @param {Xhr|Xdr} xhr  The xhr used to make the request
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
         * @param {File} file File that will start uploading
         */
        onUpload: func,

        /**
         * FineUploader options
         * ====================
         *
         * Any other props passed into this component will be passed through to FineUploader.
         *
         * For an explaination on the options available and their defaults, see the docs:
         *   * http://docs.fineuploader.com/branch/master/api/options.html
         *   * http://docs.fineuploader.com/branch/master/api/options-s3.html
         */
    },

    /**
     * File handler API.
     *
     * Note that these are also passed up the component tree through the uploaderSpecExtender.
     */
    childContextTypes: {
        /**
         * Attempts to cancel the given file tracked by this uploader
         *
         * @param {File} File File to cancel
         */
        handleCancelFile: func,

        /**
         * Attempts to delete the given file tracked by this uploader
         *
         * @param {File} File File to delete
         */
        handleDeleteFile: func,

        /**
         * Attempts to pause the given file tracked by this uploader
         *
         * @param {File} File File to pause
         */
        handlePauseFile: func,

        /**
         * Attempts to resume the given file tracked by this uploader
         *
         * @param {File} File File to resume
         */
        handleResumeFile: func,

        /**
         * Attempts to retry the given file tracked by this uploader
         *
         * @param {File} File File to retry
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
            onFileError: (errDesc) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.warn(`ReactS3FineUploader - ${errDesc}`);
                }
            },
            onSubmitFiles: (files) => files,

            // Default FineUploader options that we use in this component and are true by default
            multiple: true
        };
    },

    getInitialState() {
        return {
            uploader: this.createNewFineUploader(),
            uploaderFiles: [],
            uploadInProgress: false,

            // For logging
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

    /** PUBLIC EXPOSED METHODS FOR PARENTS (EVEN AFTER EXTENSION) **/
    getChunks() {
        return this.state.chunks;
    },

    getFiles() {
        return this.state.uploaderFiles;
    },

    getUploader() {
        return this.state.uploader;
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

    // This method has been made promise-based to allow a callback function
    // to execute immediately after the state is set.
    setStatusOfFile(fileId, status, changeSet = {}) {
        const { onFileError, onFilesChanged, onStatusChange } = this.props;

        return new Promise((resolve, reject) => {
            const file = this.state.uploaderFiles[fileId];

            if (file) {
                const oldStatus = file.status;

                changeSet.status = { $set: status };
                if (status === FileStatus.DELETED ||
                    status === FileStatus.CANCELED ||
                    status === FileStatus.UPLOAD_FAILED) {
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
                onFileError(`Failed to change upload status of untracked file to: ${status}`);
                reject();
            }
        });
    },


    /** HANDLERS FOR ACTIONS (ALSO EXPOSED AFTER EXTENSION) **/
    handleCancelFile(file) {
        if (!this.isFileTrackedByUploader(file)) {
            const { onFileError } = this.props;
            onFileError('Cancel attempted for an untracked file', file);

            return;
        }

        this.cancelUploads(file.id);
    },

    handleDeleteFile(file) {
        const { onDeleteOnlineFile, onFileError } = this.props;
        const { uploader } = this.state;

        if (!this.isFileTrackedByUploader(file)) {
            onFileError('Delete attempted for an untracked file', file);

            return;
        }

        // If the file came from a previous session and was already online, a user may want to
        // provide their own logic to delete it (if it requires additional authentication, or etc
        // that FineUploader doesn't provide out of the box).
        // When we know the file's from a previous state, (status is ONLINE), attempt to use the
        // custom delete handler but fallback to using FineUploader's own `deleteFile` if the custom
        // handler isn't defined or did not return a promise resolving the delete request.
        let deleteRequest;
        if (file.status === FileStatus.ONLINE) {
            const { invoked, result } = safeInvoke(onDeleteOnlineFile, file);

            if (invoked && result) {
                deleteRequest = result
                    // Route the custom delete handler's resolution into the callbacks used by
                    // FineUploader for consistency
                    .then(() => this.onDeleteComplete(file.id, null, false))
                    .catch(() => this.onDeleteComplete(file.id, null, true));
            }
        }

        if (!deleteRequest) {
            // To check on the status of the deletion, see onDeleteComplete as
            // FineUploader's deleteFile does not return a callback or promise
            uploader.deleteFile(file.id);
        }

        // We set the files state to 'deleted' immediately, so that the user is not confused with
        // the unresponsiveness of the UI. If there is an error during the deletion, we will just
        // change the status back to FileStatus.ONLINE and display an error message.
        this.setStatusOfFile(file.id, FileStatus.DELETED);
    },

    handlePauseFile(file) {
        if (!this.isFileTrackedByUploader(file)) {
            const { onFileError } = this.props;
            onFileError('Pause attempted for an untracked file', file);

            return;
        }

        if (this.state.uploader.pauseUpload(file.id)) {
            this.setStatusOfFile(file.id, FileStatus.PAUSED)
                .then((updatedFile) => safeInvoke(this.props.onPause, updatedFile));
        } else {
            throw new Error('File upload could not be paused.');
        }
    },

    handleResumeFile(file) {
        if (!this.isFileTrackedByUploader(file)) {
            const { onFileError } = this.props;
            onFileError('Resume attempted for an untracked file', file);

            return;
        }

        const resumeSuccessful = this.state.uploader.continueUpload(file.id);

        if (resumeSuccessful) {
            // FineUploader's onResume callback is **ONLY** used for when a file is resumed from
            // persistent storage, not when they're paused and continued, so we have to handle
            // this callback ourselves
            this.setStatusOfFile(file.id, FileStatus.UPLOADING)
                .then((updatedFile) => safeInvoke(this.props.onResume, updatedFile));
        } else {
            throw new Error('File upload could not be resumed.');
        }
    },

    handleRetryFile(file) {
        if (!this.isFileTrackedByUploader(file)) {
            const { onFileError } = this.props;
            onFileError('Manually retry attempted for untracked file', file);

            return;
        }

        // Our onManualRetry handler for FineUploader will take care of setting the status of our
        // tracked file
        this.state.uploader.retry(file.id);
    },

    handleSubmitFiles(files) {
        Promise.resolve(this.props.onSubmitFiles(arrayFrom(files)))
            .then((submitFiles) => {
                if (Array.isArray(submitFiles) && submitFiles.length) {
                    this.state.uploader.addFiles(submitFiles);
                }
            })
            // Bit of a hack, but use this .catch() to let the next .then() become a .finally().
            // Note that we have to give .catch() a function in order for it to resolve, otherwise
            // it'll be ignored.
            .catch(noop)
            // Reset file input once we've handled the file submission
            .then(this.clearFileSelection);
    },


    /** PRIVATE METHODS (ARE NOT EXTENDED AND SHOULD NOT BE RELIED UPON) **/
    // Cancel uploads and clear previously selected files on the input element
    cancelUploads(fileId) {
        if (typeof fileId !== 'undefined') {
            this.state.uploader.cancel(fileId);
        } else {
            this.state.uploader.cancelAll();
        }

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
        // Strip away all props intended for this component to get the config for FineUploader
        const configFromProps = omitFromObject(this.props, [
            'children',
            'mimeTypeMapping',
            'onAllComplete',
            'onAutoRetry',
            'onCanceled',
            'onDelete',
            'onDeleteComplete',
            'onDeleteOnlineFile',
            'onError',
            'onFileError',
            'onFilesChanged',
            'onManualRetry',
            'onPause',
            'onProgress',
            'onReset',
            'onResume',
            'onSessionRequestComplete',
            'onStatusChange',
            'onSubmitFiles',
            'onSubmitted',
            'onSuccess',
            'onTotalProgress',
            'onUpload'
        ]);

        const uploaderConfig = {
            ...configFromProps,
            callbacks: {
                onAllComplete: this.onAllComplete,
                onAutoRetry: this.onAutoRetry,
                onCancel: this.onCancel,
                onComplete: this.onComplete,
                onDelete: this.onDelete,
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

        return new fineUploader.s3.FineUploaderBasic(uploaderConfig);
    },

    getAcceptedExtensions() {
        const {
            mimeTypeMapping,
            validation: { allowedExtensions } = {} // eslint-disable-line react/prop-types
        } = this.props;

        return transformAllowedExtensionsToInputAcceptProp(allowedExtensions, mimeTypeMapping);
    },

    isFileTrackedByUploader(file) {
        return isShallowEqual(file, this.state.uploaderFiles[file.id]);
    },

    isUploaderDisabled() {
        const { multiple, validation: { itemLimit } = {} } = this.props; // eslint-disable-line react/prop-types
        const validFiles = this.state.uploaderFiles.filter(validFilesFilter);

        return !!((!multiple && validFiles.length) || (itemLimit && validFiles.length >= itemLimit));
    },


    /** FINEUPLOADER SPECIFIC CALLBACK FUNCTION HANDLERS **/
    onAllComplete(succeeded, failed, ...args) {
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
                failed.map((failedId) => uploaderFiles[failedId]),
                ...args
            ]
        });
    },

    onAutoRetry(fileId, name, attemptNumber, ...args) {
        this.setStatusOfFile(fileId, FileStatus.UPLOAD_RETRYING)
            .then((file) => safeInvoke(this.props.onAutoRetry, file, attemptNumber, ...args));
    },

    onCancel(fileId, ...args) {
        this.setStatusOfFile(fileId, FileStatus.CANCELED)
            .then((file) => safeInvoke(this.props.onCanceled, file, ...args));

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

    onComplete(fileId, name, res, xhr, ...args) {
        // onComplete is still called even if the upload failed.
        // onError will catch any errors, so we can ignore them here
        if (!res.error && res.success) {
            // Set the state of the completed file to 'upload successful'
            this.setStatusOfFile(fileId, FileStatus.UPLOAD_SUCCESSFUL, {
                key: { $set: this.state.uploader.getKey(fileId) }
            })
            .then((file) => safeInvoke(this.props.onSuccess, file, res, xhr, ...args));
        }
    },

    onDelete(fileId, ...args) {
        safeInvoke(this.props.onDelete, this.state.uploaderFiles[fileId], ...args);
    },

    onDeleteComplete(fileId, xhr, isError, ...args) {
        const { onDeleteComplete, onFileError } = this.props;

        const invokeCallback = (file = this.state.uploaderFiles[fileId]) => {
            if (file) {
                safeInvoke(onDeleteComplete, file, xhr, isError, ...args);
            } else {
                onFileError('Delete completed for an untracked file');
            }
        };

        if (isError) {
            this.setStatusOfFile(fileId, FileStatus.ONLINE)
                .then(invokeCallback);
        } else {
            invokeCallback();
        }
    },

    onError(fileId, name, errorReason, xhr, ...args) {
        this.setStatusOfFile(fileId, FileStatus.UPLOAD_FAILED)
            .then((file) => safeInvoke(this.props.onError, file, errorReason, xhr, ...args));
    },

    onManualRetry(fileId, ...args) {
        this.setStatusOfFile(fileId, FileStatus.UPLOAD_RETRYING, {
            manualRetryAttempt: { $set: this.state.uploaderFiles[fileId].manualRetryAttempt + 1 }
        })
        .then((file) => safeInvoke(this.props.onManualRetry, file, file.manualRetryAttempt, ...args));
    },

    onProgress(fileId, name, uploadedBytes, totalBytes, ...args) {
        const { onFilesChanged, onProgress } = this.props;

        const uploaderFiles = update(this.state.uploaderFiles, {
            [fileId]: {
                progress: { $set: (uploadedBytes / totalBytes) * 100 }
            }
        });

        this.setState({ uploaderFiles }, () => {
            safeInvoke(onProgress, this.state.uploaderFiles[fileId], uploadedBytes, totalBytes, ...args);
            safeInvoke(onFilesChanged, this.state.uploaderFiles);
        });
    },

    onSessionRequestComplete(response, success, ...args) {
        const { onFilesChanged, onSessionRequestComplete } = this.props;
        const { uploader, uploaderFiles } = this.state;

        const { invoked, result: sessionResult } = safeInvoke(
            onSessionRequestComplete,
            response,
            success,
            ...args
        );

        // If the callback is defined, use its value as the session's files, otherwise fallback to
        // directly using the session's response as the files.
        let sessionFiles;
        if (invoked) {
            sessionFiles = sessionResult;
        } else if (success) {
            sessionFiles = response;
        }

        if (!Array.isArray(sessionFiles)) {
            return;
        } else {
            const baseFileFilter = {
                // All successful session items are registered in FineUploader as UPLOAD_SUCCESSFUL
                status: FileStatus.UPLOAD_SUCCESSFUL
            };

            // Best effort attempt at finding the id of an file by successively trying specific
            // filter properties. Returns null if it couldn't find the file.
            const findIdFromUploader = (file, filterProperties) => (
                filterProperties.reduce((foundId, filterProperty) => {
                    if (foundId == null && file.hasOwnProperty(filterProperty)) {
                        const filteredFiles = uploader.getUploads({
                            ...baseFileFilter,
                            [filterProperty]: file[filterProperty]
                        });

                        if (filteredFiles) {
                            if (Array.isArray(filteredFiles)) {
                                // Go through each of the results to find the first one that isn't
                                // already tracked and assume that's what the given session file
                                // corresponds to.
                                return filteredFiles.reduce((untrackedId, filteredFile) => {
                                    if (untrackedId == null && !uploaderFiles[filteredFile.id]) {
                                        return filteredFile.id;
                                    }

                                    return untrackedId;
                                }, null);
                            } else {
                                // Only one match found, so we can use that single match's id
                                return filteredFiles.id;
                            }
                        }
                    }

                    return foundId;
                }, null)
            );

            sessionFiles.forEach((file, ii) => {
                file.status = FileStatus.ONLINE;
                file.progress = 100;

                // In order to sync up with FineUploader, we need to use the file's id. FineUploader
                // does register these session files with an internal id but it doesn't return it to
                // us directly here, so we try our best to find it using the file's uuid and name.
                // If we can't find it, we'll just assume these session files are at the end of
                // FineUploader's own upload list and use those ids.
                let id = findIdFromUploader(file, ['uuid', 'name']);
                if (id == null) {
                    // Calculate id from the end of the uploader's own internal list
                    const filesInUploader = uploader.getUploads();
                    id = filesInUploader[filesInUploader.length - sessionFiles.length + ii].id;
                }

                file.id = id;
            });

            const syncedUploaderFiles = uploaderFiles
                .concat(sessionFiles)
                // Sort to ensure id is same as index of file
                .sort((fileA, fileB) => fileA.id - fileB.id);

            // Update our tracked files with the ones loaded from the session
            this.setState({ uploaderFiles: syncedUploaderFiles }, () => {
                safeInvoke(onFilesChanged, this.state.uploaderFiles);
            });
        }
    },

    onStatusChange(fileId, oldStatus, newStatus) {
        // Only DELETE_FAILED, REJECTED, and QUEUED are status changes that we can't catch from
        // FineUploader callbacks
        if (newStatus === FileStatus.DELETE_FAILED ||
            newStatus === FileStatus.REJECTED ||
            newStatus === FileStatus.QUEUED) {
            // setStatusOfFile will propagate the event to this.props.onStatusChange
            this.setStatusOfFile(fileId, newStatus);
        }
    },

    onSubmitted(fileId, ...args) {
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
            safeInvoke(onSubmitted, this.state.uploaderFiles[fileId], ...args);
            safeInvoke(onFilesChanged, this.state.uploaderFiles);
        });
    },

    onTotalProgress(totalUploadedBytes, totalBytes, ...args) {
        safeInvoke(this.props.onTotalProgress, totalUploadedBytes, totalBytes, ...args);
    },

    onUpload(fileId, ...args) {
        if (!this.state.uploadInProgress) {
            this.setState({
                uploadInProgress: true
            });
        }

        this.setStatusOfFile(fileId, FileStatus.UPLOADING)
            .then((file) => safeInvoke(this.props.onUpload, file, ...args));
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


    render() {
        const {
            children,
            multiple, // eslint-disable-line react/prop-types
            validation: { allowedExtensions } = {} // eslint-disable-line react/prop-types
        } = this.props;
        const { uploaderFiles, uploadInProgress } = this.state;
        const uploaderDisabled = this.isUploaderDisabled();

        return (
            <FileSelector
                ref={(ref) => { this.fileSelector = ref; }}
                accept={this.getAcceptedExtensions()}
                disabled={uploaderDisabled}
                multiple={multiple}
                onSelectFiles={this.handleSubmitFiles}>
                {React.Children.map(children, (child) => (
                    React.cloneElement(child, {
                        allowedExtensions,
                        multiple,
                        uploaderFiles,
                        uploadInProgress,
                        disabled: child.props.disabled || uploaderDisabled
                    })
                ))}
            </FileSelector>
        );
    }
});

export default ReactS3FineUploader;
