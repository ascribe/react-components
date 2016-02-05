'use strict';

import fineUploader from 'fineUploader';

// Re-export qq.status from FineUploader with an additional online
// state that we use to keep track of files from S3.
export const FileStatus = Object.assign({}, fineUploader.status, {
    ONLINE: 'online'
});

export const formSubmissionValidation = {
    /**
     * Returns a boolean if there has been at least one file uploaded
     * successfully without it being deleted or canceled.
     * @param  {array of files}  files provided by react fine uploader
     * @return {boolean}
     */
    atLeastOneUploadedFile(files) {
        files = files.filter((file) => {
            return file.status !== FileStatus.DELETED &&
                   file.status !== FileStatus.CANCELED &&
                   file.status != FileStatus.UPLOADED_FAILED
        });

        if (files.length && files[0].status === FileStatus.UPLOAD_SUCCESSFUL) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * File submission for the form is optional, but if the user decides to submit a file
     * the form is not ready until there are no more files currently uploading.
     * @param  {array of files} files files provided by react fine uploader
     * @return {boolean}       [description]
     */
    fileOptional(files) {
        const uploadingFiles = files.filter((file) => file.status === FileStatus.SUBMITTING);

        return uploadFiles.length === 0;
    }
};

/**
 * Filter function for filtering all deleted, canceled, and failed files
 * @param  {object} file A file from filesToUpload that has status as a prop.
 * @return {boolean}
 */
export function displayValidFilesFilter(file) {
    return file.status !== FileStatus.DELETED &&
           file.status !== FileStatus.CANCELED &&
           file.status !== FileStatus.UPLOAD_FAILED;
}

/**
 * Filter function for filtering all files except for deleted, canceled, and failed files
 * @param  {object} file A file from filesToUpload that has status as a prop.
 * @return {boolean}
 */
export function displayRemovedFilesFilter(file) {
    return file.status === FileStatus.DELETED ||
           file.status === FileStatus.CANCELED ||
           file.status === FileStatus.UPLOAD_FAILED;
}


/**
 * Filter function for which files to integrate in the progress process
 * @param  {object} file A file from filesToUpload, that has a status as a prop.
 * @return {boolean}
 */
export function displayValidProgressFilesFilter(file) {
    return file.status !== FileStatus.DELETED &&
           file.status !== FileStatus.CANCELED &&
           file.status !== FileStatus.UPLOAD_FAILED &&
           file.status !== FileStatus.ONLINE;
}


/**
 * Fineuploader allows to specify the file extensions that are allowed to upload.
 * For our self defined input, we can reuse those declarations to restrict which files
 * the user can pick from his hard drive.
 *
 * Takes an array of file extensions (['pdf', 'png', ...]) and transforms them into a string
 * that can be passed into an html5 input via its 'accept' prop.
 * @param  {array} allowedExtensions Array of strings without a dot prefixed
 * @return {string}                   Joined string (comma-separated) of the passed-in array
 */
export function transformAllowedExtensionsToInputAcceptProp(allowedExtensions) {
    // add a dot in front of the extension
    const prefixedAllowedExtensions = allowedExtensions.map((ext) => '.' + ext);

    // generate a comma separated list to add them to the DOM element
    // See: http://stackoverflow.com/questions/4328947/limit-file-format-when-using-input-type-file
    return prefixedAllowedExtensions.join(', ');
}
