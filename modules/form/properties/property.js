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

const Property = React.createClass({
    propTypes: {
        children: element.isRequired,
        name: string.isRequired,

        autoFocus: bool,
        checkbox: shape({
            label: string,
            show: bool
        }),
        className: string,
        createErrorMessage: func,
        disabled: bool,

        // For `expanded` there are actually three use cases:
        //
        // 1. Completely control its value from the outside (did not define `checkbox.show` prop)
        // 2. Let it be controlled from the inside (default value can be set though via `expanded`)
        // 3. Let it be controlled from a parent / child by using `setExpanded` (`expanded` must
        //    not be set from the outside as a prop then(!!!))
        expanded: bool,

        footer: node,
        ignoreFocus: bool,
        label: string,
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
            checkbox: {},
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
        };
    },

    getInitialState() {
        const { checkbox: { show: showCheckbox }, expanded, ignoreFocus } = this.props;

        return {
            // Mirror expanded here to set the initial state.
            // This isn't an antipattern as long as it's not a "source of truth"-duplication
            expanded,

            // If a showCheckbox is defined in the props, set `ignoreFocus` to true to avoid
            // showing the focused styling when the property is selected.
            ignoreFocus: ignoreFocus || showCheckbox,

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

    componentWillReceiveProps(nextProps) {
        const { checkbox: { show: showCheckbox } } = this.props;
        const newState = {};

        // Handle the case where `expanded` is changed from outside and there's no checkbox
        // controlling the `expanded` state
        if (nextProps.expanded !== this.state.expanded && !showCheckbox) {
            newState.expanded = nextProps.expanded;
        }

        // Handle the case where `ignoreFocus` is changed from outside and we're not ignoring it
        // for the checkbox
        if (nextProps.ignoreFocus !== this.state.ignoreFocus && !showCheckbox) {
            newState.ignoreFocus = nextProps.ignoreFocus;
        }

        if (Object.keys(newState).length) {
            this.setState(newState);
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

    setExpanded(expanded) {
        this.setState({ expanded });
    },

    handleCheckboxToggle() {
        const { expanded: curExpanded, initialValue } = this.state;
        const newState = {
            expanded: !curExpanded
        };

        // Reset the value to be the initial value when the checkbox is unticked (ie. when
        // `expanded` is still true) since the user doesn't want to specify their own value.
        if (curExpanded) {
            state.value = initialValue;
        }

        this.setState(newState);
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
                    setExpanded: this.setExpanded,
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
            });
        } else {
            return null;
        }
    },

    getCheckbox() {
        const { checkbox: { label: checkboxLabel, show: showCheckbox }, name } = this.props;

        if (showCheckbox) {
            return (
                <div
                    className="ascribe-property-collapsible-toggle"
                    onClick={this.handleCheckboxToggle}>
                    <input
                        checked={this.state.expanded}
                        name={`${name}-checkbox`}
                        onChange={this.handleCheckboxToggle}
                        type="checkbox" />
                    <span className="checkbox">&nbsp;{checkboxLabel}</span>
                </div>
            );
        } else {
            return null;
        }
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
        );
    }
});

export default Property;
