import { createComponentSpecExtensionBuilder } from '../../utils/react';


const formSpecExtender = (formComponentSpec, formRefName = 'form') => {
    const builder = createComponentSpecExtensionBuilder(formComponentSpec, formRefName);

    builder
        .extendForFn('getData')
        .extendForFn('reset')
        .extendForFn('validate');

    return builder.constructSpec();
};

export default formSpecExtender;
