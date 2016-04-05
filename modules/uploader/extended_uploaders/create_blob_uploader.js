import React from 'react';

import uploaderSpecExtender from '../utils/uploader_spec_extender';


const { func } = React.PropTypes;

const CreateBlobUploader = (Uploader) => {
    return React.createClass(uploaderSpecExtender({
        displayName: 'CreateBlobUploader',

        propTypes: {
            handleBlobCreation: func

            // All other props will be passed through to ReactS3FineUploader
        },

        onUploadSuccess(file, ...args) {
            const { uploader } = this.refs;

            const createBlobPromise = new Promise((resolve, reject) => {
                const {
                    invoked,
                    result: blobPromise
                } = safeInvoke(this.props.handleBlobCreation, file);

                if (invoked) {
                    const statusPromise = uploader.setStatusOfFile(file.id, FileStatus.CREATING_BLOB);

                    return Promise.all([blobPromise, statusPromise]);
                } else {
                    throw new Error('handleBlobCreation() was not provided to CreateBlobUploader. ' +
                                    'Continuing without creating the blob on the server.');
                }
            });

            createBlobPromise
                .then(([changeSet]) => {
                    return uploader.setStatusOfFile(file.id, FileStatus.CREATED_BLOB, changeSet);
                })
                .catch((err) => {
                    console.warn(err);
                    return uploader.setStatusOfFile(file.id, FileStatus.FAILED_BLOB);
                })
                .then((updatedFile) => {
                    safeInvoke(this.props.onSuccess, updatedFile, ...args); //eslint-disable-line react/prop-types
                });
        },

        render() {
            const {
                handleBlobCreation, // ignore
                ...uploaderProps
            } = this.props;

            return (
                <Uploader
                    ref="uploader"
                    {...uploaderProps}
                    onSuccess={this.onUploadSuccess} />
            );
        }
    }));
};

export default CreateBlobUploader;
