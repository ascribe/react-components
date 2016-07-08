import React from 'react';

import { isShallowEqual, safeInvoke, sanitize } from 'js-utility-belt/es6';


const { bool, element, func } = React.PropTypes;

/**
 * Shim component to make uploaders derived from ReactS3FineUploader or Uploadify compatible with
 * Form Properties.
 *
 * As the uploaders are complex and maintain their own state, this Input component only propagates
 * changes in its value back to the parent Property and avoids being controlled by a parent
 * Property by ignoring the passed down `value` prop
 */
const InputUploader = React.createClass({
    propTypes: {
        children: element.isRequired,

        /**
         * Validation function that will be evaluated on every change of the uploader's files. If
         * the result is different from its previous result, `onFilesValidationChange` will be
         * called with the new and previous results.
         *
         * @param  {File[]} files Files currently in the uploader
         * @return {any}          Result that will be compared to the previous result
         */
        filesValidation: func,

        /**
         * Get an easy representation of a file that will be propagated to parents' `onChange`
         * handler with a mocked event. Forms will use the returned value from this function during
         * form submission.
         *
         * @param  {File} file File object
         * @return {any}       File representation. If `null` or `undefined` is returned, the file
         *                     won't be propagated to `onChange`.
         */
        getFileValue: func,

        // Used by Property as the `onChange` for an Input (not to be confused with an uploader
        // callback!).
        onChange: func,

        /**
         * Called whenever the `filesValidation` result is different from before.
         *
         * @param {any} prevResult Previous result of `filesValidation`
         * @param {any} nextResult New result of `filesValidation`
         */
        onFilesValidationChange: func,

        // Only used to signal for validation in Property
        required: bool
    },

    getDefaultProps() {
        return {
            getFileValue: (file) => file.name
        };
    },

    getInitialState() {
        // Initialize the fileValidation value by using an empty array as the uploader cannot
        // be initialized with files (if it has an existing session, this will be handled later
        // through `onFilesChanged`).
        const { invoked, result } = safeInvoke(this.props.filesValidation, []);

        return {
            filesValidation: invoked ? result : null
        };
    },

    shouldComponentUpdate(nextProps) {
        // Completely ignore state when determining updates as we don't use it in render
        return isShallowEqual(this.props, nextProps);
    },

    getFileValues(files) {
        const fileValues = sanitize(files.map(this.props.getFileValue));

        return fileValues.length ? fileValues : null;
    },

    // Required by Property API
    getValue() {
        return this.getFileValues(this.uploaderElement.getFiles());
    },

    reset() {
        this.uploaderElement.reset();
    },

    onChange(files) {
        const { filesValidation, onChange, onFilesValidationChange } = this.props;
        const { filesValidation: prevFilesValidation } = this.state;

        const { invoked, result: nextFilesValidation } = safeInvoke(filesValidation, files);
        if (invoked && nextFilesValidation !== prevFilesValidation) {
            safeInvoke(onFilesValidationChange, prevFilesValidation, nextFilesValidation);

            this.setState({
                filesValidation: nextFilesValidation
            });
        }

        // Propagate change up by faking an event's payload
        safeInvoke(onChange, {
            target: {
                value: this.getFileValues(files)
            }
        });
    },

    renderChildren() {
        // Ensure that only one uploader is used per InputUploader; if there is more than one child,
        // React.Children.only() will throw
        const child = React.Children.only(this.props.children);

        const childProps = {
            ref: (ref) => {
                this.uploaderElement = ref;

                // By attaching refs to the child from this component, we're overwriting any
                // already attached refs to the child. As we'd still like to allow parents
                // to register refs with the child uploader, we need to invoke the child's
                // callback ref with the ref we get here.
                safeInvoke({
                    fn: child.ref,
                    context: child,
                    params: [ref]
                });
            }
        };

        const handleFilesChanged = (childHandler) => (
            (files) => {
                safeInvoke(childHandler, files);

                this.onChange(files);
            }
        );

        if (child.type.displayName === 'Uploadify') {
            // If the child uploader is composed with Uploadify, we need to inject our change
            // handlers to the uploaderProps instead
            const { uploaderProps } = child.props;

            childProps.uploaderProps = {
                ...uploaderProps,
                onFilesChanged: handleFilesChanged(uploaderProps.onFilesChanged)
            };
        } else {
            childProps.onFilesChanged = handleFilesChanged(child.props.onFilesChanged);
        }

        return React.cloneElement(child, childProps);
    },

    render() {
        return this.renderChildren();
    }
});

export default InputUploader;
