import React from 'react';

import { ComponentSpecExtensionBuilder } from '../../utils/react';


const uploaderSpecExtender = (uploaderComponentSpec, uploaderRefName = 'uploader') => {
    const builder = new ComponentSpecExtensionBuilder(uploaderComponentSpec, uploaderRefName);

    builder
        .extendForFn('getFiles')
        .extendForFn('getUploader')
        .extendForFn('reset')
        .extendForFn('setStatusOfFile');

    return builder.constructSpec();
};

export default uploaderSpecExtender;
