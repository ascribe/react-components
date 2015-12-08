'use strict';

import React from 'react';

import TextareaAutosize from 'react-textarea-autosize';


let InputTextAreaToggable = React.createClass({
    propTypes: {
        autoFocus: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        rows: React.PropTypes.number.isRequired,
        required: React.PropTypes.bool,
        defaultValue: React.PropTypes.string,
        placeholder: React.PropTypes.string,
        onBlur: React.PropTypes.func,
        onChange: React.PropTypes.func
    },

    getInitialState() {
        return {
            value: null
        };
    },

    componentDidMount() {
        if (this.props.autoFocus) {
            this.refs.textarea.focus();
        }

        this.setState({
            value: this.props.defaultValue
        });
    },

    componentDidUpdate() {
        // If the initial value of state.value is null, we want to set props.defaultValue
        // as a value. In all other cases TextareaAutosize.onChange is updating.handleChange already
        if(this.state.value === null && this.props.defaultValue) {
            this.setState({
                value: this.props.defaultValue
            });
        }
    },

    handleChange(event) {
        this.setState({value: event.target.value});
        this.props.onChange(event);
    },

    render() {
        let className = 'form-control ascribe-textarea';
        let textarea = null;

        if(!this.props.disabled) {
            className = className + ' ascribe-textarea-editable';
            textarea = (
                <TextareaAutosize
                    ref='textarea'
                    className={className}
                    value={this.state.value}
                    rows={this.props.rows}
                    maxRows={10}
                    required={this.props.required}
                    onChange={this.handleChange}
                    onBlur={this.props.onBlur}
                    placeholder={this.props.placeholder} />
            );
        } else {
            textarea = <pre className="ascribe-pre">{this.state.value}</pre>;
        }

        return textarea;
    }
});


export default InputTextAreaToggable;
