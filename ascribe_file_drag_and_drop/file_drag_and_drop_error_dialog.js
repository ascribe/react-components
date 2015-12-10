'use strict';

import React from 'react';
import classNames from 'classnames';

import { ErrorClasses } from '../../../constants/error_constants';

import { getLangText } from '../../../utils/lang_utils';

let FileDragAndDropErrorDialog = React.createClass({
    propTypes: {
        errorClass: React.PropTypes.shape({
            name: React.PropTypes.string,
            prettifiedText: React.PropTypes.string
        }).isRequired,
        files: React.PropTypes.array.isRequired,
        handleRetryFiles: React.PropTypes.func.isRequired
    },

    getRetryButton(text, openIntercom) {
        return (
            <button
                type="button"
                className='btn btn-default'
                onClick={() => {
                    if (openIntercom) {
                        window.Intercom('showNewMessage', getLangText("I'm having trouble uploading my file."));
                    }

                    this.retryAllFiles()
                }}>
                {getLangText(text)}
            </button>
        );
    },

    getContactUsDetail() {
        return (
            <div className='file-drag-and-drop-error'>
                <h4>Let us help you</h4>
                <p>{getLangText('Still having problems? Send us a message.')}</p>
                {this.getRetryButton('Contact us', true)}
            </div>
        );
    },

    getErrorDetail(multipleFiles) {
        const { errorClass: { prettifiedText }, files } = this.props;

        return (
            <div className='file-drag-and-drop-error'>
                <div className={classNames('file-drag-and-drop-error-detail', { 'file-drag-and-drop-error-detail-multiple-files': multipleFiles })}>
                    <h4>{getLangText(multipleFiles ? 'Some files did not upload correctly'
                                                   : 'Error uploading the file!')}
                    </h4>
                    <p>{prettifiedText}</p>
                    {this.getRetryButton('Retry')}
                </div>
                <span className={classNames('file-drag-and-drop-error-icon-container', { 'file-drag-and-drop-error-icon-container-multiple-files': multipleFiles })}>
                    <span className='ascribe-icon icon-ascribe-thin-cross'></span>
                </span>
                <div className='file-drag-and-drop-error-file-names'>
                    <ul>
                        {files.map((file) => (<li key={file.id} className='file-name'>{file.originalName}</li>))}
                    </ul>
                </div>
            </div>
        );
    },

    retryAllFiles() {
        const { files, handleRetryFiles } = this.props;
        handleRetryFiles(files.map(file => file.id));
    },

    render() {
        const { errorClass: { name: errorName }, files } = this.props;

        const multipleFiles = files.length > 1;
        const contactUs = errorName === ErrorClasses.upload.contactUs.name;

        return contactUs ? this.getContactUsDetail() : this.getErrorDetail(multipleFiles);
    }
});

export default FileDragAndDropErrorDialog;
