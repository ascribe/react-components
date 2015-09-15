'use strict';

export const formSubmissionValidation = {
    /**
     * Returns a boolean if there has been at least one file uploaded
     * successfully without it being deleted or canceled.
     * @param  {array of files}  files provided by react fine uploader
     * @return {boolean}       
     */
    atLeastOneUploadedFile(files) {
        files = files.filter((file) => file.status !== 'deleted' && file.status !== 'canceled');
        if (files.length > 0 && files[0].status === 'upload successful') {
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
        let uploadingFiles = files.filter((file) => file.status === 'submitting');

        if (uploadingFiles.length === 0) {
            return true;
        } else {
            return false;
        }
    }
};

/**
 * Filter function for filtering all deleted and canceled files
 * @param  {object} file A file from filesToUpload that has status as a prop.
 * @return {boolean}
 */
export function displayValidFilesFilter(file) {
    return file.status !== 'deleted' && file.status !== 'canceled';
}


/**
 * Filter function for which files to integrate in the progress process
 * @param  {object} file A file from filesToUpload, that has a status as a prop.
 * @return {boolean}
 */
export function displayValidProgressFilesFilter(file) {
    return file.status !== 'deleted' && file.status !== 'canceled' && file.status !== 'online';
}

