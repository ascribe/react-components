import { createdBlobFilesFilter, processingFilesFilter, uploadedFilesFilter } from './file_filters';

/**
 * Returns a boolean if there has been at least one file uploaded successfully with
 * a blob being registered.
 * @param  {object[]} files Provided by react fine uploader
 * @return {boolean}
 */
export function atLeastOneCreatedBlobFile(files) {
    return files.filter(createdBlobFilesFilter).length > 0;
}

/**
 * Returns a boolean if there has been at least one file uploaded
 * successfully without it being deleted or canceled.
 * @param  {object[]} files Provided by react fine uploader
 * @return {boolean}
 */
export function atLeastOneUploadedFile(files) {
    return files.filter(uploadedFilesFilter).length > 0;
}

/**
 * File submission for the form is optional, but if the user decides to submit a file
 * the form is not ready until there are no more files currently uploading.
 * @param  {object[]} files Provided by react fine uploader
 * @return {boolean}
 */
export function fileOptional(files) {
    return files.filter(processingFilesFilter).length === 0;
}
