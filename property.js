'use strict';

import React from 'react';
import ReactAddons from 'react/addons';

import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

let Property = React.createClass({
    propTypes: {
        hidden: React.PropTypes.bool,
        editable: React.PropTypes.bool,
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
            initialValue: null,
            value: null,
            isFocused: false,
            errors: null
        };
    },

    componentWillReceiveProps() {

        // In order to set this.state.value from another component
        // the state of value should only be set if its not undefined and
        // actually references something
        if(typeof this.refs.input.getDOMNode().value !== 'undefined') {
            this.setState({
                value: this.refs.input.getDOMNode().value
            });
        }

        this.setState({
            initialValue: this.refs.input.getDOMNode().defaultValue
        });
    },

    reset(){
        // maybe do reset by reload instead of frontend state?
        this.setState({value: this.state.initialValue});
        if (this.refs.input.state){
            // This is probably not the right way but easy fix
            this.refs.input.state.value = this.state.initialValue;
        }
        else{
            this.refs.input.getDOMNode().value = this.state.initialValue;
        }

    },

    handleChange(event) {

        this.props.handleChange(event);
        if ('onChange' in this.props) {
            this.props.onChange(event);
        }

        this.setState({value: true});
    },

    handleFocus() {
        // if ignoreFocus (bool) is defined, then just ignore focusing on
        // the property and input
        if(this.props.ignoreFocus) {
            return;
        }

        // if onClick is defined from the outside,
        // just call it
        if(this.props.onClick) {
            this.props.onClick();
        }

        this.refs.input.getDOMNode().focus();
        this.setState({
            isFocused: true
        });
    },

    handleBlur() {
        this.setState({
            isFocused: false
        });
    },

    handleSuccess(){
        this.setState({
            isFocused: false,
            errors: null
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

    renderChildren() {
        return ReactAddons.Children.map(this.props.children, (child) => {
            return ReactAddons.addons.cloneWithProps(child, {
                value: this.state.value,
                onChange: this.handleChange,
                onFocus: this.handleFocus,
                onBlur: this.handleBlur,
                disabled: !this.props.editable,
                ref: 'input'
            });
        });
    },

    render() {
        let tooltip = <span/>;
        if (this.props.tooltip){
            tooltip = (
                <Tooltip>
                    {this.props.tooltip}
                </Tooltip>);
        }
        let footer = null;
        if (this.props.footer){
            footer = (
                <div className="ascribe-property-footer">
                    {this.props.footer}
                </div>);
        }
        return (
            <div
                className={'ascribe-settings-wrapper ' + this.getClassName()}
                onClick={this.handleFocus}
                onFocus={this.handleFocus}
                style={this.props.style}>
                <OverlayTrigger
                    delay={500}
                    placement="top"
                    overlay={tooltip}>
                    <div className={'ascribe-settings-property ' + this.props.className}>
                        {this.state.errors}
                        <span>{ this.props.label}</span>
                        {this.renderChildren()}
                        {footer}
                    </div>
                </OverlayTrigger>
            </div>
        );
    }
});

export default Property;