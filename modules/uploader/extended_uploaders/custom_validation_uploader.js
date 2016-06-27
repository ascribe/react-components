import coreIncludes from 'core-js/library/fn/array/includes';

import React from 'react';

import { extractFileExtensionFromString } from 'js-utility-belt/es6/file';

import ValidationErrors from '../constants/validation_errors';

import { validFilesFilter } from '../utils/file_filters';
import uploaderSpecExtender from '../utils/uploader_spec_extender';

import { uploaderValidationShape } from '../../prop_types';


const { arrayOf, bool, func } = React.PropTypes;

const BASE_VALIDATORS = [
    // Is within max size
    (file, { sizeLimit }) => {
        const result = !sizeLimit || file.size <= sizeLimit;

        return result ? { result } : {
            result,
            error: {
                description: {
                    fileSize: file.size,
                    limit: sizeLimit
                },
                type: ValidationErrors.SIZE
            }
        };
    },
    // Is larger than min size
    (file, { minSizeLimit }) => {
        const result = !minSizeLimit || file.size >= minSizeLimit;

        return result ? { result } : {
            result,
            error: {
                description: {
                    fileSize: file.size,
                    minLimit: minSizeLimit
                },
                type: ValidationErrors.SIZE
            }
        };
    },
    // Is in allowed extensions
    (file, { allowedExtensions }) => {
        const fileExtension = extractFileExtensionFromString(file.name);
        const result = !allowedExtensions || coreIncludes(allowedExtensions, fileExtension);

        return result ? { result } : {
            result,
            error: {
                description: { allowedExtensions, fileExtension },
                type: ValidationErrors.EXTENSION
            }
        };
    }
];

const CustomValidationUploader = (Uploader) => (
    React.createClass(uploaderSpecExtender({
        displayName: 'CustomValidationUploader',

        propTypes: {
            /**
             * Custom validation tests that can be provided on top of the default tests. See
             * BASE_VALIDATORS for an example of their format.
             *
             * Expects an array of tests functions with the signature:
             * @param {object[]} tests
             *   @param  {object}  file       File to test
             *   @param  {object}  validation Validation spec given to the Uploader
             *   @return {object}             Result obj:
             *     @return {boolean}  result    Return true if the validation passes. If returns
             *                                  false, the file that failed will be added to
             *                                  `onValidationError`'s errors array with the
             *                                  associated error that's passed back for this test.
             *
             *     @return {object}   error   Error object describing the error and its type:
             *       @return {object}           description Description of the error
             *       @return {ValidationError}  type        Type of error
             */
            customValidators: arrayOf(func),

            /**
             * Called when validation fails for a group of selected files. All selected files, as
             * well as all passed files, are given in addition to the errors to allow for
             * flexibility in displaying information to the user.
             *
             * It is expected that `onValidationError` returns an array of files (or a a promise
             * that resolves with an array of files) to be submitted to the uploader. The promise
             * can be useful in situations where you may want to pose a blocking action to the user,
             * such as an info modal or file selector (eg. if too many files are selected), before
             * proceeding with submitting any files to the uploader. Returning or resolving with an
             * empty array or something that is not an array will ignore the files and submit
             * nothing to the uploader. Rejecting the promise will also do this.
             *
             * Note that if `onSubmitFiles is also defined (either explicitly or implicity through
             * another uploader extension), it will be called with the array returned from here.
             *
             * @param  {object[]} errors Array of errors describing each validation error
             *   @param  {object}   error  Each error object contains:
             *     @param  {File}     error.file            File that failed validation
             *     @param  {object}   error.validationError Error object describing the validation error:
             *       @param  {object}           validationError.description Description of the error
             *       @param  {ValidationErrors} validationError.type        Type of the error
             * @param  {object[]} passed All files passing validation
             * @param  {object[]} files  All selected files
             * @return {File[]|Promise}  Either a promise that resolves with an array of files or
             *                           actual array of files that will be submitted to the
             *                           uploader. If `onSubmitFiles` is also defined, it will be
             *                           called with these files.
             */
            onValidationError: func,

            // All other props will be passed through to Uploader, the following are just listed for
            // convenience they're used in this component
            /* eslint-disable react/sort-prop-types */
            multiple: bool,
            validation: uploaderValidationShape
            /* eslint-enable react/sort-prop-types */
        },

        getDefaultProps() {
            return {
                onSubmitFiles: (files) => files,
                onValidationError: (errors, passed) => passed
            };
        },

        validateFiles(files) {
            const {
                customValidators = [],
                multiple,
                onValidationError,
                validation: validationSpec = {}
            } = this.props;
            const { itemLimit } = validationSpec;

            const validFiles = [];
            let errors = [];

            const numCurrentFiles = this.refs.uploader.getFiles().filter(validFilesFilter).length;

            if ((!multiple && (files.length > 1 || numCurrentFiles) ||
                (itemLimit && (numCurrentFiles + files.length) > itemLimit))) {
                // If too many files are given, error them all and let the `onValidationError`
                // callback handle which, if any, are actually submitted (none by default). This
                // also includes the case that the item limit is surpassed because of the currently
                // selected files.
                //
                // Note that although multiple may be set to false so the user shouldn't be able to
                // select more than one file using the file selector, he could always drag multiple
                // files into the dropzone.
                const validationError = {
                    description: {
                        limit: itemLimit,
                        numSelected: files.length,
                        remaining: itemLimit - numCurrentFiles
                    },
                    type: ValidationErrors.FILE_LIMIT
                };

                errors = files.map((file) => ({ file, validationError }));
            } else {
                const validators = [...BASE_VALIDATORS, ...customValidators];

                files.forEach((file) => {
                    const error = validators.reduce((foundError, validator) => {
                        if (foundError) {
                            return foundError;
                        }

                        const validatorResult = validator(file, validationSpec);
                        return validatorResult.result ? null : validatorResult.error;
                    }, null);

                    if (error) {
                        errors.push({ file, error });
                    } else {
                        validFiles.push(file);
                    }
                });
            }

            return !errors.length ? validFiles
                                  : onValidationError(errors, validFiles, files);
        },

        onSubmitFiles(files) {
            const { onSubmitFiles } = this.props;

            return Promise.resolve(this.validateFiles(files))
                .then((validatedFiles) => (
                    Array.isArray(validatedFiles) && validatedFiles.length
                        ? onSubmitFiles(validatedFiles) : []
                ));
        },

        render() {
            const {
                customValidators: ignoredCustomValidators, // ignore
                onValidationError: ignoredOnValidationError, // ignore
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

export default CustomValidationUploader;
