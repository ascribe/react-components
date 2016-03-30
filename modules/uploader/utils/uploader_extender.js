import React from 'react';

import { ComponentExtenderBuilder } from '../../utils/react';

const UploaderExtender = (UploaderComponent, uploaderRefName = 'uploader') => {
    const builder = new ComponentExtenderBuilder(UploaderComponent, uploaderRefName, {
        displayName: 'UploaderExtender'
    });

    builder
        .extendForFn('getUploader')
        .extendForFn('getUploaderFiles')
        .extendForFn('reset');

    return builder.createClass();
};

export default UploaderExtender;
