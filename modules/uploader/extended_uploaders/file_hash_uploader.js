import React from 'react';

import { createTextFile, computeFileHash } from 'js-utility-belt/es6/file';
import { safeInvoke } from 'js-utility-belt/es6';

import uploaderSpecExtender from '../utils/uploader_spec_extender';


const { func } = React.PropTypes;

const FileHashUploader = (Uploader) => (
    React.createClass(uploaderSpecExtender({
        displayName: 'FileHashUploader',

        // Component state that doesn't need to be tracked by React
        nextHashId: 0,

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
             *
             * @param  {number}  hashId   Unique, incrementing id between files that are being hashed.
             *                            Starts from 0 so the id can be used as an array index.
             *
             *                            Useful if you need to keep track of each file's progress
             *                            during hashing, as their uploader ids will not be
             *                            available until they are actually submitted to the
             *                            uploader (using the file's name is unsafe since it's not
             *                            unique).
             *
             *                            Note that this is **NOT** the same as `file.id` that will
             *                            be available on the files after they have been submitted
             *                            to the uploader. Use this id only to keep track of files
             *                            during the hashing step.
             *
             * @param  {number}  progress Progress as a percentage
             * @return {boolean}          Returning `false` from `onFileHashProgress` will stop and
             *                            cancel the file from being hashed. Note that doing this
             *                            for a single file in the current implementation will also
             *                            fail the entire set of hashing files, ending up with a
             *                            call to `onFileHashError`.
             */
            onFileHashProgress: func,

            /**
             * Called when hashing of the submitted files succeed.
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

        getDefaultProps() {
            return {
                // By default, hash every file
                shouldHashFile: () => true
            };
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
                onSubmitFiles,
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

                const hashId = ++this.nextHashId;

                const onProgress = (...args) => {
                    const { result } = safeInvoke(onFileHashProgress, file, hashId, ...args);

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
                // If any of the callbacks are not provided, the promise resolution will be passed
                // through onto the next .then() / .catch() clause that does have a defined
                // function, letting us skip defining defaults for these callbacks.
                .then(onFileHashSuccess)
                .then(onSubmitFiles)
                .catch(onFileHashError);
        },

        render() {
            const {
                onFileHashError: ignoredOnFileHashError, // ignore
                onFileHashProgress: ignoredOnFileHashProgress, // ignore
                onFileHashSuccess: ignoredOnFileHashSuccess, // ignore
                shouldHashFile: ignoredShouldHashFile, // ignore
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
