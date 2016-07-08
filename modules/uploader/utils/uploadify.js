import React from 'react';

import uploaderSpecExtender from './uploader_spec_extender';

import ReactS3FineUploader from '../react_s3_fine_uploader';


const { func, object } = React.PropTypes;

/**
 * Convenience wrapper around uploader UIs to add an uploader above them.
 *
 * This should be used at the top of the uploader UI component tree to keep the UI components below
 * the uploader, giving them access to the Uploader API.
 *
 * In the case where you want to compose an extension on top of a component that should be wrapped
 * with Uploadify, make sure to wrap Uploadify around the top-most extension. For this reason,
 * components that use Uploadify should also make sure to expose another non-Uploadify version that
 * can be extended by others.
 */
const Uploadify = (Component) => (
    React.createClass(uploaderSpecExtender({
        displayName: 'Uploadify',

        propTypes: {
            uploaderProps: object,
            uploaderType: func

            // All other props will be passed to the Component
        },

        getDefaultProps() {
            return {
                uploaderProps: {},
                uploaderType: ReactS3FineUploader
            };
        },

        render() {
            const { uploaderProps, uploaderType: UploaderType, ...componentProps } = this.props;

            return (
                <UploaderType ref="uploader" {...uploaderProps}>
                    <Component {...componentProps} />
                </UploaderType>
            );
        }
    }))
);

export default Uploadify;
