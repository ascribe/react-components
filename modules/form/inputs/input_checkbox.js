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

        // Although inputs of type="checkbox" define their state via checked, this component still
        // exposes a `defaultValue` rather than `defaultChecked` to stay consistent with the other
        // custom inputs. Form also injects `value` into inputs, so this also stays consistent
        // with `value`.
        defaultValue: bool,

        disabled: bool,
        label: string,
        name: string,
        onChange: func,
        value: bool,

        // Only used to signal for validation in Property
        required: bool

        // All other props are passed to the backing Checkbox
    },

    getInitialState() {
        return {
            edited: false
        };
    },

    componentWillMount() {
        // Developers are used to define defaultValues for inputs via defaultValue, but since this is a
        // input of type checkbox we warn the dev not to do that.
        if (process.env.NODE_ENV !== 'production' && this.props.hasOwnProperty('defaultChecked')) {
            console.warn('Although InputCheckbox is of type checkbox, its default value is represented by defaultValue. defaultChecked will do nothing!');
        }
    },

    focus() {
        this.refs.checkbox.focus();
    },

    // Required Property API
    getValue() {
        const { defaultValue, value } = this.props;

        return this.state.edited ? value : !!defaultValue;
    },

    // Required Property API
    reset() {
        this.setState({ edited: false });
    },

    onCheckboxChange(checked) {
        if (!this.state.edited) {
            this.setState({ edited: true });
        }

        // Mock an event's payload as Checkbox's onChange just sends back the checked state.
        safeInvoke(this.props.onChange, {
            target: {
                value: checked
            }
        });
    },

    render() {
        const {
            checkboxStyle,
            defaultValue, // ignore
            onChange, // ignore
            value, // ignore
            ...checkboxProps
        } = this.props;

        return (
            <Checkbox
                ref="checkbox"
                {...checkboxProps}
                checked={this.getValue()}
                onChange={this.onCheckboxChange}
                styles={checkboxStyle} />
        );
    }
});

export default InputCheckbox;
