import React from 'react';
import CssModules from 'react-css-modules';
import moment from 'moment';

import DatePicker from 'react-datepicker';

import { omitFromObject, safeInvoke } from '../../utils/general';

import styles from './input_date.scss';


const { bool, func, object, oneOfType, string } = React.PropTypes;

/**
 * Shim component to make DatePicker (https://github.com/Hacker0x01/react-datepicker) compatible
 * with Form Properties
 */
const InputDate = React.createClass({
    propTypes: {
        // We'll convert any dates that are given from parents into moment dates when using them
        defaultValue: oneOfType([object, string]),
        onChange: func,

        // Only used to signal for validation in Property
        required: bool,

        // Provided by Property
        value: string.isRequired

        // All the other props are passed to the backing DatePicker component.
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

    // Required Property API
    getValue() {
        // To make it easier to compose a JSON structure for form data, return a formatted string
        // of the currently selected date to the Property managing this input.
        return this.getValueMoment().format(this.props.dateFormat);
    },

    getValueMoment() {
        const { defaultValue, value } = this.props;

        // If this input's been user edited, we should use the value passed from Property as
        // Property is the one that manages an input component's values.
        return moment(this.state.edited ? value : defaultValue);
    },

    // Required Property API
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
        const datePickerProps = omitFromObject(this.props, ['defaultValue', 'onChange', 'value']);

        return (
            <DatePicker
                {...datePickerProps}
                onChange={this.onDateChange}
                selected={this.getValueMoment()} />
        );
    }
});

export default CssModules(InputDate, styles);
