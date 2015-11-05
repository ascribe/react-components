'use strict';

import React from 'react';
import ReactAddons from 'react/addons';

import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

import AppConstants from '../../constants/application_constants';

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
        name: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]).isRequired,
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
                ref: 'input',
                name: this.props.name
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
                className={'ascribe-property-wrapper ' + this.getClassName()}
                onClick={this.handleFocus}
                style={style}>
                <OverlayTrigger
                    delay={500}
                    placement="top"
                    overlay={tooltip}>
                    <div className={'ascribe-property ' + this.props.className}>
                        {this.state.errors}
                        <span>{this.props.label}</span>
                        {this.renderChildren(style)}
                        {footer}
                    </div>
                </OverlayTrigger>
            </div>
        );
    }
});

export default Property;
