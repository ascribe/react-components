'use strict';

import React from 'react/addons';

import promise from 'es6-promise';
promise.polyfill();

import fetch from 'isomorphic-fetch';
import AppConstants from '../../constants/application_constants';

import { getCookie } from '../../utils/fetch_api_utils';

import fineUploader from 'fineUploader';
import FileDragAndDrop from './file_drag_and_drop';

import GlobalNotificationModel from '../../models/global_notification_model';
import GlobalNotificationActions from '../../actions/global_notification_actions';

var ReactS3FineUploader = React.createClass({

    propTypes: {
        keyRoutine: React.PropTypes.shape({
            url: React.PropTypes.string,
            fileClass: React.PropTypes.string,
            bitcoinId: React.PropTypes.string
        }),
        createBlobRoutine: React.PropTypes.shape({
            url: React.PropTypes.string,
            bitcoinId: React.PropTypes.string
        }),
        submitKey: React.PropTypes.func,
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
        }),
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
        }),
        session: React.PropTypes.shape({
            endpoint: React.PropTypes.bool
        }),
        validation: React.PropTypes.shape({
            itemLimit: React.PropTypes.number,
            sizeLimit: React.PropTypes.string
        }),
        messages: React.PropTypes.shape({
            unsupportedBrowser: React.PropTypes.string
        }),
        formatFileName: React.PropTypes.func,
        multiple: React.PropTypes.bool,
        retry: React.PropTypes.shape({
            enableAuto: React.PropTypes.bool
        }),
        setIsUploadReady: React.PropTypes.func,
        isReadyForFormSubmission: React.PropTypes.func
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
                endpoint: 'http://example-amazons3-bucket.com',
                accessKey: 'exampleAccessKey'
            },
            uploadSuccess: {
                params: {
                    isBrowserPreviewCapable: fineUploader.supportedFeatures.imagePreviews
                }
            },
            signature: {
                endpoint: AppConstants.serverUrl + 's3/signature/',
                customHeaders: {
                   'X-CSRFToken': getCookie('csrftoken')
                }
            },
            deleteFile: {
                enabled: true,
                method: 'DELETE',
                endpoint: AppConstants.serverUrl + 's3/delete',
                customHeaders: {
                   'X-CSRFToken': getCookie('csrftoken')
                }
            },
            cors: {
                expected: true,
                sendCredentials: true
            },
            chunking: {
                enabled: true
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
                unsupportedBrowser: '<h3>Upload is not functional in IE7 as IE7 has no support for CORS!</h3>'
            },
            formatFileName: function(name){// fix maybe
                if (name !== undefined && name.length > 26) {
                    name = name.slice(0, 15) + '...' + name.slice(-15);
                }
                return name;
            },
            multiple: false
        };
    },

    getInitialState() {
        return {
            filesToUpload: [],
            uploader: new fineUploader.s3.FineUploaderBasic(this.propsToConfig())
        };
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
                onSubmit: this.onSubmit,
                onComplete: this.onComplete,
                onCancel: this.onCancel,
                onDelete: this.onDelete,
                onProgress: this.onProgress,
                onRetry: this.onRetry,
                onAutoRetry: this.onAutoRetry,
                onManualRetry: this.onManualRetry,
                onDeleteComplete: this.onDeleteComplete
            }
        };
    },

    getCookie(name) {
        let value = '; ' + document.cookie;
        let parts = value.split('; ' + name + '=');
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
    },
    requestKey(fileId) {
        let filename = this.state.uploader.getName(fileId);
        return new Promise((resolve, reject) => {
            fetch(this.props.keyRoutine.url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken')
                },
                credentials: 'include',
                body: JSON.stringify({
                    'filename': filename,
                    'file_class': this.props.keyRoutine.fileClass,
                    'bitcoin_id': this.props.keyRoutine.bitcoinId
                })
            })
            .then((res) => {
                return res.json();
            })
            .then((res) =>{
                resolve(res.key);
            })
            .catch((err) => {
                console.error(err);
                reject(err);
            });
        });
    },

    /* FineUploader specific callback function handlers */

    onSubmit() {
        console.log('submit');
    },

    onComplete(id) {
        let files = this.state.filesToUpload;
        files[id].status = 'upload successful';
        files[id].key = this.state.uploader.getKey(id);

        let newState = React.addons.update(this.state, {
            filesToUpload: { $set: files }
        });
        this.setState(newState);
        this.createBlob(files[id]);
        this.props.submitKey(files[id].key);

        // also, lets check if after the completion of this upload,
        // the form is ready for submission or not
        if(this.props.isReadyForFormSubmission && this.props.isReadyForFormSubmission(this.state.filesToUpload)) {
            // if so, set uploadstatus to true
            this.props.setIsUploadReady(true);
        } else {
            this.props.setIsUploadReady(false);
        }
    },

    createBlob(file) {
        let defer = new fineUploader.Promise();
        fetch(this.props.createBlobRoutine.url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify({
                'filename': file.name,
                'key': file.key,
                'bitcoin_id': this.props.createBlobRoutine.bitcoinId
            })
        })
        .then((res) => {
            return res.json();
        })
        .then((res) =>{
            defer.success(res.key);
        })
        .catch((err) => {
            console.error(err);
        });
        return defer;
    },

    onRetry() {
        console.log('retry');
    },

    onAutoRetry() {
        console.log('autoretry');
    },

    onManualRetry() {
        console.log('manualretry');
    },

    onDelete() {
        console.log('delete');
    },

    onCancel(id) {
        this.removeFileWithIdFromFilesToUpload(id);

        let notification = new GlobalNotificationModel('File upload canceled', 'success', 5000);
        GlobalNotificationActions.appendGlobalNotification(notification);

        if(this.props.isReadyForFormSubmission && this.props.isReadyForFormSubmission(this.state.filesToUpload)) {
            // if so, set uploadstatus to true
            this.props.setIsUploadReady(true);
        } else {
            this.props.setIsUploadReady(false);
        }
    },

    onDeleteComplete(id, xhr, isError) {
        if(isError) {
            let notification = new GlobalNotificationModel('Couldn\'t delete file', 'danger', 10000);
            GlobalNotificationActions.appendGlobalNotification(notification);
        } else {
            this.removeFileWithIdFromFilesToUpload(id);

            let notification = new GlobalNotificationModel('File deleted', 'success', 5000);
            GlobalNotificationActions.appendGlobalNotification(notification);
        }

        if(this.props.isReadyForFormSubmission && this.props.isReadyForFormSubmission(this.state.filesToUpload)) {
            // if so, set uploadstatus to true
            this.props.setIsUploadReady(true);
        } else {
            this.props.setIsUploadReady(false);
        }
    },

    onProgress(id, name, uploadedBytes, totalBytes) {
        var newState = React.addons.update(this.state, {
            filesToUpload: { [id]: {
                progress: { $set: (uploadedBytes / totalBytes) * 100} }
            }
        });
        this.setState(newState);
    },

    handleDeleteFile(fileId) {
        // delete file from server
        this.state.uploader.deleteFile(fileId);
        // this is being continues in onDeleteFile, as
        // fineuploaders deleteFile does not return a correct callback or
        // promise
    },

    handleCancelFile(fileId) {
        this.state.uploader.cancel(fileId);
    },

    handlePauseFile(fileId) {
        if(this.state.uploader.pauseUpload(fileId)) {
            this.setStatusOfFile(fileId, 'paused');
        } else {
            throw new Error('File upload could not be paused.');
        }
        
    },

    handleResumeFile(fileId) {
        if(this.state.uploader.continueUpload(fileId)) {
            this.setStatusOfFile(fileId, 'uploading');
        } else {
            throw new Error('File upload could not be resumed.');
        }
    },

    handleUploadFile(files) {

        // If multiple set and user already uploaded its work,
        // cancel upload
        if(!this.props.multiple && this.state.filesToUpload.filter((file) => file.status !== 'deleted' && file.status !== 'canceled').length > 0) {
            return;
        }

        // if multiple is set to false and user drops multiple files into the dropzone,
        // take the first one and notify user that only one file can be submitted
        if(!this.props.multiple && files.length > 1) {
            let tempFilesList = [];
            tempFilesList.push(files[0]);

            // replace filelist with first-element file list
            files = tempFilesList;

            let notification = new GlobalNotificationModel('Only one file allowed (took first one)', 'danger', 10000);
            GlobalNotificationActions.appendGlobalNotification(notification);
        }

        this.state.uploader.addFiles(files);
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
                if(oldAndNewFiles[i].originalName === oldFiles[j].name) {
                    oldAndNewFiles[i].progress = oldFiles[j].progress;
                    oldAndNewFiles[i].type = oldFiles[j].type;
                    oldAndNewFiles[i].url = oldFiles[j].url;
                    oldAndNewFiles[i].key = oldFiles[j].key;
                }
            }
        }

        // set the new file array
        let newState = React.addons.update(this.state, {
            filesToUpload: { $set: oldAndNewFiles }
        });
        this.setState(newState);
    },

    removeFileWithIdFromFilesToUpload(fileId) {
        // also, sync files from state with the ones from fineuploader
        let filesToUpload = JSON.parse(JSON.stringify(this.state.filesToUpload));

        // splice because I can
        filesToUpload.splice(fileId, 1);

        // set state
        let newState = React.addons.update(this.state, {
            filesToUpload: { $set: filesToUpload }
        });
        this.setState(newState);
    },

    setStatusOfFile(fileId, status) {
        // also, sync files from state with the ones from fineuploader
        let filesToUpload = JSON.parse(JSON.stringify(this.state.filesToUpload));

        // splice because I can
        filesToUpload[fileId].status = status;

        // set state
        let newState = React.addons.update(this.state, {
            filesToUpload: { $set: filesToUpload }
        });
        this.setState(newState);
    },

    render() {
        return (
            <div>
                <FileDragAndDrop
                    className="file-drag-and-drop"
                    onDrop={this.handleUploadFile}
                    filesToUpload={this.state.filesToUpload}
                    handleDeleteFile={this.handleDeleteFile}
                    handleCancelFile={this.handleCancelFile}
                    handlePauseFile={this.handlePauseFile}
                    handleResumeFile={this.handleResumeFile}
                    multiple={this.props.multiple}
                    dropzoneInactive={!this.props.multiple && this.state.filesToUpload.filter((file) => file.status !== 'deleted' && file.status !== 'canceled').length > 0} />
            </div>
        );
    }

});


export default ReactS3FineUploader;
