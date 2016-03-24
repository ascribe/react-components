import React from 'react';

import ReactS3FineUploader from '../react_s3_fine_uploader';


const { func, object } = React.PropTypes;

const Uploadify = (Component) => {
    return React.createClass({
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
                <UploaderType {...uploaderProps}>
                    <Component {...componentProps} />
                </UploaderType>
            );
        }
    });
};

export default Uploadify;
