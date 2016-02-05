'use strict';

import React from 'react';
import classNames from 'classnames';

import { displayValidProgressFilesFilter, FileStatus } from '../react_s3_fine_uploader_utils';
import { getLangText } from '../../../utils/lang_utils';
import { truncateTextAtCharIndex } from '../../../utils/general_utils';

const { func, array, bool, shape, string } = React.PropTypes;


export default function UploadButton({ className = 'btn btn-default btn-sm', showLabel = true } = {}) {
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

        getInitialState() {
            return {
                disabled: this.getUploadingFiles().length !== 0
            };
        },

        componentWillReceiveProps(nextProps) {
            if(this.props.filesToUpload !== nextProps.filesToUpload) {
                this.setState({
                    disabled: this.getUploadingFiles(nextProps.filesToUpload).length !== 0
                });
            }
        },

        handleDrop(event) {
            event.preventDefault();
            event.stopPropagation();
            let files = event.target.files;

            if(typeof this.props.onDrop === 'function' && files) {
                this.props.onDrop(files);
            }
        },

        getUploadingFiles(filesToUpload = this.props.filesToUpload) {
            return filesToUpload.filter((file) => file.status === FileStatus.UPLOADING);
        },

        getUploadedFile() {
            return this.props.filesToUpload.filter((file) => file.status === FileStatus.UPLOAD_SUCCESSFUL)[0];
        },

        clearSelection() {
            this.refs.fileSelector.getDOMNode().value = '';
        },

        handleOnClick() {
            if(!this.state.disabled) {
                let evt;

                // First, remove any currently uploading or uploaded items
                this.onClickRemove();

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
                evt.stopPropagation();
                this.refs.fileSelector.getDOMNode().dispatchEvent(evt);
            }
        },

        onClickRemove() {
            const uploadingFiles = this.getUploadingFiles();
            const uploadedFile = this.getUploadedFile();

            this.clearSelection();
            if(uploadingFiles.length) {
                this.props.handleCancelFile(uploadingFiles[0].id);
            } else if(uploadedFile && !uploadedFile.s3UrlSafe) {
                this.props.handleCancelFile(uploadedFile.id);
            } else if(uploadedFile && uploadedFile.s3UrlSafe) {
                this.props.handleDeleteFile(uploadedFile.id);
            }
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
            if (showLabel) {
                const uploadedFile = this.getUploadedFile();
                const uploadingFiles = this.getUploadingFiles();

                if (uploadingFiles.length) {
                    return (
                        <span>
                            {' ' + truncateTextAtCharIndex(uploadingFiles[0].name, 40) + ' '}
                            [<a onClick={this.onClickRemove}>{getLangText('cancel upload')}</a>]
                        </span>
                    );
                } else if (uploadedFile) {
                    return (
                        <span>
                            <span className='ascribe-icon icon-ascribe-ok'/>
                            {' ' + truncateTextAtCharIndex(uploadedFile.name, 40) + ' '}
                            [<a onClick={this.onClickRemove}>{getLangText('remove')}</a>]
                        </span>
                    );
                } else {
                    return <span>{getLangText('No file chosen')}</span>;
                }
            }
        },

        render() {
            const {
                multiple,
                allowedExtensions } = this.props;
            const { disabled } = this.state;


            /*
             * We do not want a button that submits here.
             * As UploadButton could be used in forms that want to be submitted independent
             * of clicking the selector.
             * Therefore the wrapping component needs to be an `anchor` tag instead of a `button`
             */
            return (
                <div className={classNames('ascribe-upload-button', {'ascribe-upload-button-has-label': showLabel})}>
                    {/*
                        The button needs to be of `type="button"` as it would
                        otherwise submit the form its in.
                    */}
                    <button
                        type="button"
                        onClick={this.handleOnClick}
                        className={className}
                        disabled={disabled}>
                        {this.getButtonLabel()}
                        <input
                            multiple={multiple}
                            ref="fileSelector"
                            type="file"
                            style={{
                                display: 'none',
                                height: 0,
                                width: 0
                            }}
                            onChange={this.handleDrop}
                            accept={allowedExtensions}/>
                   </button>
                   {this.getUploadedFileLabel()}
                </div>
            );
        }
    });
}
