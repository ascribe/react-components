import fineUploader from '../vendor/s3.fine-uploader';


// Re-export qq.status from FineUploader with an additional online
// state that we use to keep track of files from S3.
const FileStatus = Object.assign({}, fineUploader.status, {
    ONLINE: 'online'
});

export default FileStatus;
