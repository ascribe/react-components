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

            // Wrap handleBlobCreation in a promise to resolve it properly if it throws
            createBlobPromise = new Promise((resolve, reject) => {
                const {
                    invoked,
                    result: handleBlobCreationPromise
                } = safeInvoke(this.props.handleBlobCreation, file);

                if (invoked) {
                    const statusPromise = uploader.setStatusOfFile(file.id, FileStatus.CREATING_BLOB);

                    resolve(Promise.all([handleBlobCreationPromise, statusPromise]));
                } else {
                    throw new Error('handleBlobCreation() was not provided to CreateBlobUploader. ' +
                                    'Continuing without creating the blob on the server.');
                }
            });

            createBlobPromise
                // Grab the value resolved from handleBlobCreation
                .then(([blobCreationChangeSet]) => {
                    return uploader.setStatusOfFile(file.id, FileStatus.CREATED_BLOB, blobCreationChangeSet);
                })
                .catch((err) => {
                    console.warn(err);
                    return uploader.setStatusOfFile(file.id, FileStatus.FAILED_BLOB);
                })
                // Act as a .finally() clause to resolve the promises returned from the .then()
                // and .catch() clauses above
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
