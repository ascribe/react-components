import React from 'react';
import CssModules from 'react-css-modules';

import FileInput from '../file_input';
import FileStatus from '../file_status';

import ButtonContainer from '../../buttons/button_container';

import { successfullyUploadedFilter, uploadingFilter, validProgressFilesFilter } from '../utils/file_filters';

import { safeInvoke, truncateTextAtCharIndex } from '../../utils/general';

import styles from './upload_button.scss';


const { array, bool, func, string } = React.PropTypes;

export default function UploadButton({
            className = '',
            fileLabels = {
                singular: 'file',
                plural: 'files'
            },
            getDefaultButtonLabel = (multiple) => {
                return multiple ? fileLabels.plural : fileLabels.singular;
            },
            getUploadingButtonLabel = (progress) => {
                return `Upload progress: ${progress}%`;
            },
            getLabel = (files, handleRemoveFiles) => {
                if (files.length) {
                    return (
                        <span>
                            {` ${truncateTextAtCharIndex(uploadedFile.name, 40)} `}
                            <a onClick={handleRemoveFiles}>remove</a>
                        </span>
                    );
                } else {
                    return <span>No file chosen</span>;
                }
            }
        } = {}) {

    const Component = React.createClass({
        displayName: 'UploadButton',

        propTypes: {
            // Provided by ReactS3FineUploader
            filesToUpload: array.isRequired,
            handleCancelFile: func.isRequired,
            handleDeleteFile: func.isRequired,
            handleSubmitFile: func.isRequired,

            allowedExtensions: string,
            disabled: bool,
            multiple: bool
        },

        onFileSubmit(event) {
            const { handleSubmitFile } = this.props;
            const disabled = this.isDisabled();
            const files = event.target.files;

            event.preventDefault();
            event.stopPropagation();

            if (!disabled && files) {
                safeInvoke(handleSubmitFile, files);
            }
        },

        clearSelection() {
            this.refs.fileSelector.reset();
        },

        getButtonLabel() {
            const { filesToUpload, multiple } = this.props;

            if (this.getUploadingFiles().length) {
                // Filter invalid files that might have been deleted or canceled before finding progress
                const validFiles = filesToUpload.filter(validProgressFilesFilter);
                const progress = validFiles.reduce((sum, file) => sum + file.progress, 0) / validFiles.length;

                return getUploadingButtonLabel(progress);
            } else {
                return getDefaultButtonLabel(multiple);
            }
        },

        getUploadingFiles(filesToUpload = this.props.filesToUpload) {
            return filesToUpload.filter(uploadingFilter);
        },

        getUploadedFiles() {
            return this.props.filesToUpload.filter(successfullyUploadedFilter);
        },

        handleOnClick() {
            if (!this.isDisabled()) {
                // First, remove any currently uploading or uploaded items before selecting more
                // items to upload
                this.handleRemoveFiles();

                // Dispatch a fake click through the fileSelector to show the native file selector
                this.refs.fileSelector.dispatchClickEvent();
            }
        },

        handleRemoveFiles() {
            const { handleCancelFile, handleDeleteFile } = this.props;
            const uploadingFiles = this.getUploadingFiles();

            this.clearSelection();

            if (uploadingFiles.length) {
                uploadingFiles.forEach((file) => handleCancelFile(file.id));
            } else {
                this.getUploadedFiles().forEach((file) => handleDeleteFile(file.id));
            }
        },

        isDisabled() {
            return this.props.disabled || !!this.getUploadingFiles().length;
        },

        render() {
            const { allowedExtensions, filesToUpload, multiple } = this.props;
            const disabled = this.isDisabled();
            const buttonLabel = this.getButtonLabel();
            const label = getLabel(filesToUpload, this.handleRemoveFiles);

            return (
                <ButtonContainer label={label}>
                    {/* The button needs to be of `type="button"` as it may be nested in a form that should not
                        be submitted through this button */}
                    <button
                        className={className}
                        disabled={disabled}
                        onClick={this.handleOnClick}
                        styleName={'button'}
                        type="button">
                        {buttonLabel}
                        <FileInput
                            ref="fileSelector"
                            accept={allowedExtensions}
                            multiple={multiple}
                            onChange={this.onFileSubmit} />
                   </button>
                </ButtonContainer>
            );
        }
    });

    return CssModules(Component, styles);
}
