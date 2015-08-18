'use strict';

/**
 * Returns a boolean if there has been at least one file uploaded
 * successfully without it being deleted or canceled.
 * @param  {array of files}  files provided by react fine uploader
 * @return {Boolean}       
 */
export function isReadyForFormSubmission(files) {
    files = files.filter((file) => file.status !== 'deleted' && file.status !== 'canceled');
    if (files.length > 0 && files[0].status === 'upload successful') {
        return true;
    } else {
        return false;
    }
}