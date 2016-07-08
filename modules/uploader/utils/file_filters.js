import FileStatus from '../constants/file_status';

/**
 * Filter function to filter for files that have had blobs created for them.
 * @param  {File}    file  A file from filesToUpload, that has a status property.
 * @return {boolean}       True if file has a blob created
 */
export function createdBlobFilesFilter(file) {
    return file.status === FileStatus.CREATED_BLOB;
}

/**
 * Filter function to filter for files that have failed to upload.
 * @param  {File}    file  A file from filesToUpload, that has a status property.
 * @return {boolean}       True if file failed to upload
 */
export function failedFilesFilter(file) {
    return file.status === FileStatus.UPLOAD_FAILED;
}

/**
 * Filter function to filter for files that have been paused.
 * @param  {File}    file  A file from filesToUpload, that has a status property.
 * @return {boolean}       True if file is paused
 */
export function pausedFilesFilter(file) {
    return file.status === FileStatus.PAUSED;
}

/**
 * Filter function to filter for currently processing files
 * (ie. still uploading, deleting, in queue, or paused)
 * @param  {File}    file  A file from filesToUpload, that has a status property.
 * @return {boolean}       True if file is still getting processed
 */
export function processingFilesFilter(file) {
    return file.status === FileStatus.CREATING_BLOB ||
           file.status === FileStatus.DELETING ||
           file.status === FileStatus.PAUSED ||
           file.status === FileStatus.QUEUED ||
           file.status === FileStatus.SUBMITTING ||
           file.status === FileStatus.SUBMITTED ||
           file.status === FileStatus.UPLOADING ||
           file.status === FileStatus.UPLOAD_RETRYING;
}

/**
 * Filter function to filter for deleted, canceled, and failed files
 * @param  {File}    file A file from filesToUpload that has a status property.
 * @return {boolean}
 */
export function removedFilesFilter(file) {
    return file.status === FileStatus.CANCELED ||
           file.status === FileStatus.DELETED ||
           file.status === FileStatus.UPLOAD_FAILED ||
           file.size === -1;
}

/**
 * Filter function to filter for successfully uploaded files
 * @param  {File}    file  A file from filesToUpload, that has a status property.
 * @return {boolean}       True if file was uploaded successfully
 */
export function uploadedFilesFilter(file) {
    return file.progress === 100 &&
           (file.status === FileStatus.UPLOAD_SUCCESSFUL ||
            file.status === FileStatus.CREATING_BLOB ||
            file.status === FileStatus.CREATED_BLOB ||
            file.status === FileStatus.FAILED_BLOB ||
            file.status === FileStatus.ONLINE ||
            file.status === FileStatus.SKIPPED_BLOB);
}

/**
 * Filter function to filter for currently uploaded files
 * @param  {File}    file  A file from filesToUpload, that has a status property.
 * @return {boolean}       True if file is still uploading
 */
export function uploadingFilesFilter(file) {
    return file.status === FileStatus.UPLOADING ||
           file.status === FileStatus.UPLOAD_RETRYING;
}

/**
 * Filter function to filter out all deleted, canceled, failed files (ie. those that have not been
 * uploaded successfully)
 * @param  {File}    file A file from filesToUpload that has a status property.
 * @return {boolean}      True if file is valid
 */
export function validFilesFilter(file) {
    return !removedFilesFilter(file);
}

/**
 * Filter function for which files to integrate into a total progress calculation
 * @param  {File}    file A file from filesToUpload, that has a status property.
 * @return {boolean}      True if file is valid
 */
export function validProgressFilesFilter(file) {
    return file.status !== FileStatus.CANCELED &&
           file.status !== FileStatus.DELETED &&
           file.status !== FileStatus.ONLINE &&
           file.status !== FileStatus.UPLOAD_FAILED;
}
