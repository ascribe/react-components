import React from 'react';

import TextareaAutosize from 'react-textarea-autosize';

import { anchorize } from '../../utils/dom_utils';


let InputTextAreaToggable = React.createClass({
    propTypes: {
        autoFocus: React.PropTypes.bool,
        convertLinks: React.PropTypes.bool,
        defaultValue: React.PropTypes.string,
        disabled: React.PropTypes.bool,
        onBlur: React.PropTypes.func,
        onChange: React.PropTypes.func,
        placeholder: React.PropTypes.string,
        required: React.PropTypes.bool,
        rows: React.PropTypes.number.isRequired
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
        if (this.state.value === null && this.props.defaultValue) {
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
        const { convertLinks, disabled, onBlur, placeholder, required, rows } = this.props;
        const { value } = this.state;

        if (!disabled) {
            return (
                <TextareaAutosize
                    ref='textarea'
                    className='form-control ascribe-textarea ascribe-textarea-editable'
                    value={value}
                    rows={rows}
                    maxRows={10}
                    required={required}
                    onChange={this.handleChange}
                    onBlur={onBlur}
                    placeholder={placeholder} />
            );
        } else {
            // Can only convert links when not editable, as textarea does not support anchors
            return <pre className="ascribe-pre">{convertLinks ? anchorize(value) : value}</pre>;
        }
    }
});


export default InputTextAreaToggable;
