import React from 'react';

import { createTextFile, computeFileHash } from 'js-utility-belt/es6/file';
import { safeInvoke } from 'js-utility-belt/es6';

import uploaderSpecExtender from '../utils/uploader_spec_extender';


const { func } = React.PropTypes;

const FileHashUploader = (Uploader) => (
    React.createClass(uploaderSpecExtender({
        displayName: 'FileHashUploader',

        propTypes: {
            /**
             * Called when hashing any of the submitted files fails for any reason.
             *
             * @param {Error} error Error from hashing
             */
            onFileHashError: func,

            /**
             * Called on every progress notification of a hashing file.
             *
             * @param  {File}    file     File being hashed
             * @param  {number}  progress Progress as a percentage
             * @return {boolean}          Returning `false` from `onFileHashProgress` will stop and
             *                            cancel the file from being hashed. Note that doing this
             *                            for a single file in the current implementation will also
             *                            fail the entire set of hashing files, ending up with a
             *                            call to `onFileHashError`.
             */
            onFileHashProgress: func,

            /**
             * Called when hashing of the submitted files succeeds.
             *
             * It is expected that `onFileHashSuccess` returns either an array of files (or a
             * promise resolving to an array of files) to be submitted to the uploader. Returning
             * or resolving with an empty array or something that is not an array will ignore the
             * files and submit nothing to the uploader. Rejecting the promise will also do this.
             *
             * Note that if `onSubmitFiles is also defined (either explicitly or implicity through
             * another uploader extension), it will be called with the array returned from here.
             *
             * @param  {File[]} files   Hashed version of files from the submitted ones
             * @return {File[]|Promise} Either a promise that resolves with an array of files or
             *                          actual array of files that will be submitted to the
             *                          uploader.
             */
            onFileHashSuccess: func,

            /**
             * Called on each submitted file to determine if this file should be hashed before being
             * submitted into the uploader.
             *
             * @param  {File}    file Submitted file
             * @return {boolean}      Whether or not to hash the file
             */
            shouldHashFile: func

            // All other props will be passed through to Uploader
        },

        childContextTypes: {
            /**
             * Cancel all files being hashed and avoid submitting them to the uploader.
             */
            handleCancelHashing: func
        },

        defaultPropTypes: {
            // By default, hash every file
            shouldHashFile: () => true
        },

        getChildContext() {
            return {
                handleCancelHashing: this.handleCancelHashing
            };
        },

        handleCancelHashing() {
            // Set this directly on the component as it doesn't affect the component's rendering
            this.cancelHashing = true;
        },

        onSubmitFiles(files) {
            const {
                onFileHashError,
                onFileHashProgress,
                onFileHashSuccess,
                shouldHashFile
            } = this.props;

            // Reset cancellation state
            this.cancelHashing = false;

            // Just try to hash all the files simulataneously.
            // This is somewhat naive in terms of error handling since Promise.all fails fast; if
            // this becomes problematic we could only hash one at a time and provide more grainular
            // error callbacks.
            const hashPromises = files.map((file) => {
                if (!shouldHashFile(file)) {
                    return file;
                }

                const onProgress = (...params) => {
                    const { result } = safeInvoke(onFileHashProgress, file, ...params);

                    // If the callback's invoked and returns `false`, we should cancel hashing
                    if (result === false) {
                        // If any file has been cancelled, cancel the rest as well
                        this.cancelHashing = true;
                    }

                    // As above, also need to reutrn `false` to signal cancellation.
                    return this.cancelHashing ? false : result;
                };

                return computeFileHash(file, onProgress)
                    .then((hash) => createTextFile(hash, `hash-of-${file}`, file));
            });

            return Promise
                .all(hashPromises)
                // If callbacks were not provided, this will pass through any resolution onto the
                // next .then() / .catch() clause
                .then(onFileHashSuccess)
                .catch(onFileHashError);
        },

        render() {
            const {
                shouldHashFile: ignoredShouldHashFile, // ignore
                onFileHashError: ignoredOnFileHashError, // ignore
                onFileHashProgress: ignoredOnFileHashProgress, // ignore
                onFileHashSuccess: ignoredOnFileHashSuccess, // ignore
                ...uploaderProps
            } = this.props;

            return (
                <Uploader
                    ref="uploader"
                    {...uploaderProps}
                    onSubmitFiles={this.onSubmitFiles} />
            );
        }
    }))
);

export default FileHashUploader;
