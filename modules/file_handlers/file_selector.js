import React from 'react';

import FileInput from './file_input';


const { bool, func, node } = React.PropTypes;

/**
 * Shim component that adds a hidden FileInput to handle native file selection, passing down its
 * file submit API through context so any child in the subtree (ie. a nested button) can trigger it
 */
const FileSelector = React.createClass({
    propTypes: {
        children: node.isRequired,
        disabled: bool,
        onSelectFiles: func

        // Any other props will be passed into the file input element (ie. accept, multiple, etc)
    },

    childContextTypes: {
        clearFileSelection: func,
        handleSelectFiles: func
    },

    getChildContext() {
        return {
            clearFileSelection: this.clearFileSelection,
            handleSelectFiles: this.handleSelectFiles
        };
    },

    clearFileSelection() {
        this.refs.fileInput.reset();
    },

    handleSelectFiles() {
        if (!this.props.disabled) {
            // Dispatch a fake click through the FileInput to show the native file selector
            this.refs.fileInput.dispatchClickEvent();
        }
    },

    onFileSelect(event) {
        const { target: { files } } = event;

        event.preventDefault();
        event.stopPropagation();

        if (files) {
            this.props.onSelectFiles(files);
        }
    },

    render() {
        const {
            children,
            disabled: ignoredDisabled, // ignore
            ...fileInputProps
        } = this.props;

        return (
            <span>
                {children}
                <FileInput
                    ref="fileInput"
                    {...fileInputProps}
                    onChange={this.onFileSelect} />
            </span>
        );
    }
});

export default FileSelector;
