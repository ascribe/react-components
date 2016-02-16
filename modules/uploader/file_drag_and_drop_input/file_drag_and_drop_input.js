'use strict';

import React from 'react';
import classNames from 'classnames';

import FileInput from '../file_input';
import FileStatus from '../file_status';

import { validFilesFilter } from '../utils/file_filters';

import { safeInvoke } from '../../utils/general';


const { array, arrayOf, bool, element, func, object, string } = React.PropTypes;

// Initially based off of https://github.com/fedosejev/react-file-drag-and-drop
let FileDragAndDropInput = React.createClass({
    propTypes: {
        children: oneOfType([
            element,
            arrayOf(element)
        ]),
        className: string,
        handleDragOver: func,

        // Provided by ReactS3FineUploader
        handleSubmitFile: func.isRequired,

        allowedExtensions: string,
        disabled: bool,
        multiple: bool
    },

    onDragOver(event) {
        event.preventDefault();

        safeInvoke(this.props.handleDragOver, event);
    },

    onFileSubmit(event) {
        const { disabled, handleSubmitFile } = this.props;

        event.preventDefault();
        event.stopPropagation();

        if (!disabled) {
            const { dataTransfer, target } = event;
            let files;

            if (dataTransfer && dataTransfer.files.length) {
                // Handle drag and dropped files
                files = dataTransfer.files;
            } else {
                // Handle normally selected files
                files = target.files;
            }

            if (files) {
                safeInvoke(handleSubmitFile, files);
            }
        }
    },

    clearSelection() {
        this.refs.fileSelector.reset();
    },

    handleOnClick() {
        // Do not propagate event if the drop zone's inactive, for example when multiple is set to
        // false and the user has already uploaded a piece
        if (!this.props.disabled) {
            // Dispatch a fake click through the fileSelector to show the native file selector
            this.refs.fileSelector.dispatchClickEvent();
        }
    },

    render() {
        const { allowedExtensions,
                children,
                className,
                multiple } = this.props;

        return (
            <div
                className={'file-drag-and-drop-input'}
                onDrag={this.onFileSubmit}
                onDragOver={this.onDragOver}
                onDrop={this.onFileSubmit}>
                {children}
                <FileInput
                    ref="fileSelector"
                    accept={allowedExtensions}
                    multiple={multiple}
                    onChange={this.onFileSubmit} />
            </div>
        );
    }
});

export default FileDragAndDrop;
