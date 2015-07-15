'use strict';

import React from 'react';

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

    handleFocus(event) {
        this.refs.checkbox.getDOMNode().checked = !this.refs.checkbox.getDOMNode().checked;
        
        // This is calling property.js's method handleChange which
        // expects an event object
        // Since we don't have a valid one, we'll just manipulate the one we get and send
        // it to handleChange
        event.target.value = this.refs.checkbox.getDOMNode().checked;
        this.props.onChange(event);
        event.stopPropagation();

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
                <input type="checkbox" ref="checkbox" required="required"/>
                <span className="checkbox">
                    {this.props.children}
                </span>
            </span>
        );
    }
});

export default InputCheckbox;