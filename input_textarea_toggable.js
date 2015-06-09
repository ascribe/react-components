'use strict';

import React from 'react';

import AlertMixin from '../../mixins/alert_mixin';
import TextareaAutosize from 'react-textarea-autosize';
import Button from 'react-bootstrap/lib/Button';

let InputTextAreaToggable = React.createClass({

    propTypes: {
        editable: React.PropTypes.bool.isRequired,
        submitted: React.PropTypes.bool,
        rows: React.PropTypes.number.isRequired,
        onSubmit: React.PropTypes.func.isRequired,
        required: React.PropTypes.string,
        defaultValue: React.PropTypes.string
    },

    mixins: [AlertMixin],

    getInitialState() {
        return {
            value: this.props.defaultValue,
            edited: false,
            alerts: null // needed in AlertMixin
        };
    },
    handleChange(event) {
        this.setState({
            value: event.target.value,
            edited: true
        });
    },
    reset(){
        this.setState(this.getInitialState());
    },
    submit(){
        this.props.onSubmit();
        this.setState({edited: false});
    },
    render() {
        let className = 'form-control ascribe-textarea';
        let buttons = null;
        let textarea = null;
        if (this.props.editable && this.state.edited){
            buttons = (
                <div className="pull-right">
                    <Button className="ascribe-btn" onClick={this.submit}>Save</Button>
                    <Button className="ascribe-btn" onClick={this.reset}>Cancel</Button>
                </div>
            );

        }
        if (this.props.editable){
            className = className + ' ascribe-textarea-editable';
            textarea = (
                <TextareaAutosize
                    className={className}
                    value={this.state.value}
                    rows={this.props.rows}
                    required={this.props.required}
                    onChange={this.handleChange}
                    placeholder='Write something...' />
            );
        }
        else{
            textarea = <pre className="ascribe-pre">{this.state.value}</pre>;
        }
        let alerts = (this.props.submitted) ? null : this.state.alerts;
        return (
            <div className="form-group">
                {alerts}
                {textarea}
                {buttons}
            </div>
        );
    }
});

export default InputTextAreaToggable;