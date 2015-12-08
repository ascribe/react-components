'use strict';

import React from 'react';

import { displayValidProgressFilesFilter, FileStatus } from '../react_s3_fine_uploader_utils';
import { getLangText } from '../../../utils/lang_utils';
import { truncateTextAtCharIndex } from '../../../utils/general_utils';

const { func, array, bool, shape, string } = React.PropTypes;


export default function UploadButton({ className = 'btn btn-default btn-sm' } = {}) {
    return React.createClass({
        displayName: 'UploadButton',

        propTypes: {
            onDrop: func.isRequired,
            filesToUpload: array,
            multiple: bool,

            // For simplification purposes we're just going to use this prop as a
            // label for the upload button
            fileClassToUpload: shape({
                singular: string,
                plural: string
            }),

            allowedExtensions: string,

            // provided by ReactS3FineUploader
            handleCancelFile: func,
            handleDeleteFile: func
        },

        handleDrop(event) {
            event.preventDefault();
            event.stopPropagation();
            let files = event.target.files;

            if(typeof this.props.onDrop === 'function' && files) {
                this.props.onDrop(files);
            }
        },

        getUploadingFiles() {
            return this.props.filesToUpload.filter((file) => file.status === FileStatus.UPLOADING);
        },

        getUploadedFile() {
            return this.props.filesToUpload.filter((file) => file.status === FileStatus.UPLOAD_SUCESSFUL)[0];
        },

        handleOnClick() {
            const uploadingFiles = this.getUploadingFiles();
            const uploadedFile = this.getUploadedFile();

            if(uploadedFile) {
                this.props.handleCancelFile(uploadedFile.id);
            }
            if(uploadingFiles.length === 0) {
                // We only want the button to be clickable if there are no files currently uploading

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
            }
        },

        onClickRemove() {
            const uploadedFile = this.getUploadedFile();
            this.props.handleDeleteFile(uploadedFile.id);
        },

        getButtonLabel() {
            let { filesToUpload, fileClassToUpload } = this.props;

            // filter invalid files that might have been deleted or canceled...
            filesToUpload = filesToUpload.filter(displayValidProgressFilesFilter);

            if(this.getUploadingFiles().length !== 0) {
                return getLangText('Upload progress') + ': ' + Math.ceil(filesToUpload[0].progress) + '%';
            } else {
                return fileClassToUpload.singular;
            }
        },

        getUploadedFileLabel() {
            const uploadedFile = this.getUploadedFile();

            if(uploadedFile) {
                return (
                    <span>
                        <span className='ascribe-icon icon-ascribe-ok'/>
                        {' ' + truncateTextAtCharIndex(uploadedFile.name, 40) + ' '}
                        [<a onClick={this.onClickRemove}>{getLangText('remove')}</a>]
                    </span>
                );
            } else {
                return (
                    <span>{getLangText('No file chosen')}</span>
                );
            }
        },

        render() {
            let { multiple,
                 allowedExtensions } = this.props;

            /*
             * We do not want a button that submits here.
             * As UploadButton could be used in forms that want to be submitted independent
             * of clicking the selector.
             * Therefore the wrapping component needs to be an `anchor` tag instead of a `button`
             */
            return (
                <div className="upload-button-wrapper">
                    <a
                        onClick={this.handleOnClick}
                        className={className}
                        disabled={this.getUploadingFiles().length !== 0}>
                        {this.getButtonLabel()}
                        <input
                            multiple={multiple}
                            ref="fileinput"
                            type="file"
                            style={{
                                display: 'none',
                                height: 0,
                                width: 0
                            }}
                            onChange={this.handleDrop}
                            accept={allowedExtensions}/>
                   </a>
                   {this.getUploadedFileLabel()}
                </div>
            );
        }
    });
}
