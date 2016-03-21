import React from 'react';
import CssModules from 'react-css-modules';

import TextareaAutosize from 'react-textarea-autosize';

import { safeInvoke } from '../../utils/general';

import styles from './input_textarea.scss';


//FIXME: add anchorization back in after splitting off as a seperate package
function anchorize(str) {
    return str;
}

const { bool, func, number, string } = React.PropTypes;

const InputTextarea = React.createClass({
    propTypes: {
        rows: number.isRequired,

        autoFocus: bool,
        className: string,
        convertLinks: bool,
        defaultValue: string,
        disabled: bool,
        maxRows: number,
        onChange: func,
        placeholder: string,

        // Only used to signal for validation in Property
        required: bool,

        // Provided by Property
        value: string.isRequired
    },

    getDefaultProps() {
        return {
            maxRows: 10
        };
    },

    getInitialState() {
        return {
            edited: false
        };
    },

    componentDidMount() {
        const { autoFocus, disabled } = this.props;

        if (autoFocus && !disabled && this.refs.textarea) {
            this.refs.textarea.focus();
        }
    },

    // Required Property API
    getValue() {
        const { defaultValue, value } = this.props;

        // If this input's been user edited, we should use the value passed from Property as
        // Property is the one that manages an input component's values.
        return this.state.edited ? value : defaultValue;
    },

    // Required Property API
    reset() {
        this.setState({ edited: false });
    },

    onTextChange(event) {
        if (!this.state.edited) {
            this.setState({ edited: true });
        }

        safeInvoke(this.props.onChange, event);
    },

    render() {
        const { className, convertLinks, disabled, maxRows, placeholder, rows } = this.props;
        const value = this.getValue();

        // TextareaAutosize doesn't implement a disabled property, so switch to using a <pre>
        // when this input's disabled.
        if (!disabled) {
            return (
                <TextareaAutosize
                    ref='textarea'
                    className={className}
                    maxRows={maxRows}
                    onChange={this.onTextChange}
                    placeholder={placeholder}
                    rows={rows}
                    styleName="textarea"
                    value={value} />
            );
        } else {
            // Can only convert links when not editable, as textarea does not support anchors
            return (
                <pre className={className} styleName="disabled">
                    {convertLinks ? anchorize(value) : value}
                </pre>
            );
        }
    }
});


export default CssModules(InputTextarea, styles);
