import { createdBlobFilesFilter, processingFilesFilter, uploadedFilesFilter } from './file_filters';

/**
 * Returns a boolean if there has been at least one file uploaded successfully with
 * a blob being registered.
 * @param  {File[]}  files Files tracked by uploader
 * @return {boolean}
 */
export function atLeastOneCreatedBlobFile(files) {
    return files.filter(createdBlobFilesFilter).length > 0;
}

/**
 * Returns a boolean if there has been at least one file uploaded successfully without it being
 * deleted or canceled.
 * @param  {File[]}  files Files tracked by uploader
 * @return {boolean}
 */
export function atLeastOneUploadedFile(files) {
    return files.filter(uploadedFilesFilter).length > 0;
}

/**
 * In cases where a file being uploaded is optional, we should check to make sure that there are no
 * more files being currently uploaded.
 * @param  {File[]}  files Files tracked by uploader
 * @return {boolean}
 */
export function fileOptional(files) {
    return files.filter(processingFilesFilter).length === 0;
}
