import React from 'react';
import moment from 'moment';

import DatePicker from 'react-datepicker';

import { safeInvoke } from '../../utils/general';

import styles from './input_date.scss';


const { bool, func, object, oneOfType, string } = React.PropTypes;

/**
 * Shim component to make DatePicker (https://github.com/Hacker0x01/react-datepicker) compatible
 * with Form Properties
 */
const InputDate = React.createClass({
    propTypes: {
        /**
         * Before using any dates given as props (ie. defaultValue and value), we'll convert them
         * into moment dates by using this format string.
         * This will also specify the DatePicker's dateFormat.
         */
        dateFormat: string,

        defaultValue: oneOfType([object, string]),
        onChange: func,
        value: string,

        // Only used to signal for validation in Property
        required: bool

        // Any other props are passed through to the backing DatePicker component.
        // See the available props for DatePicker:
        // https://github.com/Hacker0x01/react-datepicker/blob/master/docs/datepicker.md
    },

    getDefaultProps() {
        return {
            dateFormat: 'YYYY-MM-DD'
        };
    },

    getInitialState() {
        return {
            edited: false
        }
    },

    focus() {
        // React datepicker doesn't expose a focus method for its input, so we're forced to
        // reach inside it
        if (this.refs.datepicker.refs.input) {
            safeInvoke({
                fn: this.refs.datepicker.refs.input.focus,
                context: this.refs.datepicker.refs.input
            });
        }
    },

    // Required Property API
    getValue() {
        const momentValue = this.getValueMoment();

        // To make it easier to compose a JSON structure for form data, return a formatted string
        // of the currently selected date to the parent managing this input.
        return momentValue ? momentValue.format(this.props.dateFormat) : '';
    },

    getValueMoment() {
        const { dateFormat, defaultValue, value } = this.props;

        // If this input's been user edited, we should use the value passed from the controlling
        // parent component as its the one that managing this input component's values.
        const currentValue = this.state.edited ? value : defaultValue;

        return currentValue ? moment(currentValue, dateFormat, true) : null;
    },

    reset() {
        this.setState({ edited: false });
    },

    onDateChange(date) {
        const { dateFormat, onChange } = this.props;

        if (!this.state.edited) {
            this.setState({ edited: true });
        }

        // Propagate change up by faking an event's payload
        safeInvoke(onChange, {
            target: {
                value: date.format(dateFormat)
            }
        });
    },

    render() {
        const {
            defaultValue, // ignore
            onChange, // ignore

            // Ignore, to avoid overriding DatePickers's styles with this component's styles (in
            // case they ever use react-css-modules or expose a `style` prop)
            styles, // eslint-disable-line react/prop-types

            value, // ignore
            ...datePickerProps
        } = this.props;

        return (
            <DatePicker
                ref="datepicker"
                {...datePickerProps}
                onChange={this.onDateChange}
                selected={this.getValueMoment()} />
        );
    }
});

export default InputDate;
