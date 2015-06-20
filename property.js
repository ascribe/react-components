'use strict';

import React from 'react';
import ReactAddons from 'react/addons';

import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

let Property = React.createClass({
    propTypes: {
        editable: React.PropTypes.bool,
        label: React.PropTypes.string,
        value: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
        ]),
        handleChange: React.PropTypes.func
    },

    getDefaultProps() {
        return {
            editable: true
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
    componentWillReceiveProps(){
        this.setState({
            initialValue: this.refs.input.getDOMNode().defaultValue,
            value: this.refs.input.getDOMNode().value
        });
    },
    reset(){
        this.setState({value: this.state.initialValue});
        this.refs.input.getDOMNode().value = this.state.initialValue;
    },

    handleChange(event) {
        this.props.handleChange(event);
        this.setState({value: event.target.value});
    },
    handleFocus() {
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
        return (
            <div
                className={'ascribe-settings-wrapper ' + this.getClassName()}
                onClick={this.handleFocus} onfocus={this.handleFocus}>
                <OverlayTrigger
                    delay={500}
                    placement="top"
                    overlay={tooltip}>
                    <div className="ascribe-settings-property">
                        {this.state.errors}
                        <span>{ this.props.label}</span>
                        {this.renderChildren()}
                    </div>
                </OverlayTrigger>
            </div>
        );
    }
});

export default Property;