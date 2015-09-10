'use strict';

/**
 * Filter function for filtering all deleted and canceled files
 * @param  {object} file A file from filesToUpload that has status as a prop.
 * @return {boolean}
 */
export function displayValidFilesFilter(file) {
    return file.status !== 'deleted' && file.status !== 'canceled';
}

/**
 * Returns a boolean if there has been at least one file uploaded
 * successfully without it being deleted or canceled.
 * @param  {array of files}  files provided by react fine uploader
 * @return {Boolean}       
 */
export function isReadyForFormSubmission(files) {
    files = files.filter(displayValidFilesFilter);
    if (files.length > 0 && files[0].status === 'upload successful') {
        return true;
    } else {
        return false;
    }
}

/**
 * Filter function for which files to integrate in the progress process
 * @param  {object} file A file from filesToUpload, that has a status as a prop.
 * @return {boolean}
 */
export function displayValidProgressFilesFilter(file) {
    return file.status !== 'deleted' && file.status !== 'canceled' && file.status !== 'online';
}
