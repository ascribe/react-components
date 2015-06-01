import React from 'react';

import AlertMixin from '../../mixins/alert_mixin'
import DatePicker from 'react-datepicker/dist/react-datepicker'

let InputDate = React.createClass({

    mixins : [AlertMixin],

    getInitialState() {
        return {value: '2015-01-01',
                alerts: null // needed in AlertMixin
        };
    },
    handleChange(moment_date) {
        this.setState({value: moment_date.format("YYYY-MM-DD")});
    },
    isValidDate: function (str) {
        return (
            /^[0-9]{4}$/.test(str) &&
            moment(str, 'YYYY-MM-DD').isValid()
        );
    },
    render: function () {
        let className = "form-control input-text-ascribe";
        let alerts = (this.props.submitted) ? null : this.state.alerts;
        return (
             <DatePicker
                 key="example2"
                 dateFormat="YYYY-MM-DD"
                 onChange={this.handleChange}
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