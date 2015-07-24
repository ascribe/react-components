'use strict';

import React from 'react';

import FileDragAndDropDialog from './file_drag_and_drop_dialog';
import FileDragAndDropPreviewIterator from './file_drag_and_drop_preview_iterator';

import AppConstants from '../../constants/application_constants';

import { getLangText } from '../../utils/lang_utils';

// Taken from: https://github.com/fedosejev/react-file-drag-and-drop
let FileDragAndDrop = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        onDragStart: React.PropTypes.func,
        onDrop: React.PropTypes.func.isRequired,
        onDrag: React.PropTypes.func,
        onDragEnter: React.PropTypes.func,
        onLeave: React.PropTypes.func,
        onDragLeave: React.PropTypes.func,
        onDragOver: React.PropTypes.func,
        onDragEnd: React.PropTypes.func,
        filesToUpload: React.PropTypes.array,
        handleDeleteFile: React.PropTypes.func,
        handleCancelFile: React.PropTypes.func,
        handlePauseFile: React.PropTypes.func,
        handleResumeFile: React.PropTypes.func,
        multiple: React.PropTypes.bool,
        dropzoneInactive: React.PropTypes.bool,
        areAssetsDownloadable: React.PropTypes.bool,
        areAssetsEditable: React.PropTypes.bool,

        // triggers a FileDragAndDrop-global spinner
        hashingProgress: React.PropTypes.number
    },

    handleDragStart(event) {
        if (typeof this.props.onDragStart === 'function') {
            this.props.onDragStart(event);
        }
    },

    handleDrag(event) {
        if (typeof this.props.onDrag === 'function') {
            this.props.onDrag(event);
        }
    },

    handleDragEnd(event) {
        if (typeof this.props.onDragEnd === 'function') {
          this.props.onDragEnd(event);
        }
    },

    handleDragEnter(event) {
        if (typeof this.props.onDragEnter === 'function') {
            this.props.onDragEnter(event);
        }
    },

    handleDragLeave(event) {
        if (typeof this.props.onDragLeave === 'function') {
            this.props.onDragLeave(event);
        }
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
        // input's value is not change the second time someone
        // inputs the same file again, therefore we need to reset its value
        this.refs.fileinput.getDOMNode().value = '';
        this.props.handleDeleteFile(fileId);
    },

    handleCancelFile(fileId) {
        // input's value is not change the second time someone
        // inputs the same file again, therefore we need to reset its value
        this.refs.fileinput.getDOMNode().value = '';
        this.props.handleCancelFile(fileId);
    },

    handlePauseFile(fileId) {
        // input's value is not change the second time someone
        // inputs the same file again, therefore we need to reset its value
        this.refs.fileinput.getDOMNode().value = '';
        this.props.handlePauseFile(fileId);
    },

    handleResumeFile(fileId) {
        // input's value is not change the second time someone
        // inputs the same file again, therefore we need to reset its value
        this.refs.fileinput.getDOMNode().value = '';
        this.props.handleResumeFile(fileId);
    },

    handleOnClick() {
        // when multiple is set to false and the user already uploaded a piece,
        // do not propagate event
        if(this.props.dropzoneInactive) {
            return;
        }

        // Firefox only recognizes the simulated mouse click if bubbles is set to true,
        // but since Google Chrome propagates the event much further than needed, we
        // need to stop propagation as soon as the event is created
        var evt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });

        evt.stopPropagation();
        this.refs.fileinput.getDOMNode().dispatchEvent(evt);
    },

    render: function () {
        // has files only is true if there are files that do not have the status deleted or canceled
        let hasFiles = this.props.filesToUpload.filter((file) => file.status !== 'deleted' && file.status !== 'canceled' && file.size !== -1).length > 0;
        let className = hasFiles ? 'has-files ' : '';
        className += this.props.dropzoneInactive ? 'inactive-dropzone' : 'active-dropzone';
        className += this.props.className ? ' ' + this.props.className : '';

        // if !== -1: triggers a FileDragAndDrop-global spinner
        if(this.props.hashingProgress !== -1) {
            return (
                <div className={className}>
                    <p>{getLangText('Computing hashes... This may take a few minutes.')}</p>
                    <p>{this.props.hashingProgress}</p>
                    <img
                        height={35}
                        className="action-file"
                        src={AppConstants.baseUrl + 'static/img/ascribe_animated_medium.gif'} />
                </div>
            );
        } else {
            return (
                <div
                    className={className}
                    onDragStart={this.handleDragStart}
                    onDrag={this.handleDrop}
                    onDragEnter={this.handleDragEnter}
                    onDragLeave={this.handleDragLeave}
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDrop}
                    onDragEnd={this.handleDragEnd}>
                        <FileDragAndDropDialog
                            multipleFiles={this.props.multiple}
                            hasFiles={hasFiles}
                            onClick={this.handleOnClick}/>
                        <FileDragAndDropPreviewIterator
                            files={this.props.filesToUpload}
                            handleDeleteFile={this.handleDeleteFile}
                            handleCancelFile={this.handleCancelFile}
                            handlePauseFile={this.handlePauseFile}
                            handleResumeFile={this.handleResumeFile}
                            areAssetsDownloadable={this.props.areAssetsDownloadable}
                            areAssetsEditable={this.props.areAssetsEditable}/>
                        <input
                            multiple={this.props.multiple}
                            ref="fileinput"
                            type="file"
                            style={{
                                display: 'none',
                                height: 0,
                                width: 0
                            }}
                            onChange={this.handleDrop} />
                </div>
          );
        }
    }
});

export default FileDragAndDrop;
