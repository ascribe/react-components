import InputValidator from './input_validator';

import { isReactElement } from '../../../utils/react';


const VALIDATION_ORDER = ['required', 'pattern', 'min', 'max'];

export function validateInput(inputElement, value) {
    // If the input element is a native element, the props are attached directly to the element
    let props = isReactElement(inputElement) ? inputElement.props : inputElement;
    let type = props.type;

    return VALIDATION_ORDER.reduce((error, validationProp) => {
        if (error) {
            return error;
        } else if (validationProp in props &&
                   !InputValidator[validationProp](value, props[validationProp], type)) {
            return validationProp;
        }
    }, null);
}
