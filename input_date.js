'use strict';

import React from 'react';

import DatePicker from 'react-datepicker/dist/react-datepicker';

let InputDate = React.createClass({
    propTypes: {
        submitted: React.PropTypes.bool,
        placeholderText: React.PropTypes.string,
        onChange: React.PropTypes.func,
        defaultValue: React.PropTypes.object,

        // DatePicker implements the disabled attribute
        // https://github.com/Hacker0x01/react-datepicker/blob/master/src/datepicker.jsx#L30
        disabled: React.PropTypes.bool
    },

    getInitialState() {
        return this.getStateFromMoment(this.props.defaultValue);
    },

    // InputDate needs to support setting a defaultValue from outside.
    // If this is the case, we need to call handleChange to propagate this
    // to the outer Property
    componentWillReceiveProps(nextProps) {
        if(!this.state.value && !this.state.value_moment && nextProps.defaultValue) {
            this.handleChange(nextProps.defaultValue);
        }
    },

    getStateFromMoment(date) {
        const state = {};

        if (date) {
            state.value = date.format('YYYY-MM-DD');
            state.value_moment = date;
        }

        return state;
    },

    handleChange(date) {
        const newState = this.getStateFromMoment(date);

        this.setState(newState);

        // Propagate change up by faking event
        this.props.onChange({
            target: {
                value: newState.value
            }
        });
    },

    reset() {
        this.setState(this.getInitialState());
    },

    render() {
        return (
            <div>
                <DatePicker
                    disabled={this.props.disabled}
                    dateFormat="YYYY-MM-DD"
                    selected={this.state.value_moment}
                    onChange={this.handleChange}
                    placeholderText={this.props.placeholderText}/>
            </div>
        );
    }
});

export default InputDate;
