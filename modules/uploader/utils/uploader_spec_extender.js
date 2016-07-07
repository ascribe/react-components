import { ComponentSpecExtensionBuilder } from '../../utils/react';


const uploaderSpecExtender = (uploaderComponentSpec, uploaderRefName = 'uploader') => {
    const builder = new ComponentSpecExtensionBuilder(uploaderComponentSpec, uploaderRefName);

    builder
        .extendForFn('getChunks')
        .extendForFn('getFiles')
        .extendForFn('getUploader')
        .extendForFn('reset')
        .extendForFn('setStatusOfFile')

        // Extend the handlers too
        .extendForFn('handleCancelFile')
        .extendForFn('handleDeleteFile')
        .extendForFn('handlePauseFile')
        .extendForFn('handleResumeFile')
        .extendForFn('handleRetryFile')
        .extendForFn('handleSubmitFiles');

    return builder.constructSpec();
};

export default uploaderSpecExtender;
