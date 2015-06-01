import React from 'react';

import AlertMixin from '../../mixins/alert_mixin'
import DatePicker from 'react-datepicker/dist/react-datepicker'

let InputDate = React.createClass({

    mixins : [AlertMixin],

    getInitialState() {
        return {value: null,
                alerts: null // needed in AlertMixin
        };
    },

    handleChange(date) {
        this.setState({value: date});
    },

    render: function () {
        let className = "form-control input-text-ascribe";
        let alerts = (this.props.submitted) ? null : this.state.alerts;
        return (
             <DatePicker
                 key="example2"
                 dateFormat="YYYY-MM-DD"
                 selected={this.state.value}
                 onChange={this.handleChange}
                 placeholderText={this.props.placeholderText}
              />
        );
        //return (
        //    <div className="input-group date"
        //        ref={this.props.name + "_picker"}
        //        onChange={this.handleChange}>
        //        <input className={className}
        //            ref={this.props.name}
        //            placeholder={this.props.placeholder}
        //            required={this.props.required}
        //            type="text"/>
        //        <span className="input-group-addon input-text-ascribe">
        //            <span className="glyphicon glyphicon-calendar" style={{"color": "black"}}></span>
        //        </span>
        //    </div>
        //)


    }
});

export default InputDate;
