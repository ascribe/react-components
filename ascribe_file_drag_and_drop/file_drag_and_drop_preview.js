'use strict';

import React from 'react';

import FileDragAndDropPreviewImage from './file_drag_and_drop_preview_image';
import FileDragAndDropPreviewOther from './file_drag_and_drop_preview_other';

import { getLangText } from '../../../utils/lang_utils';
import { truncateTextAtCharIndex } from '../../../utils/general_utils';
import { extractFileExtensionFromString } from '../../../utils/file_utils';


const { shape, string, number, func, bool } = React.PropTypes;

const FileDragAndDropPreview = React.createClass({
    propTypes: {
        file: shape({
            url: string,
            type: string,
            progress: number,
            id: number,
            status: string,
            s3Url: string,
            s3UrlSafe: string
        }).isRequired,

        handleDeleteFile: func,
        handleCancelFile: func,
        handlePauseFile: func,
        handleResumeFile: func,
        areAssetsDownloadable: bool,
        areAssetsEditable: bool,
        numberOfDisplayedFiles: number
    },

    toggleUploadProcess() {
        if (this.props.file.status === 'uploading') {
            this.props.handlePauseFile(this.props.file.id);
        } else if (this.props.file.status === 'paused') {
            this.props.handleResumeFile(this.props.file.id);
        }
    },

    handleDeleteFile() {
        const { handleDeleteFile,
                handleCancelFile,
                file } = this.props;
        // `handleDeleteFile` is optional, so if its not submitted, don't run it
        //
        // For delete though, we only want to trigger it, when we're sure that
        // the file has *completely* been uploaded to S3 and call now also be
        // deleted using an HTTP DELETE request.
        if (handleDeleteFile &&
            file.progress === 100 &&
            (file.status === 'upload successful' || file.status === 'online') &&
            file.s3UrlSafe) {
            handleDeleteFile(file.id);
        } else if (handleCancelFile) {
            handleCancelFile(file.id);
        }
    },

    handleDownloadFile() {
        if (this.props.file.s3Url) {
            // This simply opens a new browser tab with the url provided
            open(this.props.file.s3Url);
        }
    },

    getFileName() {
        const { numberOfDisplayedFiles, file } = this.props;

        if (numberOfDisplayedFiles === 1) {
            return (
                <span className="file-name">
                    {truncateTextAtCharIndex(file.name, 30, '(...).' + extractFileExtensionFromString(file.name))}
                </span>
            );
        } else {
            return null;
        }
    },

    getRemoveButton() {
        if (this.props.areAssetsEditable) {
            return (
                <div className="delete-file">
                    <span
                        className="glyphicon glyphicon-remove text-center"
                        aria-hidden="true"
                        title={getLangText('Remove file')}
                        onClick={this.handleDeleteFile}/>
                </div>
            );
        } else {
            return null;
        }
    },

    render() {
        const { file,
                areAssetsDownloadable,
                numberOfDisplayedFiles } = this.props;
        const innerStyle = numberOfDisplayedFiles === 1 ? { verticalAlign: 'middle' } : null;
        const outerStyle = numberOfDisplayedFiles !== 1 ? { display: 'inline-block' } : null;

        let previewElement;

        // Decide whether an image or a placeholder picture should be displayed
        // If a file has its `thumbnailUrl` defined, then we display it also as an image
        if (file.type.split('/')[0] === 'image' || file.thumbnailUrl) {
            previewElement = (
                <FileDragAndDropPreviewImage
                    onClick={this.handleDeleteFile}
                    progress={file.progress}
                    url={file.thumbnailUrl || file.url}
                    toggleUploadProcess={this.toggleUploadProcess}
                    areAssetsDownloadable={areAssetsDownloadable}
                    downloadUrl={file.s3UrlSafe}
                    showProgress={numberOfDisplayedFiles > 1} />
            );
        } else {
            previewElement = (
                <FileDragAndDropPreviewOther
                    onClick={this.handleDeleteFile}
                    progress={file.progress}
                    type={extractFileExtensionFromString(file.name)}
                    toggleUploadProcess={this.toggleUploadProcess}
                    areAssetsDownloadable={areAssetsDownloadable}
                    downloadUrl={file.s3UrlSafe}
                    showProgress={numberOfDisplayedFiles > 1} />
                );
        }

        return (
            <div style={outerStyle}>
                <div
                    style={innerStyle}
                    className="file-drag-and-drop-position">
                    {this.getRemoveButton()}
                    {previewElement}
                </div>
                {this.getFileName()}
            </div>
        );
    }
});

export default FileDragAndDropPreview;
