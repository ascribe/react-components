'use strict';

import React from 'react';

/**
 * This component can be used as a custom input element for form properties.
 * It exposes its state via state.value and can be considered as a reference implementation
 * for custom input components that live inside of properties.
 */
let InputCheckbox = React.createClass({
    propTypes: {
        required: React.PropTypes.bool,

        // As can be read here: https://facebook.github.io/react/docs/forms.html
        // inputs of type="checkbox" define their state via checked.
        // Their default state is defined via defaultChecked.
        //
        // Since this component even has checkbox in its name, it felt wrong to expose defaultValue
        // as the default-setting prop to other developers, which is why we choose defaultChecked.
        defaultValue: React.PropTypes.string,
        defaultChecked: React.PropTypes.bool,
        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.element),
            React.PropTypes.element
        ]),
        name: React.PropTypes.string,

        // provided by Property
        disabled: React.PropTypes.bool,
        onChange: React.PropTypes.func,

        // can be used to style the component from the outside
        style: React.PropTypes.object
    },

    // As HTML inputs, we're setting the default value for an input to checked === false
    getDefaultProps() {
        return {
            defaultChecked: false
        };
    },

    // Setting value to null in initialState is essentially since we're deriving a certain state from
    // value === null as can be seen in componentWillReceiveProps.
    getInitialState() {
        return {
            value: null
        };
    },

    componentWillReceiveProps(nextProps) {

        // Developer's are used to define defaultValues for inputs via defaultValue, but since this is a
        // input of type checkbox we warn the dev to not do that.
        if(this.props.defaultValue) {
            console.warn('InputCheckbox is of type checkbox. Therefore its value is represented by checked and defaultChecked. defaultValue will do nothing!');
        }

        // The first time InputCheckbox is rendered, we want to set its value to the value of defaultChecked.
        // This needs to be done in order to expose it for the Property component.
        // We can determine the first render by checking if value still has it's initialState(from getInitialState)
        if(this.state.value === null) {
            this.setState({value: nextProps.defaultChecked });
        }
    },

    onChange() {
        // if this.props.disabled is true, we're just going to ignore every click,
        // as the value should then not be changable by the user
        if(this.props.disabled) {
            return;
        }

        // On every change, we're inversing the input's value
        let inverseValue = !this.refs.checkbox.getDOMNode().checked;

        // pass it to the state
        this.setState({value: inverseValue});

        // and also call Property's onChange method
        // (in this case we're mocking event.target.value, since we can not use the event
        // coming from onChange. Its coming from the span (user is clicking on the span) and not the input)
        this.props.onChange({
            target: {
                value: inverseValue
            }
        });

    },

    render() {

        let style = {};

        // Some conditional styling if the component is disabled
        if(!this.props.disabled) {
            style.cursor = 'pointer';
            style.color = 'rgba(0, 0, 0, 0.5)';
        } else {
            style.cursor = 'not-allowed';
            style.color = 'rgba(0, 0, 0, 0.35)';
        }

        return (
            <span
                style={this.props.style}
                onClick={this.onChange}
                name={this.props.name}>
                <input
                    name={this.props.name}
                    type="checkbox"
                    ref="checkbox"
                    onChange={this.onChange}
                    checked={this.state.value}
                    defaultChecked={this.props.defaultChecked}/>
                <span
                    className="checkbox"
                    style={style}>
                    {this.props.children}
                </span>
            </span>
        );
    }
});

export default InputCheckbox;
