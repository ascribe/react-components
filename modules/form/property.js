import React from 'react';
import classNames from 'classnames';
import CssModules from 'react-css-modules';

import { validateInput } from 'utils/private/validation_utils';

import { noop, safeInvoke } from '../../utils/general_utils';

//FIXME: import styles


const { bool, func, string } = React.PropTypes;

const PropertyLabel = CssModules(({ error, label }) => (
    <p>
        <span className="pull-left">{label}</span>
        <span className="pull-right">{error}</span>
    </p>
), style);

const Property = React.createClass({
    propTypes: {
        children: node.isRequired,
        name: string.isRequired,

        autoFocus: bool,
        className: string,
        disabled: bool,

        // For `expanded` there are actually three use cases:
        //
        // 1. Completely control its value from the outside (did not define `showCheckbox` prop)
        // 2. Let it be controlled from the inside (default value can be set though via `expanded`)
        // 3. Let it be controlled from a parent / child by using `setExpanded` (`expanded` must
        //    not be set from the outside as a prop then(!!!))
        expanded: bool,

        footer: node,
        ignoreFocus: bool,
        label: string,
        onBlur: func,
        onChange: func,
        onError: func,
        onFocus: func,

        // By default Properties will use the Form's `disabled` prop to determine if they should
        // also be disabled. Use `overrideForm` to override the parent Form's `disabled` value
        // with this Property's `disabled` prop.
        // Note that this prop is only used in the Form when it registers Properties, so it is
        // not used elsewhere in this component.
        overrideForm: bool,

        showCheckbox: string
    },

    getDefaultProps() {
        return {
            expanded: true,
            onError: (error) => {
                switch (error) {
                  case 'min' || 'max:
                    return 'The field you defined is not in the valid range';
                  case 'pattern':
                    return 'The value you defined is not matching the valid pattern';
                  case 'required':
                    return 'This field is required';
                  default:
                    return null;
                }
            }
        };
    },

    getInitialState() {
        const { expanded, ignoreFocus, showCheckbox } = this.props;

        return {
            // Mirror expanded here to set the initial state.
            // This an antipattern as long as it's not a "source of truth"-duplication
            expanded,

            // If a showCheckbox is defined in the props, set `ignoreFocus` to true to avoid
            // showing the focused styling when the property is selected.
            ignoreFocus: ignoreFocus || showCheckbox,

            // Don't confuse this with defaultValue--this is meant for resetting inputs to their
            // original values
            // We have to wait until componentDidMount() to set this value, as it depends on the
            // child input also being mounted.
            initialValue: null,

            error: null,
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
            this.onFocus();
        }

        const initialValue = this.getValueOfInputElement();

        if (initialValue) {
            this.setState({
                initialValue,
                value: initialValue
            });
        }
    },

    componentWillReceiveProps(nextProps) {
        const newState = {};

        // Handle the case where `expanded` is changed from outside and there's no checkbox
        // controlling the `expanded` state
        if (nextProps.expanded !== this.state.expanded && !this.props.showCheckbox) {
            newState.expanded = nextProps.expanded;
        }

        // Handle the case where `ignoreFocus` is changed from outside and we're not ignoring it
        // for the checkbox
        if (nextProps.ignoreFocus !== this.state.ignoreFocus && !this.props.showCheckbox) {
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

    onFocus(event) {
        // If ignoreFocus (bool) is defined, then just ignore the attempt to focus
        if (this.state.ignoreFocus) {
            return;
        }

        const inputElement = this._refs.input;

        if (inputElement) {
            // Skip the focus of non-input native elements
            // The nodeName property is only available on the ref if it's a native element
            const inputNodeName = inputElement.nodeName || '';
            if (['pre', 'div'].includes(inputNodeName.toLowerCase())) {
                return;
            }

            // Safe invoke in case the inputElement is a component without a focus function
            safeInvoke(inputElement.focus);

            this.setState({ isFocused: true }, () => safeInvoke(this.props.onFocus, event));
        }
    },

    onBlur(event) {
        this.setState({ isFocused: false }, () => safeInvoke(this.props.onBlur, event));
    },

    handleSuccess() {
        this.setState({
            isFocused: false,

            // Also update initialValue in case of the user updating and canceling its actions again
            initialValue: this.getValueOfInputElement()
        });
    },

    getValueOfInputElement() {
        const { input: { getValue = noop, value } = {} } = this._refs;

        return value || getValue();
    },

    setWarning(hasWarning) {
        this.setState({ hasWarning });
    },

    getClassName() {
        const { disabled, showCheckbox } = this.props;
        const { error, expanded, hasWarning, isFocused } = this.state;

        if (!expanded && !showCheckbox) {
            return 'is-hidden';
        } else if (disabled) {
            return 'is-fixed';
        } else if (error) {
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
        const { children, disabled, name, showCheckbox } = this.props;
        const { expanded, value } = this.state;

        // We don't need to clone the input with our handlers unless it's actually being shown
        if (expanded || !showCheckbox) {
            return React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    ref: (ref) => {
                        this._refs.input = ref;

                        // By attaching refs to the child from this component, we're overwriting any
                        // already attached refs to the child. As we'd still like to allow parents
                        // to register refs with the child inputs, we need to invoke their callback
                        // refs with our refs here.
                        safeInvoke(child.ref, ref);
                    },
                    name,
                    disabled,
                    value,
                    onBlur: this.onBlur,
                    onChange: this.onChange,
                    onFocus: this.onFocus,
                    setExpanded: this.setExpanded,
                    setWarning: this.setWarning,
                });
            });
        } else {
            return null;
        }
    },

    //FIXME
    getCheckbox() {
        const { name, showCheckbox } = this.props;

        if (showCheckbox) {
            return (
                <div
                    className="ascribe-property-collapsible-toggle"
                    onClick={this.handleCheckboxToggle}>
                    <input
                        name={`${name}-checkbox`}
                        checked={this.state.expanded}
                        onChange={this.handleCheckboxToggle}
                        type="checkbox" />
                    <span className="checkbox">{' ' + showCheckbox}</span>
                </div>
            );
        } else {
            return null;
        }
    },

    validate() {
        if (this._ref.input) {
            const error = validateInput(this._ref.input, this.getValueOfInputElement());

            if (error) {
                //FIXME: use safeInvoke
                if (typeof this.props.onError === 'function') {
                    this.setState({
                        error: this.props.onError(error)
                    });

                    return error;
                }
            }
        }
    },

    render() {
        const { className, footer, label } = this.props;
        const { error, expanded } = this.state;

        const labelElement = label || error ? (
            <PropertyLabel error={error} label={label} />
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
