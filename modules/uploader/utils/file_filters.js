import FileStatus from '../file_status';

/**
 * Filter function for filtering out all deleted, canceled, and failed files
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
