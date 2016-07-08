import React from 'react';
import CssModules from 'react-css-modules';

import { omitFromObject, safeInvoke } from 'js-utility-belt/es6';

import Uploadify from './utils/uploadify';

import styles from './upload_drag_and_drop_area.scss';


// Drag handlers that have no special action associated with them but should be passed through to
// the element handling drag and drop functionality.
const DRAG_HANDLERS = [
    'onDrag',
    'onDragEnd',
    'onDragEnter',
    'onDragExit',
    'onDragLeave',
    'onDragOver',
    'onDragStart'
];

const preventEventDefaultFn = (event) => {
    if (event) {
        event.preventDefault();
    }
};

const { bool, func, node, string } = React.PropTypes;

// Initially based off of https://github.com/fedosejev/react-file-drag-and-drop
// We don't need something as heavy as react-dnd (https://github.com/gaearon/react-dnd) for this,
// as we just need to take care of the drop and drag events
const UploadDragAndDropArea = CssModules(React.createClass({
    propTypes: {
        children: node,
        className: string,
        disabled: bool,

        // Create prop types for pass-through drag and drop handlers
        ...DRAG_HANDLERS.reduce((types, eventType) => {
            types[eventType] = func;
            return types;
        }, {}),

        /**
         * Special drag handler; called when any files are dropped into the drop zone. If this is
         * invoked and returns false, the dropped files will be discarded.
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

    handleDragEvent(eventType) {
        return (event) => {
            preventEventDefaultFn(event);

            if (!this.props.disabled) {
                const eventHandler = this.props[eventType];
                const { invoked, result } = safeInvoke(eventHandler, event);

                if (invoked) {
                    return result;
                }
            }

            return undefined;
        };
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
        const { children, className } = this.props;
        const childProps = omitFromObject(this.props, [...DRAG_HANDLERS, 'onDrop']);

        // Map handlers to any given callbacks
        const dragHandlers = DRAG_HANDLERS.reduce((handlers, eventType) => {
            handlers[eventType] = this.props[eventType] === 'function'
                ? this.handleDragEvent(eventType)
                // Prevent defaults of other events to avoid further event processing (see
                // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#Define_a_drop_zone)
                : preventEventDefaultFn;

            return handlers;
        }, {});

        return (
            <div
                className={className}
                {...dragHandlers}
                onDrop={this.onDrop}
                styleName="drag-and-drop-area">
                {React.Children.map(children, (child) => React.cloneElement(child, childProps))}
            </div>
        );
    }
}), styles);

export default Uploadify(UploadDragAndDropArea);

// Also export the non-uploadify version for extension
export {
    UploadDragAndDropArea as UploadDragAndDropAreaBase
};
