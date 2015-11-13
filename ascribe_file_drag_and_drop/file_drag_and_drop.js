'use strict';

import React from 'react';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import FileDragAndDropDialog from './file_drag_and_drop_dialog';
import FileDragAndDropPreviewIterator from './file_drag_and_drop_preview_iterator';

import { getLangText } from '../../../utils/lang_utils';


// Taken from: https://github.com/fedosejev/react-file-drag-and-drop
let FileDragAndDrop = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        onDrop: React.PropTypes.func.isRequired,
        onDragOver: React.PropTypes.func,
        onInactive: React.PropTypes.func,
        filesToUpload: React.PropTypes.array,
        handleDeleteFile: React.PropTypes.func,
        handleCancelFile: React.PropTypes.func,
        handlePauseFile: React.PropTypes.func,
        handleResumeFile: React.PropTypes.func,
        multiple: React.PropTypes.bool,
        dropzoneInactive: React.PropTypes.bool,
        areAssetsDownloadable: React.PropTypes.bool,
        areAssetsEditable: React.PropTypes.bool,

        enableLocalHashing: React.PropTypes.bool,

        // triggers a FileDragAndDrop-global spinner
        hashingProgress: React.PropTypes.number,
        // sets the value of this.state.hashingProgress in reactfineuploader
        // to -1 which is code for: aborted
        handleCancelHashing: React.PropTypes.func,

        // A class of a file the user has to upload
        // Needs to be defined both in singular as well as in plural
        fileClassToUpload: React.PropTypes.shape({
            singular: React.PropTypes.string,
            plural: React.PropTypes.string
        }),

        allowedExtensions: React.PropTypes.string,
        location: React.PropTypes.object
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
        let files;

        if(this.props.dropzoneInactive) {
            // if there is a handle function for doing stuff
            // when the dropzone is inactive, then call it
            if(this.props.onInactive) {
                this.props.onInactive();
            }
            return;
        }

        // handle Drag and Drop
        if(event.dataTransfer && event.dataTransfer.files.length > 0) {
            files = event.dataTransfer.files;
        } else if(event.target.files) { // handle input type file
            files = event.target.files;
        }

        if(typeof this.props.onDrop === 'function' && files) {
          this.props.onDrop(files);
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
        let evt;
        // when multiple is set to false and the user already uploaded a piece,
        // do not propagate event
        if(this.props.dropzoneInactive) {
            // if there is a handle function for doing stuff
            // when the dropzone is inactive, then call it
            if(this.props.onInactive) {
                this.props.onInactive();
            }
            return;
        }

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
    },

    render: function () {
        let { filesToUpload,
              dropzoneInactive,
              className,
              hashingProgress,
              handleCancelHashing,
              multiple,
              enableLocalHashing,
              fileClassToUpload,
              areAssetsDownloadable,
              areAssetsEditable,
              allowedExtensions,
              location
            } = this.props;

        // has files only is true if there are files that do not have the status deleted or canceled
        let hasFiles = filesToUpload.filter((file) => file.status !== 'deleted' && file.status !== 'canceled' && file.size !== -1).length > 0;
        let updatedClassName = hasFiles ? 'has-files ' : '';
        updatedClassName += dropzoneInactive ? 'inactive-dropzone' : 'active-dropzone';
        updatedClassName += ' file-drag-and-drop';

        // if !== -2: triggers a FileDragAndDrop-global spinner
        if(hashingProgress !== -2) {
            return (
                <div className={className}>
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
                </div>
            );
        } else {
            return (
                <div
                    className={updatedClassName}
                    onDrag={this.handleDrop}
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDrop}>
                        <FileDragAndDropDialog
                            multipleFiles={multiple}
                            hasFiles={hasFiles}
                            onClick={this.handleOnClick}
                            enableLocalHashing={enableLocalHashing}
                            fileClassToUpload={fileClassToUpload}
                            location={location}/>
                        <FileDragAndDropPreviewIterator
                            files={filesToUpload}
                            handleDeleteFile={this.handleDeleteFile}
                            handleCancelFile={this.handleCancelFile}
                            handlePauseFile={this.handlePauseFile}
                            handleResumeFile={this.handleResumeFile}
                            areAssetsDownloadable={areAssetsDownloadable}
                            areAssetsEditable={areAssetsEditable}/>
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
