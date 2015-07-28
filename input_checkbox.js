'use strict';

import React from 'react';

let InputCheckbox = React.createClass({
    propTypes: {
        required: React.PropTypes.bool,
        defaultChecked: React.PropTypes.bool,
        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.element),
            React.PropTypes.element
        ]).isRequired
    },

    getInitialState() {
        return {
            value: this.props.defaultChecked
        };
    },

    componentDidMount() {
        this.props.onChange({
            target: {
                value: this.state.value
            }
        });
    },

    onChange() {
        let value = !this.refs.checkbox.getDOMNode().checked;
        this.setState({value: value});
        this.props.onChange({
            target: {
                value: value
            }
        });
    },

    render() {
        console.log(this.state.value);
        return (
            <span
                onClick={this.onChange}>
                <input
                    type="checkbox"
                    ref="checkbox"
                    onChange={this.onChange}
                    checked={this.state.value}
                    defaultChecked={this.props.defaultChecked}/>
                <span className="checkbox">
                    {this.props.children}
                </span>
            </span>
        );
    }
});

export default InputCheckbox;