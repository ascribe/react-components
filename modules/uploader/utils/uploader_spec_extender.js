import React from 'react';

import { ComponentSpecExtensionBuilder } from '../../utils/react';


const uploaderSpecExtender = (uploaderComponentSpec, uploaderRefName = 'uploader') => {
    const builder = new ComponentSpecExtensionBuilder(uploaderComponentSpec, uploaderRefName);

    builder
        .extendForFn('getUploader')
        .extendForFn('getUploaderFiles')
        .extendForFn('reset');

    return builder.constructSpec();
};

export default uploaderSpecExtender;
