import FileStatus from '../constants/file_status';

/**
 * Filter function for filtering out currently processing files
 * (ie. still uploading, deleting, in queue, or paused)
 * @param  {object}  file  A file from filesToUpload, that has a status as a prop.
 * @return {boolean}       True if file is still getting processed
 */
export function processingFilter(file) {
    return file.status === FileStatus.DELETING ||
           file.status === FileStatus.PAUSED ||
           file.status === FileStatus.QUEUED ||
           file.status === FileStatus.SUBMITTING ||
           file.status === FileStatus.SUBMITTED ||
           file.status === FileStatus.UPLOADING ||
           file.status === FileStatus.UPLOAD_RETRYING;
}
/**
 * Filter function for filtering out successfully uploaded files
 * @param  {object}  file  A file from filesToUpload, that has a status as a prop.
 * @return {boolean}       True if file was uploaded successfully
 */
export function successfullyUploadedFilter(file) {
    return file.status === FileStatus.UPLOAD_SUCCESSFUL;
}

/**
 * Filter function for filtering out currently uploaded files
 * @param  {object}  file  A file from filesToUpload, that has a status as a prop.
 * @return {boolean}       True if file is still uploading
 */
export function uploadingFilter(file) {
    return file.status === FileStatus.UPLOADING ||
           file.status === FileStatus.UPLOAD_RETRYING;
}

/**
 * Filter function for filtering out all deleted, canceled, and failed files
 * @param  {object}  file A file from filesToUpload that has status as a prop.
 * @return {boolean}      True if file is valid
 */
export function validFilesFilter(file) {
    return file.status !== FileStatus.CANCELED &&
           file.status !== FileStatus.DELETED &&
           file.status !== FileStatus.UPLOAD_FAILED &&
           file.size !== -1;
}

/**
 * Filter function for which files to integrate in the progress process
 * @param  {object}  file A file from filesToUpload, that has a status as a prop.
 * @return {boolean}      True if file is valid
 */
export function validProgressFilesFilter(file) {
    return file.status !== FileStatus.CANCELED &&
           file.status !== FileStatus.DELETED &&
           file.status !== FileStatus.ONLINE &&
           file.status !== FileStatus.UPLOAD_FAILED;
}

/**
 * Filter function for filtering all files except for deleted, canceled, and failed files
 * @param  {object} file A file from filesToUpload that has status as a prop.
 * @return {boolean}
 */
export function removedFilesFilter(file) {
    return file.status === FileStatus.CANCELED ||
           file.status === FileStatus.DELETED ||
           file.status === FileStatus.UPLOAD_FAILED;
}
