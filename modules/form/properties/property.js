import React from 'react';
import classNames from 'classnames';
import CssModules from 'react-css-modules';

import { noop, safeInvoke } from 'js-utility-belt/es6';

import { validateInput } from '../utils/private/validation_utils';

import styles from './property.scss';


const { any, arrayOf, bool, element, func, node, oneOfType, string } = React.PropTypes;

// Default layouts
const PropertyErrorLabel = CssModules(({ errors }) => (
    // Show show the first error, if any
    errors && errors.length ? (<div styleName="label-error">{errors[0]}</div>)
                            : null
), styles);

const PropertyFooter = CssModules(({ footer }) => (
    footer ? (<div styleName="footer">{footer}</div>)
           : null
), styles);

const PropertyLabel = CssModules(({ htmlFor, label, ...props }) => (
    label ? (<label {...props} htmlFor={htmlFor} styleName="label">{label}</label>)
          : null
), styles);

// The default layout component acts as both the Property container and its body
const PropertyLayout = CssModules(({ children, handleFocus, status }) => (
    <div
        onFocus={handleFocus}
        styleName={classNames('body', status ? `property-${status}` : 'property')}>
        {children}
    </div>
), styles, { allowMultiple: true });

PropertyErrorLabel.displayName = 'PropertyError';
PropertyFooter.displayName = 'PropertyFooter';
PropertyLabel.displayName = 'PropertyLabel';
PropertyLayout.displayName = 'PropertyLayout';

const Property = React.createClass({
    propTypes: {
        children: element.isRequired,
        name: string.isRequired,

        autoFocus: bool,
        className: string,

        /**
         * As the child input is controlled by this Property, the default value should be set using
         * the `defaultValue` (or, if using a checkbox, the `defaultChecked`) prop rather than on
         * the child input.
         *
         * If both `defaultChecked` and `defaultValue` are provided for checkbox inputs,
         * `defaultChecked` will be used.
         *
         * See http://facebook.github.io/react/docs/forms.html#controlled-components.
         */
        defaultChecked: oneOfType([bool, string]),
        defaultValue: oneOfType([bool, string]),

        disabled: bool,
        errorLabelType: func,
        errors: arrayOf(any),
        footer: node,
        footerType: func,
        hidden: bool,
        highlighted: bool,
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
         */
        overrideFormDefaults: bool
    },

    getDefaultProps() {
        return {
            /**
             * With react 15.0, we have to make sure that valueless controlled inputs should use
             * value="" instead of value={null}.
             */
            defaultValue: '',

            errorLabelType: PropertyErrorLabel,
            footerType: PropertyFooter,
            labelType: PropertyLabel,
            layoutType: PropertyLayout
        };
    },

    getInitialState() {
        const { defaultChecked, defaultValue } = this.props;
        const childType = this.getInputTypeOfChild();
        const initialValue = (childType === 'checkbox' && defaultChecked !== undefined)
            ? defaultChecked : defaultValue;

        return {
            /**
             * initialValue is used to reset the child input to its initial state. We initially use
             * the property's defaultValue / defaultChecked as this value, but this can change later
             * on as the form gets submitted and further changes are made (if the form has already
             * been submitted, resetting the form afterwards should restore it to its last
             * submission state).
             */
            initialValue,

            isFocused: false,

            /**
             * `value` is a representation of the child input's value that is used only to control
             * the input (ie. handle its edited value); any time we need to use the input's value,
             * we request it directly using its value property (on native inputs) or `getValue()`.
             *
             * As the child input is controlled, we can only set its value using the `value` (and
             * not the `defaultValue`) prop; hence, we initially set the value to be this
             * Property's initial value (defaultValue / defaultChecked).
             */
            value: initialValue
        };
    },

    componentDidMount() {
        if (this.props.autoFocus) {
            this.focus();
        }
    },

    focus() {
        if (this.props.ignoreFocus) {
            return;
        }

        // Safe invoke in case the inputElement is a component without a focus function
        safeInvoke({
            fn: this.inputElement.focus,
            context: this.inputElement
        });
    },

    getChild() {
        // Ensure that only one child is used per property; if there is more than one child,
        // React.Children.only() will throw
        return React.Children.only(this.props.children);
    },

    getInputTypeOfChild(child = this.getChild()) {
        if (child.props.hasOwnProperty('type')) {
            // If the child has a type defined, return that. Custom inputs can define their type, or
            // have their type passed down through props. Native inputs expose their DOM properties
            // through the `props` as well.
            return child.props.type;
        } else {
            // All other custom inputs should follow the default input API
            return 'normal';
        }
    },

    // Required by Form API
    getValue() {
        return this.getValueOfInputElement();
    },

    getValueOfInputElement() {
        const { getValue = noop, type, value } = this.inputElement;

        if (type === 'checkbox') {
            // Catch native checkboxes, ie. input[type="checkbox"], if they are used instead of a
            // custom input component
            return this.inputElement.checked;
        } else {
            // If our child input is not a native input element, we expect it to have a `getValue()`
            // method that give us its value.
            return value != null ? value : getValue();
        }
    },

    getStatus() {
        const { errors, disabled, highlighted, hidden } = this.props;
        const { isFocused } = this.state;

        if (hidden) {
            return 'hidden';
        } else if (disabled) {
            return 'fixed';
        } else if (errors && errors.length) {
            return 'error';
        } else if (isFocused) {
            return 'focused';
        } else if (highlighted) {
            return 'highlighted';
        } else {
            return '';
        }
    },

    reset() {
        const { initialValue } = this.state;

        this.setState({
            value: initialValue
        });

        // In case the input element needs more than just the value changed to the initial
        // value to reset it, it can expose a reset method
        safeInvoke({
            fn: this.inputElement.reset,
            context: this.inputElement
        });

        return initialValue;
    },

    // Required by Form API
    validate() {
        return validateInput(this.inputElement, this.getValueOfInputElement());
    },

    onBlur(event) {
        this.setState({ isFocused: false }, () => safeInvoke(this.props.onBlur, event));
    },

    onFocus(event) {
        this.setState({ isFocused: true }, () => safeInvoke(this.props.onFocus, event));
    },

    onInputChange(event) {
        const { name, onChange } = this.props;
        let value;

        if (event && event.target) {
            const { target } = event;

            if (target.type === 'checkbox') {
                value = target.checked;
            } else {
                value = target.value;
            }
        }

        this.setState({ value }, () => safeInvoke(onChange, value, name));
    },

    // Required by Form API
    onSubmitError() {
        // If submission failed, just unfocus any properties in the form
        this.setState({
            isFocused: false
        });
    },

    // Required by Form API
    onSubmitSuccess() {
        const newState = {
            isFocused: false
        };

        // Also update initialValue in case of the user updating and canceling their actions again.
        // We avoid doing this if we're already removing our child input's value as the "removed"
        // value isn't really representative of the input's default or last submitted value.
        if (!this.getChild().props.removeValue) {
            newState.initialValue = this.getValueOfInputElement();
        }

        this.setState(newState);
    },

    renderChildren() {
        const { disabled, ignoreFocus, name } = this.props;
        const { value } = this.state;

        const child = this.getChild();
        const {
            onBlur,
            onChange,
            onFocus,
            removeValue // If set on the child, set this child input's value to '' to reset it
        } = child.props;

        let valueProp;
        switch (this.getInputTypeOfChild(child)) {
            case 'checkbox':
                valueProp = 'checked';
                break;
            default:
                valueProp = 'value';
                break;
        }

        return React.cloneElement(child, {
            ref: (ref) => {
                this.inputElement = ref;

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

            disabled,
            name,
            id: name,

            // Control the child input's with this Property
            [valueProp]: removeValue ? '' : value,

            onBlur: (...args) => {
                safeInvoke(onBlur, ...args);
                this.onBlur(...args);
            },
            onChange: (...args) => {
                safeInvoke(onChange, ...args);
                this.onInputChange(...args);
            },
            onFocus: ignoreFocus ? noop : (...args) => {
                safeInvoke(onFocus, ...args);
                this.onFocus();
            }
        });
    },

    render() {
        const {
            className,
            errors,
            footer,
            label,
            name,
            errorLabelType: ErrorLabelType,
            footerType: FooterType,
            labelType: LabelType,
            layoutType: LayoutType
        } = this.props;

        const errorElement = ErrorLabelType ? (<ErrorLabelType errors={errors} />) : null;
        const labelElement = LabelType ? (<LabelType htmlFor={name} label={label} />) : null;
        const footerElement = FooterType ? (<FooterType footer={footer} />) : null;

        return (
            <LayoutType
                className={className}
                handleFocus={this.focus}
                status={this.getStatus()}>
                {errorElement}
                {labelElement}
                {this.renderChildren()}
                {footerElement}
            </LayoutType>
        );
    }
});

export default Property;
