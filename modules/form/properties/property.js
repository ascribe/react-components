import React from 'react';
import classNames from 'classnames';
import CssModules from 'react-css-modules';

import { validateInput } from '../utils/private/validation_utils';

import { noop, safeInvoke } from '../../utils/general';

import styles from './property.scss';


const { bool, element, func, node, shape, string } = React.PropTypes;

// Default layouts
const PropertyFooter = CssModules(({ footer }) => (
    <div styleName="footer">{footer}</div>
), styles);

const PropertyLabel = CssModules(({ error, htmlFor, label }) => (
    <label htmlFor={htmlFor} styleName="label">
        <span className="pull-left">{label}</span>
        <span className="pull-right" styleName="error-label">{error}</span>
    </label>
), styles);

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
        footerType: func,
        hidden: bool,
        ignoreFocus: bool,
        label: node,
        labelType: func,
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
            footerType: PropertyFooter,
            labelType: PropertyLabel,
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

    onInputChange(event) {
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

    getStatus() {
        const { disabled, hidden } = this.props;
        const { errorMessage, hasWarning, isFocused } = this.state;

        if (hidden) {
            return 'hidden';
        } else if (disabled) {
            return 'fixed';
        } else if (errorMessage) {
            return 'error';
        } else if (isFocused) {
            return 'focused';
        } else if (hasWarning) {
            return 'warning';
        }
    },

    renderChildren() {
        const { children, disabled, name } = this.props;
        const { value } = this.state;

        // Ensure that only one child is used per property; if there is more than one child,
        // React.Children.only() will throw
        const child = React.Children.only(children);

        return React.cloneElement(child, {
            ref: (ref) => {
                this._refs.input = ref;

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
            name,
            disabled,
            value,
            onBlur: (...args) => {
                safeInvoke(child.props.onBlur, ...args);
                this.onBlur(...args);
            },
            onChange: (...args) => {
                safeInvoke(child.props.onChange, ...args);
                this.onInputChange(...args);
            },
            onFocus: (...args) => {
                safeInvoke(child.props.onFocus, ...args);
                this.handleFocus();
            },
            setWarning: this.setWarning
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
        const {
            className,
            footer,
            label,
            name,
            footerType: FooterType,
            labelType: LabelType,
            layoutType: LayoutType
        } = this.props;
        const { errorMessage } = this.state;

        const labelElement = label || errorMessage ? (
            <LabelType error={errorMessage} htmlFor={name} label={label} />
        ) : null;

        const footerElement = footer ? (<FooterType footer={footer} />) : null;

        return (
            <LayoutType className={className} handleFocus={this.handleFocus} status={this.getStatus()}>
                {labelElement}
                {this.renderChildren()}
                {footerElement}
            </LayoutType>
        );
    }
});

export default CssModules(Property, styles);