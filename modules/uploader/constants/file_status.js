import fineUploader from '../vendor/s3.fine-uploader';


// Re-export qq.status from FineUploader with additional states:
//   * CREATING_BLOB: Files who are currently being registered as a blob
//   * CREATED_BLOB: Files who have successfully registered as a blob
//   * FAILED_BLOB: Files who failed to be registered as a blob
//   * ONLINE: Files obtained from a previous session on S3 (ie. entirely online)
const FileStatus = Object.assign({}, fineUploader.status, {
    CREATING_BLOB: 'creating_blob',
    CREATED_BLOB: 'created_blob',
    FAILED_BLOB: 'failed_blob',
    ONLINE: 'online',
    SKIPPED_BLOB: 'skipped_blob'
});

export default FileStatus;
