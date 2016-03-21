import React from 'react';

import Checkbox from '../../ui/checkbox';

import { safeInvoke } from '../../utils/general';

const { bool, func, object, string } = React.PropTypes;

/**
 * This component can be used as a custom input element for Form Properties.
 * It exposes its state via a `getValue()` and can be considered as a reference implementation
 * for custom input components that live inside of a Property.
 */
const InputCheckbox = React.createClass({
    propTypes: {
        // Style overrides for the default checkbox. See ui/checkbox for class names to implement.
        checkboxStyle: object,

        className: string,

        // As can be read here: https://facebook.github.io/react/docs/forms.html
        // inputs of type="checkbox" define their state via checked.
        // Their default state is defined via defaultChecked.
        //
        // Since this component even has checkbox in its name, it felt wrong to expose defaultValue
        // as the default-setting prop to other developers, which is why we chose defaultChecked.
        defaultChecked: bool,

        disabled: bool,
        label: string,
        onChange: func,

        // Only used to signal for validation in Property
        required: bool,

        // provided by Property
        name: string.isRequired,
        value: bool.isRequired
    },

    getInitialState() {
        return {
            edited: false
        };
    },

    componentWillMount() {
        // Developers are used to define defaultValues for inputs via defaultValue, but since this is a
        // input of type checkbox we warn the dev not to do that.
        // FIXME: use env variables to remove this when in production
        if (this.props.hasOwnProperty('defaultValue')) { //eslint-disable-line react/prop-types
            console.warn('InputCheckbox is of type checkbox. Therefore its default value is represented by defaultChecked. defaultValue will do nothing!');
        }
    },

    getValue() {
        const { defaultChecked, value } = this.props;

        return this.state.edited ? value : defaultChecked;
    },

    onCheckboxChange(checked) {
        // Mock an event's payload as Checkbox's onChange just sends back the checked state.
        safeInvoke(this.props.onChange, {
            target: {
                value: checked
            }
        });
    },

    render() {
        const { checkboxStyle, className, disabled, name } = this.props;

        return (
            <Checkbox
                checked={this.getValue()}
                className={className}
                disabled={disabled}
                label={label}
                name={name}
                onChange={this.onCheckboxChange}
                styles={checkboxStyle} />
        );
    }
});

export default InputCheckbox;
