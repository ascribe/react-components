'use strict';

import React from 'react/addons';

import promise from 'es6-promise';
promise.polyfill();

import fetch from 'isomorphic-fetch';

import fineUploader from 'fineUploader';
import FileDragAndDrop from './file_drag_and_drop';

var ReactS3FineUploader = React.createClass({

    getInitialState() {
        return {
            filesToUpload: [],
            uploader: new fineUploader.s3.FineUploaderBasic(this.propsToConfig())
        };
    },

    componentDidMount() {
        //console.log(JSON.stringify(this.propsToConfig()));
        //let file = this.state.uploader.getResumableFilesData()[0];
        //this.state.uploader.retry('1RKieODp_EBoDPNhISXBDNuA1JKdVuXCWhyk44DTK81WUQvpu3M8TXsKPLkjm3ICSvbbyR2KaHhEysvRQ_s4qHNFCbBiYrZ0Q8clXGCYtzk-');
    },

    propTypes: {
        keyRoutine: React.PropTypes.shape({
            url: React.PropTypes.string,
            fileClass: React.PropTypes.string
        }),
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
            endpoint: React.PropTypes.string
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
        })
    },

    propsToConfig() {
        let objectProperties = this.props.objectProperties;
        objectProperties['key'] = this.requestKey;

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
                onDelete: this.onDelete,
                onSessionRequestComplete: this.onSessionRequestComplete, 
                onProgress: this.onProgress,
                onRetry: this.onRetry,
                onAutoRetry: this.onAutoRetry,
                onManualRetry: this.onManualRetry,
                onDeleteComplete: this.onDeleteComplete
            }
        };
    },
    getCookie(name) {
        console.log(document.cookie);
        let value = '; ' + document.cookie;
        let parts = value.split('; ' + name + '=');
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
    },
    requestKey(fileId) {
        let filename = this.state.uploader.getName(fileId);
        let defer = new fineUploader.Promise();
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
                'file_class': 'digitalwork'
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

    /* FineUploader specific callback function handlers */

    onSubmit() {
        console.log('submit');
    },

    onComplete() {
        console.log('complete');
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

    onCancel() {
        console.log('cancel');
    },

    onSessionRequestComplete() {
        console.log('sessionrequestcomplete');
    },

    onDeleteComplete(id, xhr, isError) {
        if(isError) {
            // also, sync files from state with the ones from fineuploader
            let filesToUpload = JSON.parse(JSON.stringify(this.state.filesToUpload));
            // splice because I can
            filesToUpload.splice(fileId, 1);

            // set state
            this.setState({
                filesToUpload: React.addons.update(this.state.filesToUpload, {$set: filesToUpload})
            });
        } else {
            // TODO: add global notification
        }
    },

    onProgress(id, name, uploadedBytes, totalBytes) {
        var newState = React.addons.update(this.state, {
            filesToUpload: { [id]: {
                progress: { $set: (uploadedBytes/totalBytes)*100} }
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

    handleUploadFile(files) {
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
                    oldAndNewFiles[i].progress = 0;
                    oldAndNewFiles[i].type = oldFiles[j].type;
                    oldAndNewFiles[i].url = oldFiles[j].url;
                }
            }
        }

        let newState = React.addons.update(this.state, {
            filesToUpload: { $set: oldAndNewFiles }
        });
        this.setState(newState);
    },

    render() {
        return (
            <FileDragAndDrop 
                onDrop={this.handleUploadFile}
                filesToUpload={this.state.filesToUpload}
                handleDeleteFile={this.handleDeleteFile}/>
        );
    }

});


export default ReactS3FineUploader;
