import React from 'react';

import { safeInvoke } from 'js-utility-belt/es6';

import FileStatus from '../constants/file_status';

import uploaderSpecExtender from '../utils/uploader_spec_extender';


const { func } = React.PropTypes;

const CreateBlobUploader = (Uploader) => (
    React.createClass(uploaderSpecExtender({
        displayName: 'CreateBlobUploader',

        propTypes: {
            /**
             * Called to handle blob creation for the given file.
             *
             * `handleBlobCreation` can optionally return an object representing an additional
             * changeset to be applied to the file representation kept by the uploader, based on
             * react-addons/update's signature, (or a promise resolving to this changeset when blob
             * creation is completed). Rejecting the returned promise with `'skipped'` will consider
             * the blob to be skipped while rejecting with anything else will fail blob creation.
             * Regardless of blob creation's success, the upload will still be considered a success
             * (ie. the uploader's `onSuccess` callback will still be invoked).
             *
             * @param  {File} file File to create blob for
             * @return {undefined|Object|Promise} Optional changeset (or promise resolving to the
             *                                    changeset) to be applied to the file
             *                                    representation kept by the uploader.
             *                                    Reject with `'skipped'` to mark the blob creation
             *                                    as skipped, or reject with anything else to mark
             *                                    it as failed.
             */
            handleBlobCreation: func

            // All other props will be passed through to Uploader
        },

        onUploadSuccess(file, ...args) {
            const { uploader } = this.refs;

            // Wrap handleBlobCreation in a promise to resolve it properly if it throws
            const createBlobPromise = new Promise((resolve) => {
                const {
                    invoked,
                    result: handleBlobCreationResult
                } = safeInvoke(this.props.handleBlobCreation, file);

                if (invoked) {
                    const statusPromise = uploader.setStatusOfFile(file.id, FileStatus.CREATING_BLOB);

                    resolve(Promise.all([handleBlobCreationResult, statusPromise]));
                } else {
                    throw new Error('handleBlobCreation() was not provided to CreateBlobUploader. ' +
                                    'Continuing without creating the blob on the server.');
                }
            });

            createBlobPromise
                // Grab the value resolved from handleBlobCreation and use it to add any additional
                // changes to the file
                .then(([blobCreationChangeSet]) => (
                    uploader.setStatusOfFile(file.id, FileStatus.CREATED_BLOB, blobCreationChangeSet)
                ))
                .catch((err) => {
                    let status;
                    if (err === 'skipped') {
                        status = FileStatus.SKIPPED_BLOB;
                    } else {
                        if (process.env.NODE_ENV !== 'production') {
                            console.warn(err); // eslint-disable-line no-console
                        }

                        status = FileStatus.FAILED_BLOB;
                    }

                    return uploader.setStatusOfFile(file.id, status);
                })
                // Act as a .finally() clause to resolve the promises returned from the .then()
                // and .catch() clauses above
                .then((updatedFile) => {
                    safeInvoke(this.props.onSuccess, updatedFile, ...args); // eslint-disable-line react/prop-types
                });
        },

        render() {
            const {
                handleBlobCreation: ignoredHandleBlobCreation, // ignore
                ...uploaderProps
            } = this.props;

            return (
                <Uploader
                    ref="uploader"
                    {...uploaderProps}
                    onSuccess={this.onUploadSuccess} />
            );
        }
    }))
);

export default CreateBlobUploader;
