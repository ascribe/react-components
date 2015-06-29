'use strict';

import React from 'react';

import FileDragAndDropPreviewImage from './file_drag_and_drop_preview_image';
import FileDragAndDropPreviewOther from './file_drag_and_drop_preview_other';


let FileDragAndDropPreview = React.createClass({

    propTypes: {
        file: React.PropTypes.shape({
            url: React.PropTypes.string,
            type: React.PropTypes.string
        }).isRequired,
        handleDeleteFile: React.PropTypes.func,
        handleCancelFile: React.PropTypes.func
    },

    toggleUploadProcess() {

    },

    handleDeleteFile() {
        // handleDeleteFile is optional, so if its not submitted,
        // don't run it
        // On the other hand, if the files progress is not yet at a 100%,
        // just run fineuploader.cancel
        if(this.props.handleDeleteFile && this.props.file.progress === 100) {
            this.props.handleDeleteFile(this.props.file.id);
        } else if(this.props.handleCancelFile && this.props.file.progress !== 100) {
            this.props.handleCancelFile(this.props.file.id);
        }
    },

    // implement a handle cancel action here that triggers fineuploaders cancel method
    // to delete files that are currently uploading

    render() {
        let previewElement;

        // Decide whether an image or a placeholder picture should be displayed
        if(this.props.file.type.split('/')[0] === 'image') {
            previewElement = (<FileDragAndDropPreviewImage
                                onClick={this.handleDeleteFile}
                                progress={this.props.file.progress}
                                url={this.props.file.url}
                                toggleUploadProcess={this.toggleUploadProcess}/>);
        } else {
            previewElement = (<FileDragAndDropPreviewOther
                                onClick={this.handleDeleteFile}
                                progress={this.props.file.progress}
                                type={this.props.file.type.split('/')[1]}
                                toggleUploadProcess={this.toggleUploadProcess}/>);
        }

        return (
            <div
                className="file-drag-and-drop-position">
                {previewElement}
            </div>
        );
    }
});

export default FileDragAndDropPreview;