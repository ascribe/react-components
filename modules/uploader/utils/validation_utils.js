/**
 * Returns a boolean if there has been at least one file uploaded
 * successfully without it being deleted or canceled.
 * @param  {array of files}  files provided by react fine uploader
 * @return {boolean}
 */
export function atLeastOneUploadedFile(files) {
    files = files.filter((file) => {
        return file.status !== FileStatus.DELETED &&
               file.status !== FileStatus.CANCELED &&
               file.status !== FileStatus.UPLOADED_FAILED
    });

    return files.length && files[0].status === FileStatus.UPLOAD_SUCCESSFUL;
}

/**
 * File submission for the form is optional, but if the user decides to submit a file
 * the form is not ready until there are no more files currently uploading.
 * @param  {array of files} files files provided by react fine uploader
 * @return {boolean}       [description]
 */
export function fileOptional(files) {
    const uploadingFiles = files.filter((file) => file.status === FileStatus.SUBMITTING);

    return uploadingFiles.length === 0;
}
