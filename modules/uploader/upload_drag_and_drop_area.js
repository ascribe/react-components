import React from 'react';

import Uploadify from './utils/uploadify';

import { safeInvoke } from '../utils/general';


const { bool, func, node, string } = React.PropTypes;

// Initially based off of https://github.com/fedosejev/react-file-drag-and-drop
// We don't need something as heavy as react-dnd (https://github.com/gaearon/react-dnd) for this,
// as we just need to take care of the drop and drag events
let UploadDragAndDropArea = Uploadify(React.createClass({
    propTypes: {
        children: node,
        className: string,
        disabled: bool,
        onDragOver: func,

        /**
         * Called when a file was dropped into the drop zone. If this returns false, the dropped
         * file will be discarded
         *
         * @param  {Event}   event Drop event with the file
         * @return {boolean}       Return false to prevent the dropped file from being submitted
         *                         to the uploader
        */
        onDrop: func

        // All other props and the disabled prop will be passed to the children
    },

    contextTypes: {
        handleSelectFiles: func.isRequired,
        handleSubmitFiles: func.isRequired
    },

    onDragOver(event) {
        const { disabled, onDragOver } = this.props;

        event.preventDefault();

        if (!disabled) {
            safeInvoke(onDragOver, event);
        }
    },

    onDrop(event) {
        const { disabled, onDrop } = this.props;
        const { handleSelectFiles, handleSubmitFiles } = this.context;

        event.preventDefault();
        event.stopPropagation();

        if (!disabled) {
            const { invoked, shouldSubmit } = safeInvoke(onDrop, event);

            if (!invoked || shouldSubmit) {
                if (event.dataTransfer && event.dataTransfer.files.length) {
                    // Submit dropped files to the uploader
                    handleSubmitFiles(event.dataTransfer.files);
                } else {
                    // If somehow the browser doesn't give us any files or the user didn't drag any
                    // files, fallback to opening the file selector
                    handleSelectFiles();
                }
            }
        }
    },

    render() {
        const {
            children,
            className,
            onDragOver, // ignore
            onDrop, // ignore
            ...childProps
        } = this.props;

        return (
            <div
                className={className}
                onDragOver={this.onDragOver}
                onDrop={this.onDrop}
                style={{
                    display: 'inline-block'
                }}>
                {React.Children.map(children, (child) => React.cloneElement(child, childProps))}
            </div>
        );
    }
}));

export default UploadDragAndDropArea;
