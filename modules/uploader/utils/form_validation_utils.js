import { processingFilter, successfullyUploadedFilter } from './file_filters';

import FileStatus from '../constants/file_status';

/**
 * Returns a boolean if there has been at least one file uploaded
 * successfully without it being deleted or canceled.
 * @param  {array of files}  files provided by react fine uploader
 * @return {boolean}
 */
export function atLeastOneUploadedFile(files) {
    return files.filter(successfullyUploadedFilter).length > 0;
}

/**
 * File submission for the form is optional, but if the user decides to submit a file
 * the form is not ready until there are no more files currently uploading.
 * @param  {array of files} files files provided by react fine uploader
 * @return {boolean}       [description]
 */
export function fileOptional(files) {
    return files.filter(processingFilter).length === 0;
}
