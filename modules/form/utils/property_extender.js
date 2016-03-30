import React from 'react';

import { ComponentExtenderBuilder } from '../../utils/react';

const PropertyExtender = (PropertyComponent, propertyRefName = 'property') => {
    const builder = new ComponentExtenderBuilder(PropertyComponent, propertyRefName, {
        displayName: 'PropertyExtender'
    });

    builder
        .extendForFn('focus')
        .extendForFn('getValue')
        .extendForFn('onSubmitFailure')
        .extendForFn('onSubmitSuccess')
        .extendForFn('reset')
        .extendForFn('validate');

    return builder.createClass();
};

export default PropertyExtender;
