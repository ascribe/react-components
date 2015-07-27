'use strict';

import React from 'react';

let InputCheckbox = React.createClass({
    propTypes: {
        required: React.PropTypes.string.isRequired,
        defaultValue: React.PropTypes.bool,
        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.element),
            React.PropTypes.element
        ]).isRequired
    },
    getDefaultProps() {
        return {
            required: 'required'
        };
    },

    getInitialState() {
        return {
            //show: false
            value: this.props.defaultValue
        };
    },

    onChange: function(event) {
        let newValue = !this.state.value;
        event.target.value = newValue;
        this.props.onChange(event);
        event.stopPropagation();
        this.setState({value: newValue});
    },

    render() {
        return (
            <span
                onClick={this.onChange}>
                <input
                    type="checkbox"
                    ref="checkbox"
                    onChange={this.onChange}
                    checked={this.state.value}/>
                <span className="checkbox">
                    {this.props.children}
                </span>
            </span>
        );
    }
});

export default InputCheckbox;