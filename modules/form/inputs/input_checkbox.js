import React from 'react';
import CssModules from 'react-css-modules';

import Checkbox from '../../ui/checkbox';

import { safeInvoke } from '../../utils/general';

import styles from './input_checkbox.scss';


const { bool, func, object, oneOfType, string } = React.PropTypes;

/**
 * This component can be used as a custom input element for Form Properties.
 * It exposes its state via a `getValue()` and can be considered as a reference implementation
 * for custom input components that live inside of a Property.
 *
 * Note that its `checked` prop would normally be `value` in other custom inputs.
 */
const InputCheckbox = React.createClass({
    propTypes: {
        // Style overrides for the default checkbox. See ui/checkbox for class names to implement.
        checkboxStyle: object,

        // We have to allow strings for checked as cleared inputs with React 15.0 require value=""
        // rather than value={null}
        checked: oneOfType([bool, string]),

        disabled: bool,
        label: string,
        name: string,
        onChange: func,

        // Only used to signal for validation in Property
        required: bool

        // All other props are passed to the backing Checkbox
    },

    componentWillMount() {
        // Developers are used to defining values for inputs via `value`, but since this is a input
        // of type checkbox, which instead uses `checked`, we warn the dev not to do that when in
        // dev mode.
        if (process.env.NODE_ENV !== 'production') {
            // If the value prop is a boolean, the user was most likely expecting it to control the
            // input rather than use it for its native behaviour
            // eslint-disable-next-line react/prop-types
            if (typeof this.props.value === 'boolean') {
                // eslint-disable-next-line no-console
                console.warn('InputCheckbox is of type checkbox, so its value is represented by ' +
                             '`checked`. The `value` prop behaves the same as ' +
                             'input[type="checkbox"]\'s native `value` attribute ' +
                             '(see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#Attributes)!');
            }
        }
    },

    focus() {
        this.refs.checkbox.focus();
    },

    // Required Property API
    getValue() {
        return !!this.props.checked;
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
        const {
            checkboxStyle,
            checked,
            onChange: ignoredOnChange, // ignore
            ...checkboxProps
        } = this.props;

        return (
            <Checkbox
                ref="checkbox"
                {...checkboxProps}
                checked={!!checked}
                onChange={this.onCheckboxChange}
                styleName="input-checkbox"
                styles={checkboxStyle} />
        );
    }
});

export default CssModules(InputCheckbox, styles);
