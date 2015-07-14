'use strict';

import React from 'react';

import TextareaAutosize from 'react-textarea-autosize';

let InputTextAreaToggable = React.createClass({

    propTypes: {
        editable: React.PropTypes.bool.isRequired,
        rows: React.PropTypes.number.isRequired,
        required: React.PropTypes.string,
        defaultValue: React.PropTypes.string
    },

    getInitialState() {
        return {
            value: this.props.defaultValue
        };
    },
    handleChange(event) {
        this.setState({value: event.target.value});
        this.props.onChange(event);
    },
    render() {
        let className = 'form-control ascribe-textarea';
        let textarea = null;
        if (this.props.editable){
            className = className + ' ascribe-textarea-editable';
            textarea = (
                <TextareaAutosize
                    className={className}
                    value={this.state.value}
                    rows={this.props.rows}
                    maxRows={10}
                    required={this.props.required}
                    onChange={this.handleChange}
                    onBlur={this.props.onBlur}
                    placeholder={this.props.placeholder} />
            );
        }
        else{
            textarea = <pre className="ascribe-pre">{this.state.value}</pre>;
        }
        return textarea;
    }
});


export default InputTextAreaToggable;