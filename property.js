'use strict';

import React from 'react';
import ReactAddons from 'react/addons';

import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

import { mergeOptions } from '../../utils/general_utils';

let Property = React.createClass({
    propTypes: {
        hidden: React.PropTypes.bool,

        editable: React.PropTypes.bool,

        // If we want Form to have a different value for disabled as Property has one for
        // editable, we need to set overrideForm to true, as it will then override Form's
        // disabled value for individual Properties
        overrideForm: React.PropTypes.bool,

        tooltip: React.PropTypes.element,
        label: React.PropTypes.string,
        value: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
        ]),
        footer: React.PropTypes.element,
        handleChange: React.PropTypes.func,
        ignoreFocus: React.PropTypes.bool,
        className: React.PropTypes.string,

        onClick: React.PropTypes.func,
        onChange: React.PropTypes.func,
        onBlur: React.PropTypes.func,

        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.element),
            React.PropTypes.element
        ]),
        style: React.PropTypes.object
    },

    getDefaultProps() {
        return {
            editable: true,
            hidden: false,
            className: ''
        };
    },

    getInitialState() {
        return {
            // Please don't confuse initialValue with react's defaultValue.
            // initialValue is set by us to ensure that a user can reset a specific
            // property (after editing) to its initial value
            initialValue: null,
            value: null,
            isFocused: false,
            errors: null
        };
    },

    componentWillReceiveProps() {
        let childInput = this.refs.input;

        // In order to set this.state.value from another component
        // the state of value should only be set if its not undefined and
        // actually references something
        if(typeof childInput.getDOMNode().value !== 'undefined') {
            this.setState({
                value: childInput.getDOMNode().value
            });

        // When implementing custom input components, their value isn't exposed like the one
        // from native HTML elements.
        // To enable developers to create input elements, they can expose a property called value
        // in their state that will be picked up by property.js
        } else if(childInput.state && typeof childInput.state.value !== 'undefined') {
            this.setState({
                value: childInput.state.value
            });
        }

        if(!this.state.initialValue && childInput.props.defaultValue) {
            this.setState({
                initialValue: childInput.props.defaultValue
            });
        }
    },

    reset() {
        // maybe do reset by reload instead of front end state?
        this.setState({value: this.state.initialValue});

        // resets the value of a custom react component input
        this.refs.input.state.value = this.state.initialValue;

        // resets the value of a plain HTML5 input
        this.refs.input.getDOMNode().value = this.state.initialValue;

        // For some inputs, reseting state.value is not enough to visually reset the
        // component.
        //
        // So if the input actually needs a visual reset, it needs to implement
        // a dedicated reset method.
        if(this.refs.input.reset && typeof this.refs.input.reset === 'function') {
            this.refs.input.reset();
        }
    },

    handleChange(event) {

        this.props.handleChange(event);
        if (this.props.onChange && typeof this.props.onChange === 'function') {
            this.props.onChange(event);
        }

        this.setState({value: event.target.value});
    },

    handleFocus() {
        // if ignoreFocus (bool) is defined, then just ignore focusing on
        // the property and input
        if(this.props.ignoreFocus) {
            return;
        }

        // if onClick is defined from the outside,
        // just call it
        if(this.props.onClick && typeof this.props.onClick === 'function') {
            this.props.onClick();
        }

        this.refs.input.getDOMNode().focus();
        this.setState({
            isFocused: true
        });
    },

    handleBlur(event) {
        this.setState({
            isFocused: false
        });

        if(this.props.onBlur && typeof this.props.onBlur === 'function') {
            this.props.onBlur(event);
        }
    },

    handleSuccess(){
        this.setState({
            isFocused: false,
            errors: null,

            // also update initialValue in case of the user updating and canceling its actions again
            initialValue: this.refs.input.getDOMNode().value
        });
    },

    setErrors(errors){
        this.setState({
            errors: errors.map((error) => {
                return <span className="pull-right" key={error}>{error}</span>;
            })
        });
    },

    clearErrors(){
        this.setState({errors: null});
    },

    getClassName() {
        if(this.props.hidden){
            return 'is-hidden';
        }
        if(!this.props.editable){
            return 'is-fixed';
        }
        if (this.state.errors){
            return 'is-error';
        }
        if(this.state.isFocused) {
            return 'is-focused';
        } else {
            return '';
        }
    },

    renderChildren(style) {
        return ReactAddons.Children.map(this.props.children, (child) => {
            return ReactAddons.addons.cloneWithProps(child, {
                style,
                onChange: this.handleChange,
                onFocus: this.handleFocus,
                onBlur: this.handleBlur,
                disabled: !this.props.editable,
                ref: 'input'
            });
        });
    },

    render() {
        let footer = null;
        let tooltip = <span/>;
        let style = this.props.style ? mergeOptions({}, this.props.style) : {};

        if(this.props.tooltip){
            tooltip = (
                <Tooltip>
                    {this.props.tooltip}
                </Tooltip>);
        }
        
        if(this.props.footer){
            footer = (
                <div className="ascribe-property-footer">
                    {this.props.footer}
                </div>);
        }

        if(!this.props.editable) {
            style.cursor = 'not-allowed';
        }

        return (
            <div
                className={'ascribe-settings-wrapper ' + this.getClassName()}
                onClick={this.handleFocus}
                onFocus={this.handleFocus}
                style={style}>
                <OverlayTrigger
                    delay={500}
                    placement="top"
                    overlay={tooltip}>
                    <div className={'ascribe-settings-property ' + this.props.className}>
                        {this.state.errors}
                        <span>{ this.props.label}</span>
                        {this.renderChildren(style)}
                        {footer}
                    </div>
                </OverlayTrigger>
            </div>
        );
    }
});

export default Property;