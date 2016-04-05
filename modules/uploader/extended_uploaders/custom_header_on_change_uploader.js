import React from 'react';

import uploaderSpecExtender from '../utils/uploader_spec_extender';

import { safeInvoke } from '../../utils/general';


const { func } = React.PropTypes;

const CustomHeaderOnChangeUploader = (Uploader) => {
    return React.createClass(uploaderSpecExtender({
        displayName: 'CustomHeaderOnChangeUploader',

        propTypes: {
            /**
             * Invoked on every file submit or deletion request to check for whether the uploader's
             * request or delete headers should be changed.
             *
             * @param  {object} currentHeaders Current headers, including:
             *   @param {object}  currentHeaders.delete  Current delete custom headers
             *   @param {object}  currentHeaders.request Current request custom headers
             *
             * @return {object} return          New headers. If falsey or an empty object, no new
             *                                  custom headers are set. Includes:
             *   @return {object} return.delete   New delete custom headers
             *   @return {object} return.request  New request custom headers
             */
            shouldCustomHeaderChange: func

            // All other props will be passed through to ReactS3FineUploader
        },

        componentWillMount() {
            const {
                deleteFile: { customHeaders: deleteCustomHeaders } = {}, //eslint-disable-line react/prop-types
                request: { customHeaders: requestCustomHeaders } = {}, //eslint-disable-line react/prop-types
            } = this.props;

            // Keep track of the uploader's current custom headers.
            // Initially, these will just be the `deleteFile` and `request` props' customHeaders,
            // but may change if `shouldCustomHeaderChange()` returns new headers.
            //
            // We set these directly on the component (as opposed to using state) since they don't
            // have anything to do with the rendering of the component.
            this.currentHeaders = {
                delete: deleteCustomHeaders,
                request: requestCustomHeaders
            };
        },

        handleCustomHeaderMayChange() {
            const { shouldCustomHeaderChange } = this.props;

            const {
                invoked,
                result: newHeaders
            } = safeInvoke(shouldCustomHeaderChange, this.currentHeaders);

            if (invoked && newHeaders && Object.keys(newHeaders).length) {
                const uploader = this.refs.uploader.getUploader();

                // So far, FineUploader only provides an API to set the request and delete file
                // custom headers. In the future, there may be additional methods available that
                // allow us to change the custom headers for sessions, signatures, and
                // uploadSuccesses.

                if (newHeaders.request) {
                    uploader.setCustomHeaders(newHeaders.request);
                }

                if (newHeaders.delete) {
                    uploader.setDeleteFileCustomHeaders(newHeaders.delete);
                }

                this.currentHeaders = Object.assign(this.currentHeaders, newHeaders);
            }
        },

        onDelete(...args) {
            this.handleCustomHeaderMayChange();

            safeInvoke(this.props.onDelete, ...args); //eslint-disable-line react/prop-types
        },

        onSubmitFiles(...args) {
            this.handleCustomHeaderMayChange();

            safeInvoke(this.props.onSubmitFiles, ...args); //eslint-disable-line react/prop-types
        },

        render() {
            const {
                shouldCustomHeaderChange, // ignore
                ...uploaderProps
            } = this.props;

            return (
                <Uploader
                    ref="uploader"
                    {...uploaderProps}
                    onDelete={this.onDelete}
                    onSubmitFiles={this.onSubmitFiles} />
            );
        }
    }));
};

export default CustomHeaderOnChangeUploader;
