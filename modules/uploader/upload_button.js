import React from 'react';
import CssModules from 'react-css-modules';

import { truncateText } from 'js-utility-belt/es6/text';

import Uploadify from './utils/uploadify';

import { uploadedFilesFilter, uploadingFilesFilter, validFilesFilter, validProgressFilesFilter } from './utils/file_filters';

import styles from './upload_button.scss';


const { arrayOf, bool, func, node, object, oneOfType, string } = React.PropTypes;

const FileLabel = CssModules(({ files, handleRemoveFiles }) => {
    let label = 'No file selected';

    if (files.length) {
        const labelText = files.length > 1 ? `${files.length} files`
                                           : truncateText(files[0].name, 40);

        label = [
            labelText,
            (<a key="remove-link" onClick={handleRemoveFiles} tabIndex={0}>remove</a>)
        ];
    }

    return (<span styleName="file-label">{label}</span>);
}, styles);

FileLabel.displayName = 'FileLabel';


const UploadButton = CssModules(React.createClass({
    propTypes: {
        buttonType: oneOfType([func, string]),
        children: node,
        className: string,
        disabled: bool,
        fileLabelType: func,

        /**
         * Get the button's label (ie. children) when an upload is in progress. By default, if you
         * provide children to this component, the children will be used as the label in all states.
         *
         * @param  {File[]}  uploaderFiles All files tracked by uploader
         * @param  {number}  progress      Total progress on set of valid files tracked by uploader
         * @return {node}                  Button label
         *
         */
        getUploadingButtonLabel: func,

        showFileLabel: bool,

        // Provided by ReactS3FineUploader
        uploaderFiles: arrayOf(object)

        // All other props and the disabled prop will be passed through to buttonType
    },

    contextTypes: {
        handleCancelFile: func.isRequired,
        handleDeleteFile: func.isRequired,
        handleSelectFiles: func.isRequired
    },

    getDefaultProps() {
        return {
            buttonType: 'button',
            children: 'upload', // Default button text to 'upload'
            fileLabelType: FileLabel,
            showFileLabel: true
        };
    },

    getUploadingButtonLabel() {
        const { children, getUploadingButtonLabel, uploaderFiles } = this.props;

        if (typeof getUploadingButtonLabel === 'function' && this.getUploadingFiles().length) {
            // Filter invalid files that might have been deleted or canceled before calculating progress
            const progressFiles = uploaderFiles.filter(validProgressFilesFilter);
            const progress = progressFiles
                .reduce((sum, file) => sum + file.progress, 0) / progressFiles.length;

            return getUploadingButtonLabel(uploaderFiles, progress);
        }

        return children;
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
            showFileLabel,
            uploaderFiles,
            buttonType: ButtonType,
            fileLabelType: FileLabelType,

            children: ignoredChildren, // ignore
            getUploadingButtonLabel: ignoredGetUploadingButtonLabel, // ignore
            // eslint-disable-next-line react/prop-types
            styles: ignoredStyles, // ignore, to avoid overriding ButtonType's styles with this component's styles

            ...buttonProps
        } = this.props;
        const buttonChildren = this.getUploadingButtonLabel();
        const validFiles = uploaderFiles.filter(validFilesFilter);

        const fileLabel = showFileLabel && FileLabelType ? (
            <FileLabelType
                files={validFiles}
                handleRemoveFiles={this.handleRemoveFiles} />
        ) : null;

        return (
            <span className={className} styleName="container">
                {/* The button needs to be of `type="button"` as it may be nested in a form that
                    should not be submitted through this button */}
                <ButtonType
                    {...buttonProps}
                    disabled={this.isDisabled()}
                    onClick={this.onFileSelect}
                    type="button">
                    {buttonChildren}
                </ButtonType>
                {fileLabel}
            </span>
        );
    }
}), styles);

export default Uploadify(UploadButton);

// Also export the non-uploadify version for extension
export {
    UploadButton as UploadButtonBase
};
