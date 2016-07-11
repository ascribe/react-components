import { createComponentSpecExtensionBuilder } from '../../utils/react';


const propertySpecExtender = (propertyComponentSpec, propertyRefName = 'property') => {
    const builder = createComponentSpecExtensionBuilder(propertyComponentSpec, propertyRefName);

    builder
        .extendForFn('focus')
        .extendForFn('getValue')
        .extendForFn('onSubmitError')
        .extendForFn('onSubmitSuccess')
        .extendForFn('reset')
        .extendForFn('validate');

    return builder.constructSpec();
};

export default propertySpecExtender;
