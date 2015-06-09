'use strict';

import React from 'react';

import AlertMixin from '../../mixins/alert_mixin';
import DatePicker from 'react-datepicker/dist/react-datepicker';

let InputDate = React.createClass({
    propTypes: {
        submitted: React.PropTypes.bool,
        placeholderText: React.PropTypes.string
    },

    mixins: [AlertMixin],

    getInitialState() {
        return {
            value: null,
            value_formatted: null,
            alerts: null // needed in AlertMixin
        };
    },

    handleChange(date) {
        this.setState({
            value: date,
            value_formatted: date.format('YYYY-MM-DD')});
    },

    render: function () {
        let alerts = (this.props.submitted) ? null : this.state.alerts;
        return (
            <div className="form-group">
                {alerts}
                <DatePicker
                    key="example2"
                    dateFormat="YYYY-MM-DD"
                    selected={this.state.value}
                    onChange={this.handleChange}
                    placeholderText={this.props.placeholderText}/>
            </div>
        );
    }
});

export default InputDate;
