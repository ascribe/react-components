import React from 'react';

import uploaderSpecExtender from './uploader_spec_extender';

import ReactS3FineUploader from '../react_s3_fine_uploader';


const { func, object } = React.PropTypes;

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
