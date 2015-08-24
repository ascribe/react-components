'use strict';

import React from 'react';

import DatePicker from 'react-datepicker/dist/react-datepicker';

let InputDate = React.createClass({
    propTypes: {
        submitted: React.PropTypes.bool,
        placeholderText: React.PropTypes.string,
        onChange: React.PropTypes.func,
        defaultValue: React.PropTypes.object
    },

    getInitialState() {
        return {
            value: null
        };
    },

    // InputDate needs to support setting a defaultValue from outside.
    // If this is the case, we need to call handleChange to propagate this
    // to the outer Property
    componentWillReceiveProps(nextProps) {
        if(!this.state.value && !this.state.value_moment && nextProps.defaultValue) {
            this.handleChange(this.props.defaultValue);
        }
    },

    handleChange(date) {
        let formattedDate = date.format('YYYY-MM-DD');
        this.setState({
            value: formattedDate,
            value_moment: date
        });

        this.props.onChange({
            target: {
                value: formattedDate
            }
        });
    },

    render: function () {
        return (
            <div>
                <DatePicker
                    dateFormat="YYYY-MM-DD"
                    selected={this.state.value_moment}
                    onChange={this.handleChange}
                    placeholderText={this.props.placeholderText}/>
            </div>
        );
    }
});

export default InputDate;
