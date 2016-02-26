import InputValidator from './inputValidator';

const VALIDATION_ORDER = ['required', 'pattern', 'min', 'max'];

export function validateInput(inputElement, value) {
    const type = inputElement.type;

    return VALIDATION_ORDER.reduce((error, validationProp) => {
        if (!error && validationProp in inputElement) {
            return !InputValidator[validationProp](value, inputElement[validationProp], type) ? validationProp : null;
        }
    }, null);
}
