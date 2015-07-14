'use strict';

import React from 'react';

import { getLangText } from '../../utils/lang_utils';

let InputCheckbox = React.createClass({
    propTypes: {
        required: React.PropTypes.string.isRequired,
        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.element),
            React.PropTypes.element
        ]).isRequired
    },

    getInitialState() {
        return {
            show: false
        };
    },

    handleFocus() {
        this.refs.checkbox.getDOMNode().checked = !this.refs.checkbox.getDOMNode().checked;
        this.setState({
            show: this.refs.checkbox.getDOMNode().checked,
            value: this.refs.checkbox.getDOMNode().checked
        });
    },

    render() {
        return (
            <span
                onClick={this.handleFocus}
                onFocus={this.handleFocus}>
                <input type="checkbox" ref="checkbox"/>
                <span className="checkbox">
                    {this.props.children}
                </span>
            </span>
        );
    }
});

export default InputCheckbox;