import fineUploader from '../vendor/s3.fine-uploader';


// Re-export qq.supportedFeatures
const SupportedFeatures = Object.assign({}, fineUploader.supportedFeatures);

export default SupportedFeatures;
