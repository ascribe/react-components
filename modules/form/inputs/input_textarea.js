import React from 'react';
import CssModules from 'react-css-modules';

import TextareaAutosize from 'react-textarea-autosize';

import { safeInvoke } from 'js-utility-belt';

import styles from './input_textarea.scss';


// FIXME: add anchorization back in after splitting off as a seperate package
function anchorize(str) {
    return str;
}

const { bool, func, number, string } = React.PropTypes;

const MAX_TEXTAREA_REFRESH_COUNT = 5;
const TEXTAREA_REFRESH_TIME = 1000;

const InputTextarea = React.createClass({
    propTypes: {
        autoFocus: bool,
        convertLinks: bool,
        disabled: bool,
        maxRows: number,
        onChange: func,
        placeholder: string,
        rows: number,
        value: string,

        // Only used to signal for validation in Property
        // eslint-disable-next-line react/sort-prop-types
        required: bool

        // All other props are passed to the backing TextareaAutosize or pre element
    },

    getDefaultProps() {
        return {
            maxRows: 10,
            rows: 1
        };
    },

    componentDidMount() {
        const { autoFocus, disabled } = this.props;

        if (autoFocus && !disabled) {
            this.focus();
        }

        // react-textarea-autosize calculates its initial height immediately on mounting and won't
        // resize until it's interacted with. Unfortunately, this means that any css that's loaded
        // afterwards won't be factored into the calculation and could make the textarea have the
        // wrong height.
        // To prevent this, we'll try our best and refresh the textarea's size a few times after it
        // gets mounted.
        this.refreshTextareaSize();
    },

    componentWillUnmount() {
        clearTimeout(this.textareaRefreshTimeout);
    },

    focus() {
        if (this.refs.textarea) {
            safeInvoke({
                fn: this.refs.textarea.focus,
                context: this.refs.textarea
            });
        }
    },

    // Required Property API
    getValue() {
        return this.props.value;
    },

    refreshTextareaSize(refreshCount = 0) {
        const { textarea } = this.refs;

        if (!this.props.disabled && textarea) {
            this.textareaRefreshTimeout = setTimeout(() => {
                // If available, use a private method of react-textarea-autosize to refresh its size
                // eslint-disable-next-line no-underscore-dangle
                const { invoked } = safeInvoke(textarea._resizeComponent);

                // If the function's available, keep refreshing until we hit the max refresh count
                if (invoked && refreshCount < MAX_TEXTAREA_REFRESH_COUNT) {
                    this.refreshTextareaSize(refreshCount + 1);
                }
            }, TEXTAREA_REFRESH_TIME);
        }
    },

    onTextChange(event) {
        safeInvoke(this.props.onChange, event);
    },

    render() {
        const { convertLinks, disabled, maxRows, placeholder, rows, ...textareaProps } = this.props;
        const value = this.getValue();

        // TextareaAutosize doesn't implement a disabled prop, so switch to using a <pre>
        // when this input's disabled.
        if (!disabled) {
            return (
                <TextareaAutosize
                    ref="textarea"
                    {...textareaProps}
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
                <pre {...textareaProps} styleName="disabled">
                    {convertLinks ? anchorize(value) : value}
                </pre>
            );
        }
    }
});


export default CssModules(InputTextarea, styles);
