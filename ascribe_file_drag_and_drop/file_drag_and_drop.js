'use strict';

import React from 'react';
import classNames from 'classnames';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import FileDragAndDropDialog from './file_drag_and_drop_dialog';
import FileDragAndDropErrorDialog from './file_drag_and_drop_error_dialog';
import FileDragAndDropPreviewIterator from './file_drag_and_drop_preview_iterator';

import { FileStatus } from '../react_s3_fine_uploader_utils';
import { getLangText } from '../../../utils/lang_utils';


// Taken from: https://github.com/fedosejev/react-file-drag-and-drop
let FileDragAndDrop = React.createClass({
    propTypes: {
        areAssetsDownloadable: React.PropTypes.bool,
        areAssetsEditable: React.PropTypes.bool,
        multiple: React.PropTypes.bool,
        dropzoneInactive: React.PropTypes.bool,
        filesToUpload: React.PropTypes.array,

        onDrop: React.PropTypes.func.isRequired,
        onDragOver: React.PropTypes.func,
        handleDeleteFile: React.PropTypes.func,
        handleCancelFile: React.PropTypes.func,
        handlePauseFile: React.PropTypes.func,
        handleResumeFile: React.PropTypes.func,
        handleRetryFiles: React.PropTypes.func,

        enableLocalHashing: React.PropTypes.bool,
        uploadMethod: React.PropTypes.string,

        // triggers a FileDragAndDrop-global spinner
        hashingProgress: React.PropTypes.number,
        // sets the value of this.state.hashingProgress in reactfineuploader
        // to -1 which is code for: aborted
        handleCancelHashing: React.PropTypes.func,

        showError: React.PropTypes.bool,
        errorClass: React.PropTypes.shape({
            name: React.PropTypes.string,
            prettifiedText: React.PropTypes.string
        }),

        // A class of a file the user has to upload
        // Needs to be defined both in singular as well as in plural
        fileClassToUpload: React.PropTypes.shape({
            singular: React.PropTypes.string,
            plural: React.PropTypes.string
        }),

        allowedExtensions: React.PropTypes.string
    },

    clearSelection() {
        this.refs.fileSelector.getDOMNode().value = '';
    },

    handleDragOver(event) {
        event.preventDefault();

        if (typeof this.props.onDragOver === 'function') {
            this.props.onDragOver(event);
        }
    },

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.props.dropzoneInactive) {
            let files;

            // handle Drag and Drop
            if(event.dataTransfer && event.dataTransfer.files.length > 0) {
                files = event.dataTransfer.files;
            } else if(event.target.files) { // handle input type file
                files = event.target.files;
            }

            if(typeof this.props.onDrop === 'function' && files) {
              this.props.onDrop(files);
            }
        }
    },

    handleDeleteFile(fileId) {
        // input's value is not changed the second time someone
        // inputs the same file again, therefore we need to reset its value
        this.clearSelection();
        this.props.handleDeleteFile(fileId);
    },

    handleCancelFile(fileId) {
        // input's value is not changed the second time someone
        // inputs the same file again, therefore we need to reset its value
        this.clearSelection();
        this.props.handleCancelFile(fileId);
    },

    handlePauseFile(fileId) {
        // input's value is not changed the second time someone
        // inputs the same file again, therefore we need to reset its value
        this.clearSelection();
        this.props.handlePauseFile(fileId);
    },

    handleResumeFile(fileId) {
        // input's value is not changed the second time someone
        // inputs the same file again, therefore we need to reset its value
        this.clearSelection();
        this.props.handleResumeFile(fileId);
    },

    handleOnClick() {
        // do not propagate event if the drop zone's inactive,
        // for example when multiple is set to false and the user already uploaded a piece
        if (!this.props.dropzoneInactive) {
            let evt;

            try {
                evt = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
            } catch(e) {
                // For browsers that do not support the new MouseEvent syntax
                evt = document.createEvent('MouseEvents');
                evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
            }

            this.refs.fileSelector.getDOMNode().dispatchEvent(evt);
        }
    },

    getErrorDialog(failedFiles) {
        const { errorClass } = this.props;

        return (
            <FileDragAndDropErrorDialog
                errorClass={errorClass}
                files={failedFiles}
                handleRetryFiles={this.props.handleRetryFiles} />
        );
    },

    getPreviewIterator() {
        const { areAssetsDownloadable, areAssetsEditable, filesToUpload } = this.props;

        return (
            <FileDragAndDropPreviewIterator
                files={filesToUpload}
                handleDeleteFile={this.handleDeleteFile}
                handleCancelFile={this.handleCancelFile}
                handlePauseFile={this.handlePauseFile}
                handleResumeFile={this.handleResumeFile}
                areAssetsDownloadable={areAssetsDownloadable}
                areAssetsEditable={areAssetsEditable}/>
        );
    },

    getUploadDialog() {
        const { enableLocalHashing, fileClassToUpload, multiple, uploadMethod } = this.props;

        return (
            <FileDragAndDropDialog
                multipleFiles={multiple}
                onClick={this.handleOnClick}
                enableLocalHashing={enableLocalHashing}
                uploadMethod={uploadMethod}
                fileClassToUpload={fileClassToUpload} />
        );
    },

    render: function () {
        const {
            filesToUpload,
            dropzoneInactive,
            hashingProgress,
            handleCancelHashing,
            multiple,
            showError,
            errorClass,
            fileClassToUpload,
            allowedExtensions } = this.props;

        // has files only is true if there are files that do not have the status deleted, canceled, or failed
        const hasFiles = filesToUpload
                            .filter((file) => {
                                return file.status !== FileStatus.DELETED &&
                                    file.status !== FileStatus.CANCELED &&
                                    file.status !== FileStatus.UPLOAD_FAILED &&
                                    file.size !== -1;
                            })
                            .length > 0;

        const failedFiles = filesToUpload.filter((file) => file.status === FileStatus.UPLOAD_FAILED);
        let hasError = showError && errorClass && failedFiles.length > 0;

        // if !== -2: triggers a FileDragAndDrop-global spinner
        if(hashingProgress !== -2) {
            return (
                <div className="file-drag-and-drop-hashing-dialog">
                    <p>{getLangText('Computing hash(es)... This may take a few minutes.')}</p>
                    <p>
                        <a onClick={handleCancelHashing}> {getLangText('Cancel hashing')}</a>
                    </p>
                    <ProgressBar
                        now={Math.ceil(hashingProgress)}
                        label="%(percent)s%"
                        className="ascribe-progress-bar"/>
                </div>
            );
        } else {
            return (
                <div
                    className={classNames('file-drag-and-drop', dropzoneInactive ? 'inactive-dropzone' : 'active-dropzone', { 'has-files': hasFiles })}
                    onDrag={this.handleDrop}
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDrop}>
                        {hasError ? this.getErrorDialog(failedFiles) : this.getPreviewIterator()}
                        {!hasFiles && !hasError ? this.getUploadDialog() : null}
                        {/*
                            Opera doesn't trigger simulated click events
                            if the targeted input has `display:none` set.
                            Which means we need to set its visibility to hidden
                            instead of using `display:none`.

                            See:
                                - http://stackoverflow.com/questions/12880604/jquery-triggerclick-not-working-on-opera-if-the-element-is-not-displayed
                        */}
                        <input
                            multiple={multiple}
                            ref="fileSelector"
                            type="file"
                            style={{
                                visibility: 'hidden',
                                position: 'absolute',
                                top: 0,
                                height: 0,
                                width: 0
                            }}
                            onChange={this.handleDrop}
                            accept={allowedExtensions}/>
                </div>
          );
        }
    }
});

export default FileDragAndDrop;
