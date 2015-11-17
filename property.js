'use strict';

import React from 'react';
import ReactAddons from 'react/addons';

import Panel from 'react-bootstrap/lib/Panel';

import AppConstants from '../../constants/application_constants';

import { mergeOptions } from '../../utils/general_utils';


const { bool, element, string, oneOfType, func, object, arrayOf } = React.PropTypes;

const Property = React.createClass({
    propTypes: {
        editable: bool,

        // If we want Form to have a different value for disabled as Property has one for
        // editable, we need to set overrideForm to true, as it will then override Form's
        // disabled value for individual Properties
        overrideForm: bool,

        label: string,
        value: oneOfType([
            string,
            element
        ]),
        footer: element,
        handleChange: func,
        ignoreFocus: bool,
        name: string.isRequired,
        className: string,

        onClick: func,
        onChange: func,
        onBlur: func,

        children: oneOfType([
            arrayOf(element),
            element
        ]),
        style: object,
        expanded: bool
    },

    getDefaultProps() {
        return {
            editable: true,
            expanded: true,
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
        if(childInput && typeof childInput.getDOMNode().value !== 'undefined') {
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
        let input = this.refs.input;

        // maybe do reset by reload instead of front end state?
        this.setState({value: this.state.initialValue});

        if(input.state && input.state.value) {
            // resets the value of a custom react component input
            input.state.value = this.state.initialValue;
        }

        // For some reason, if we set the value of a non HTML element (but a custom input),
        // after a reset, the value will be be propagated to this component.
        //
        // Therefore we have to make sure only to reset the initial value
        // of HTML inputs (which we determine by checking if there 'type' attribute matches
        // the ones included in AppConstants.possibleInputTypes).
        let inputDOMNode = input.getDOMNode();
        if(inputDOMNode.type && typeof inputDOMNode.type === 'string' &&
           AppConstants.possibleInputTypes.indexOf(inputDOMNode.type.toLowerCase()) > -1) {
            inputDOMNode.value = this.state.initialValue;
        }

        // For some inputs, reseting state.value is not enough to visually reset the
        // component.
        //
        // So if the input actually needs a visual reset, it needs to implement
        // a dedicated reset method.
        if(typeof input.reset === 'function') {
            input.reset();
        }
    },

    handleChange(event) {
        this.props.handleChange(event);
        if (typeof this.props.onChange === 'function') {
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
        if(typeof this.props.onClick === 'function') {
            this.props.onClick();
        }
        // skip the focus of non-input elements
        let nonInputHTMLElements = ['pre', 'div'];
        if (this.refs.input &&
            nonInputHTMLElements.indexOf(this.refs.input.getDOMNode().nodeName.toLowerCase()) > -1 ) {
            return;
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

        if(typeof this.props.onBlur === 'function') {
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
            errors: errors.pop()
        });
    },

    clearErrors(){
        this.setState({errors: null});
    },

    getClassName() {
        if(!this.props.expanded){
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
                ref: 'input',
                name: this.props.name
            });
        });
    },

    getLabelAndErrors() {
        if(this.props.label || this.state.errors) {
            return (
                <p>
                    <span className="pull-left">{this.props.label}</span>
                    <span className="pull-right">{this.state.errors}</span>
                </p>
            );
        } else {
            return null;
        }
    },

    render() {
        let footer = null;
        let style = this.props.style ? mergeOptions({}, this.props.style) : {};

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
                className={'ascribe-property-wrapper ' + this.getClassName()}
                onClick={this.handleFocus}
                style={style}>
                <Panel
                    collapsible
                    expanded={this.props.expanded}
                    className="bs-custom-panel">
                    <div className={'ascribe-property ' + this.props.className}>
                        {this.getLabelAndErrors()}
                        {this.renderChildren(style)}
                        {footer}
                    </div>
                </Panel>
            </div>
        );
    }
});

export default Property;
