import React from 'react';
import CssModules from 'react-css-modules';

import Uploadify from './utils/uploadify';

import { safeInvoke } from '../utils/general';

import styles from './upload_drag_and_drop_area.scss';


const { bool, func, node, string } = React.PropTypes;

// Initially based off of https://github.com/fedosejev/react-file-drag-and-drop
// We don't need something as heavy as react-dnd (https://github.com/gaearon/react-dnd) for this,
// as we just need to take care of the drop and drag events
let UploadDragAndDropArea = React.createClass({
    propTypes: {
        children: node,
        className: string,
        disabled: bool,
        onDragOver: func,

        /**
         * Called when any files are dropped into the drop zone. If this returns false, the dropped
         * files will be discarded
         *
         * @param  {Event}   event Drop event with the files
         * @return {boolean}       Return false to prevent the dropped files from being submitted
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
        const { dataTransfer: { files } = {} } = event;

        event.preventDefault();
        event.stopPropagation();

        if (!disabled) {
            const { invoked, shouldSubmit } = safeInvoke(onDrop, event);

            if (!invoked || shouldSubmit !== false) {
                if (files && files.length) {
                    // Submit dropped files to the uploader
                    handleSubmitFiles(files);
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
                styleName="drag-and-drop-area">
                {React.Children.map(children, (child) => React.cloneElement(child, childProps))}
            </div>
        );
    }
});

export default Uploadify(CssModules(UploadDragAndDropArea, styles));
