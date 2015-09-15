'use strict';

import React from 'react';

import FileDragAndDropPreviewImage from './file_drag_and_drop_preview_image';
import FileDragAndDropPreviewOther from './file_drag_and_drop_preview_other';


import { getLangText } from '../../../utils/lang_utils';

let FileDragAndDropPreview = React.createClass({

    propTypes: {
        file: React.PropTypes.shape({
            url: React.PropTypes.string,
            type: React.PropTypes.string
        }).isRequired,
        handleDeleteFile: React.PropTypes.func,
        handleCancelFile: React.PropTypes.func,
        handlePauseFile: React.PropTypes.func,
        handleResumeFile: React.PropTypes.func,
        areAssetsDownloadable: React.PropTypes.bool,
        areAssetsEditable: React.PropTypes.bool
    },

    toggleUploadProcess() {
        if(this.props.file.status === 'uploading') {
            this.props.handlePauseFile(this.props.file.id);
        } else if(this.props.file.status === 'paused') {
            this.props.handleResumeFile(this.props.file.id);
        }
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

    handleDownloadFile() {
        if(this.props.file.s3Url) {
            open(this.props.file.s3Url);
        }
    },

    render() {
        let previewElement;
        let removeBtn;

        // Decide whether an image or a placeholder picture should be displayed
        if(this.props.file.type.split('/')[0] === 'image') {
            previewElement = (<FileDragAndDropPreviewImage
                                onClick={this.handleDeleteFile}
                                progress={this.props.file.progress}
                                url={this.props.file.url}
                                toggleUploadProcess={this.toggleUploadProcess}
                                areAssetsDownloadable={this.props.areAssetsDownloadable}
                                downloadUrl={this.props.file.s3UrlSafe}/>);
        } else {
            previewElement = (<FileDragAndDropPreviewOther
                                onClick={this.handleDeleteFile}
                                progress={this.props.file.progress}
                                type={this.props.file.type.split('/')[1]}
                                toggleUploadProcess={this.toggleUploadProcess}
                                areAssetsDownloadable={this.props.areAssetsDownloadable}
                                downloadUrl={this.props.file.s3UrlSafe}/>);
        }

        if(this.props.areAssetsEditable) {
           removeBtn = (<div className="delete-file">
                            <span
                                className="glyphicon glyphicon-remove text-center"
                                aria-hidden="true"
                                title={getLangText('Remove file')}
                                onClick={this.handleDeleteFile}/>
                        </div>);
        }

        return (
            <div
                className="file-drag-and-drop-position">
                {removeBtn}
                {previewElement}
            </div>
        );
    }
});

export default FileDragAndDropPreview;
