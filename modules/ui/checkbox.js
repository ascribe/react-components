import React from 'react';
import CssModules from 'react-css-modules';

import HiddenInput from './hidden_input';

import { noop, safeInvoke } from '../utils/general';

import styles from './checkbox.scss';

const { bool, func, node, string } = React.PropTypes;

const Checkbox = React.createClass({
    propTypes: {
        checked: bool,
        className: string,
        disabled: bool,
        label: node,
        onChange: func

        // All other props are passed down to the backing input element
    },

    getInitialState() {
        // If there's no checked prop, we'll consider this an uncontrolled component
        // (see https://facebook.github.io/react/docs/forms.html#uncontrolled-components)
        // and add state to let it control itself
        if (!this.props.hasOwnProperty('checked')) {
            return { checked: false };
        } else {
            return null;
        }
    },

    focus() {
        this.inputElement.focus();
    },

    getChecked() {
        return this.props.hasOwnProperty('checked') ? this.props.checked : this.state.checked;
    },

    onCheckboxChange(event) {
        let checked;

        if (this.props.hasOwnProperty('checked')) {
            checked = !this.props.checked;
        } else {
            checked = !this.state.checked;
            this.setState({ checked });
        }

        safeInvoke(this.props.onChange, checked);
    },

    render() {
        const {
            className,
            disabled,
            label,
            checked: _, // ignore and rename to avoid name clash
            onChange, // ignore
            ...inputCheckboxProps
        } = this.props;
        const checked = this.getChecked();

        let styleName = checked ? 'checked' : 'base';
        if (disabled) {
            styleName += '-disabled';
        }

        // Unfortunately, the browser's native input checkbox doesn't allow for much restyling.
        // Instead, we style another element as the UI but still keep a hidden <input> in case a
        // parent <form> relies on this component to have a native input for sending data
        // (eg. a <form method="post">).
        return (
            <label className={className} styleName={styleName}>
                {label}
                <HiddenInput
                    ref={(ref) => { this.inputElement = ref && ref.inputElement; }}
                    {...inputCheckboxProps}
                    checked={checked}
                    disabled={disabled}
                    required={false}
                    onChange={this.onCheckboxChange}
                    type="checkbox" />
            </label>
        );
    }
});

export default CssModules(Checkbox, styles);
