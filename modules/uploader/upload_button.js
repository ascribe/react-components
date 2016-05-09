import React from 'react';
import CssModules from 'react-css-modules';

import Uploadify from './utils/uploadify';

import Button from '../buttons/button';

import { uploadedFilesFilter, uploadingFilesFilter, validFilesFilter, validProgressFilesFilter } from './utils/file_filters';

import { truncateTextAtCharIndex } from '../utils/general';

import styles from './upload_button.scss';


const { arrayOf, bool, func, node, object, string } = React.PropTypes;

const FileLabel = CssModules(({ files, handleRemoveFiles }) => {
    let label = 'No file selected';

    if (files.length) {
        const labelText = files.length > 1 ? `${files.length} files`
                                           : truncateTextAtCharIndex(files[0].name, 40);

       label = [
           labelText,
           (<a key="remove-link" onClick={handleRemoveFiles}>remove</a>)
       ];
    }

    return (<span styleName="file-label">{label}</span>);
}, styles);

const UploadButton = React.createClass({
    propTypes: {
        buttonType: func,
        children: node,
        className: string,
        disabled: bool,

        /**
         * Get the button's label (ie. children). By default, if you provide children to this
         * component and do not provide this function, the children will be used as the label in
         * all states.
         *
         * @param  {boolean}  uploading     Whether there are files currently uploading
         * @param  {object[]} uploaderFiles All files tracked by uploader
         * @param  {number}   progress      Total progress on set of valid files tracked by uploader
         * @return {node}                   Button label
         *
        */
        getButtonLabel: func,

        fileLabelType: func,

        // Provided by ReactS3FineUploader
        uploaderFiles: arrayOf(object)

        // All other props and the disabled prop are passed to buttonType
    },

    contextTypes: {
        handleCancelFile: func.isRequired,
        handleDeleteFile: func.isRequired,
        handleSelectFiles: func.isRequired
    },

    getDefaultProps() {
        return {
            buttonType: Button,
            getButtonLabel: (uploading, uploaderFiles, progress) => {
                return uploading ? `Upload progress: ${progress}`
                                 : 'file';
            },
            fileLabelType: FileLabel
        };
    },

    getButtonLabel() {
        const { children, getButtonLabel, uploaderFiles } = this.props;

        if (children) {
            // If this component already has children, use them for the button label as is
            // consistent with other buttons.
            return children;
        }

        let uploading = false;
        let progress = 0;

        if (this.getUploadingFiles().length) {
            uploading = true;

            // Filter invalid files that might have been deleted or canceled before calculating progress
            const progressFiles = uploaderFiles.filter(validProgressFilesFilter);
            const progress = progressFiles.reduce((sum, file) => sum + file.progress, 0) / progressFiles.length;
        }

        return getButtonLabel(uploading, uploaderFiles, progress);
    },

    getUploadingFiles() {
        return this.props.uploaderFiles.filter(uploadingFilesFilter);
    },

    getUploadedFiles() {
        return this.props.uploaderFiles.filter(uploadedFilesFilter);
    },

    handleRemoveFiles() {
        const { handleCancelFile, handleDeleteFile } = this.context;

        this.getUploadingFiles().forEach(handleCancelFile);
        this.getUploadedFiles().forEach(handleDeleteFile);
    },

    isDisabled() {
        return this.props.disabled || this.getUploadingFiles().length;
    },

    onFileSelect() {
        if (!this.isDisabled()) {
            // First, remove any currently uploading or uploaded items before selecting more items
            // to upload
            this.handleRemoveFiles();

            this.context.handleSelectFiles();
        }
    },

    render() {
        const {
            className,
            uploaderFiles,
            buttonType: ButtonType,
            fileLabelType: FileLabelType,
            children, // ignore
            getButtonLabel, // ignore
            // eslint-disable-next-line react/prop-types
            styles, // ignore, to avoid overriding ButtonType's styles with this component's styles
            ...buttonProps
        } = this.props
        const buttonChildren = this.getButtonLabel();
        const validFiles = uploaderFiles.filter(validFilesFilter);

        return (
            <span className={className} styleName="container">
                {/* The button needs to be of `type="button"` as it may be nested in a form that
                    should not be submitted through this button */}
                <ButtonType {...buttonProps} onClick={this.onFileSelect} type="button">
                    {buttonChildren}
                </ButtonType>
                <FileLabelType
                    files={validFiles}
                    handleRemoveFiles={this.handleRemoveFiles} />
            </span>
        );
    }
});

export default Uploadify(CssModules(UploadButton, styles));
