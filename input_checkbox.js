'use strict';

import React from 'react';

let InputCheckbox = React.createClass({
    propTypes: {
        required: React.PropTypes.bool,
        defaultChecked: React.PropTypes.bool,
        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.element),
            React.PropTypes.element
        ])
    },

    getDefaultProps() {
        return {
            defaultChecked: false
        };
    },

    getInitialState() {
        return {
            value: null
        };
    },

    componentWillReceiveProps(nextProps) {
        if(this.props.defaultValue) {
            console.warn('InputCheckbox is of type checkbox. Therefore its value is represented by checked and defaultChecked.');
        }

        if(this.state.value === null) {
            this.setState({value: !!nextProps.defaultChecked });
        }
    },

    onChange() {
        let inverseValue = !this.refs.checkbox.getDOMNode().checked;

        this.setState({value: inverseValue});
        
        this.props.onChange({
            target: {
                value: inverseValue
            }
        });

    },

    render() {
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