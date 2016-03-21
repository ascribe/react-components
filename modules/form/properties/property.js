import React from 'react';
import classNames from 'classnames';
import CssModules from 'react-css-modules';

import { validateInput } from '../utils/private/validation_utils';

import { noop, safeInvoke } from '../../utils/general';

//FIXME: import styles


const { bool, element, func, node, shape, string } = React.PropTypes;

const PropertyLabel = ({ error, label }) => (
    <p>
        <span className="pull-left">{label}</span>
        <span className="pull-right">{error}</span>
    </p>
);
// The default layout component acts as both the Property container and its body
const PropertyLayout = CssModules(({ children, handleFocus, status }) => (
    <div
        onClick={handleFocus}
        styleName={classNames('body', status ? `property-${status}` : 'property')}>
        {children}
    </div>
), styles, { allowMultiple: true });

const Property = React.createClass({
    propTypes: {
        children: element.isRequired,
        name: string.isRequired,

        autoFocus: bool,
        className: string,
        createErrorMessage: func,
        disabled: bool,
        footer: node,
        ignoreFocus: bool,
        label: string,
        layoutType: func,
        onBlur: func,
        onChange: func,
        onFocus: func,

        /**
         * By default, Properties will inherit some props from the parent Form for form-wide
         * attributes. Use `overrideFormDefaults` to signal to the parent Form that this
         * Property should avoid inheriting attributes and only use its own props.
         *
         * Note that this prop is only used by the Form when it registers Properties, so it is
         * not used elsewhere in this component.
         *
         * Currently inherited properties:
         *   - disabled: Disable this property
         *
         */
        overrideFormDefaults: bool
    },

    getDefaultProps() {
        return {
            createErrorMessage: (errorProp) => {
                switch (errorProp) {
                  case 'min' || 'max':
                    return 'The field you defined is not in the valid range';
                  case 'pattern':
                    return 'The value you defined is not matching the valid pattern';
                  case 'required':
                    return 'This field is required';
                  default:
                    return null;
                }
            },
            expanded: true
            layoutType: PropertyLayout
        };
    },

    getInitialState() {
        return {
            // Don't confuse this with defaultValue--this is meant for resetting inputs to their
            // original values
            // We have to wait until componentDidMount() to set this value, as it depends on the
            // child input also being mounted.
            initialValue: null,

            errorMessage: null,
            hasWarning: false,
            isFocused: false,
            value: null
        };
    },

    componentWillMount() {
        // Set up internal storage for callback refs
        this._refs = {};
    },

    componentDidMount() {
        if (this.props.autoFocus) {
            this.handleFocus();
        }

        const initialValue = this.getValueOfInputElement();

        if (initialValue) {
            // We need to wait until componentDidMount to set this state as we have to wait for
            // the input element to render
            this.setState({
                initialValue,
                value: initialValue
            });
        }
    },

    reset() {
        this.setState({
            value: this.state.initialValue
        });

        if (this._refs.input) {
            // In case the input element needs more than just the value changing to the initial
            // value to reset it, it can expose a reset method
            safeInvoke(this._refs.input.reset);
        }

        return this.state.initialValue;
    },

    onChange(event) {
        const value = event && event.target && event.target.value;

        this.setState({ value }, () => safeInvoke(this.props.onChange, value, event));
    },

    onBlur(event) {
        this.setState({ isFocused: false }, () => safeInvoke(this.props.onBlur, event));
    },

    handleFocus() {
        const { ignoreFocus, onFocus } = this.props;

        if (ignoreFocus) {
            return;
        }

        const { input: inputElement } = this._refs;

        if (inputElement) {
            // Skip the focus of non-input native elements
            // The nodeName property is only available on the ref if it's a native element
            const inputNodeName = inputElement.nodeName || '';
            if (['pre', 'div'].includes(inputNodeName.toLowerCase())) {
                return;
            }

            // Safe invoke in case the inputElement is a component without a focus function
            safeInvoke(inputElement.focus);

            this.setState({ isFocused: true }, () => safeInvoke(onFocus, event));
        }
    },

    handleSubmitFailure() {
        // If submission failed, just unfocus any properties in the form
        this.setState({
            isFocused: false
        });
    },

    handleSubmitSuccess() {
        this.setState({
            isFocused: false,

            // Also update initialValue in case of the user updating and canceling their actions again
            initialValue: this.getValueOfInputElement()
        });
    },

    getValueOfInputElement() {
        const { input: { getValue = noop, value } = {} } = this._refs;

        // If it's not a native input element, we expect the input element to have a `getValue()`
        // method that will let us get its value.
        return value || getValue();
    },

    setWarning(hasWarning) {
        this.setState({ hasWarning });
    },

    getClassName() {
        const { checkbox: { show: showCheckbox }, disabled } = this.props;
        const { errorMessage, expanded, hasWarning, isFocused } = this.state;

        if (!expanded && !showCheckbox) {
            return 'is-hidden';
        } else if (disabled) {
            return 'is-fixed';
        } else if (errorMessage) {
            return 'is-error';
        } else if (hasWarning) {
            return 'is-warning';
        } else if (isFocused) {
            return 'is-focused';
        } else {
            return '';
        }
    },




    renderChildren() {
        const { checkbox: { show: showCheckbox }, children, disabled, name } = this.props;
        const { expanded, value } = this.state;

        // We don't need to clone the input with our handlers unless it's actually being shown
        if (expanded || !showCheckbox) {
            return React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    ref: (ref) => {
                        this._refs.input = ref;

                    },
                    name,
                    disabled,
                    value,
                    onBlur: this.onBlur,
                    onChange: this.onChange,
                    onFocus: this.onFocus,
                    setWarning: this.setWarning,
                // By attaching refs to the child from this component, we're overwriting any
                // already attached refs to the child. As we'd still like to allow parents
                // to register refs with the child inputs, we need to invoke their callback
                // refs with our refs here.
                safeInvoke({
                    fn: child.ref,
                    context: child,
                    params: [ref]
                });
    },

    validate() {
        if (this._ref.input) {
            const errorProp = validateInput(this._ref.input, this.getValueOfInputElement());

            if (errorProp) {
                const { invoked, result: errorMessage } = safeInvoke(this.props.createErrorMessage, errorProp);

                if (invoked && errorMessage) {
                    this.setState({ errorMessage });
                }

                return errorProp;
            }
        }
    },

    render() {
        const { className, footer, label } = this.props;
        const { errorMessage, expanded } = this.state;

        const labelElement = label || errorMessage ? (
            <PropertyLabel error={errorMessage} label={label} />
        ) : null;

        const footerElement = footer ? (
            <div className="ascribe-property-footer">{footer}</div>
        ) : null;

        //FIXME: use our own simple collapsible panel
        return (
            <div
                className={classNames('ascribe-property-wrapper', this.getClassName())}
                onClick={this.onFocus}>
                {this.getCheckbox()}
                <Panel
                    collapsible
                    expanded={expanded}>
                    <div className={classNames('ascribe-property', className)}>
                        {label}
                        {this.renderChildren()}
                        {footer}
                    </div>
                </Panel>
            </div>
            <LayoutType className={className} handleFocus={this.handleFocus} status={this.getStatus()}>
                {labelElement}
                {this.renderChildren()}
                {footerElement}
            </LayoutType>
        );
    }
});

export default Property;
