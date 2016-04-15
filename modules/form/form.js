import coreIncludes from 'core-js/library/fn/array/includes';

import React from 'react';
import CssModules from 'react-css-modules';

import CollapsibleCheckboxProperty from './properties/collapsible_checkbox_property';
import CollapsibleProperty from './properties/collapsible_property';
import Property from './properties/property';

import Button from '../buttons/button';
import ButtonList from '../buttons/button_list';

import { safeInvoke } from '../utils/general';

import styles from './form.scss';


const { arrayOf, bool, func, node, oneOf, shape, string } = React.PropTypes;

// Property types that Form will always recognize and track
const TRACKED_PROPERTY_TYPES = [CollapsibleCheckboxProperty, CollapsibleProperty, Property];

const EditedButtonList = ({ handleCancel }) => (
    <ButtonList pull="right">
        <Button type="submit">
            SAVE
        </Button>
        <Button
            classType="tertiary"
            onClick={handleCancel}
            type="button">
            CANCEL
        </Button>
    </ButtonList>
);

/**
 * All webkit-based browsers are ignoring the attribute autoComplete="off", as stated here:
 * http://stackoverflow.com/questions/15738259/disabling-chrome-autofill/15917221#15917221,
 * so if props.autoComplete is set to "off", we insert fake hidden inputs that mock the given
 * fields to trick chrome/safari into filling those instead of the actual fields
 */
const FakeAutoCompleteInputs = ({ fields }) => (
    <div style={{display: 'none'}}>
        {fields.map(({ name, type }) => {
            const fakeName = `fake-${name}`;

            return (<input key={fakeName} name={fakeName} type={type} />);
        })}
    </div>
);

const FormHeader = CssModules(({ header }) => (<h3 styleName="header">{header}</h3>), styles);

EditedButtonList.displayName = 'EditedButtonList';
FakeAutoCompleteInputs.displayName = 'FakeAutoCompleteInputs';
FormHeader.displayName = 'FormHeader';

const Form = React.createClass({
    propTypes: {
        children: node.isRequired,

        autoComplete: oneOf(['on', 'off']),
        buttonDefault: node,
        buttonEdited: node,
        buttonSubmitting: node,
        className: string,

        // Any additional custom property types that the form should track.
        // Regardless of custom types given here, Form will always recognize the property types
        // in TRACKED_PROPERTY_TYPES
        customPropertyTypes: arrayOf(func),

        disabled: bool, // Can be used to freeze the whole form
        fakeAutoCompleteFields: arrayOf(shape({
            name: string,
            type: string
        })),
        header: string,
        headerType: func,
        onSubmit: func,
        onValidationError: func
    },

    getDefaultProps() {
        return {
            autoComplete: 'off',
            buttonEdited: (<EditedButtonList />),
            customPropertyTypes: [],
            fakeAutoCompleteFields: [{
                name: 'username',
                type: 'text'
            }, {
                name: 'password',
                type: 'password'
            }],
            headerType: FormHeader
        };
    },

    getInitialState() {
        return {
            edited: false,
            submitting: false
        };
    },

    componentWillMount() {
        // Set up internal storage for callback refs
        this._refs = {};
    },

    reset() {
        // Reset child Properties too
        Object.values(this._refs).forEach((propertyRef) => propertyRef.reset());

        this.setState({
            edited: false,
            submitting: false
        });
    },

    onPropertyChange() {
        if (!this.state.edited) {
            this.setState({ edited: true });
        }
    },

    onSubmit(event) {
        const { onSubmit, onValidationError } = this.props;

        event.preventDefault();

        const errors = this.validate();
        if (Object.keys(errors).length) {
            safeInvoke(onValidationError, errors);
        } else {
            const { invoked, result } = safeInvoke(onSubmit, this.getFormData());

            if (invoked) {
                result.then(this.onSubmitComplete((propertyRef) => propertyRef.onSubmitSuccess()))
                      .catch(this.onSubmitComplete((propertyRef) => propertyRef.onSubmitError()));
            }

            this.setState({ submitting: true });
        }
    },

    getFormData() {
        return Object.entries(this._refs).reduce((formData, [name, propertyRef]) => {
            formData[name] = propertyRef.getValue();
            return formData;
        }, {});
    },

    onSubmitComplete(propertyFn) {
        return () => {
            Object.values(this._refs).forEach(propertyFn);

            this.setState({ edited: false, submitting: false });
        }
    },

    getButtons() {
        const { buttonDefault, buttonEdited, buttonSubmitting, disabled } = this.props;
        const { edited, submitting } = this.state;

        let buttons = buttonDefault;
        if (submitting && buttonSubmitting) {
            buttons = buttonSubmitting;
        } else if (edited && !disabled && !submitting && buttonEdited) {
            buttons = buttonEdited;
        }

        return buttons ? React.cloneElement(buttons, {
            handleCancel: this.reset,
            handleSubmit: this.onSubmit
        }) : null;
    },

    renderChildren() {
        const { children, customPropertyTypes, disabled } = this.props;
        const trackedPropertyTypes = TRACKED_PROPERTY_TYPES.concat(customPropertyTypes);

        // Reset and reregister our tracked Properties to ensure we're not tracking any Properties
        // that were removed
        this._refs = {};

        return React.Children.map(children, (child) => {
            // Only register child Properties that are of a type known to this Form
            if (coreIncludes(trackedPropertyTypes, child.type)) {
                const { props: { disabled: childDisabled, name, onChange, overrideFormDefaults } } = child;

                return React.cloneElement(child, {
                    key: name,
                    ref: (ref) => {
                        this._refs[name] = ref;

                        // By attaching refs to the child from this component, we're overwriting any
                        // already attached refs to the child from parent components. Since we'd still
                        // like parents to be able to attach refs to nested `Form` or `Property`s,
                        // we need to invoke their callback refs with our refs here.
                        safeInvoke({
                            fn: child.ref,
                            context: child,
                            params: [ref]
                        });
                    },
                    // By default, the child is disabled if it or the entire form is disabled.
                    // If the entire form is disabled, a child can still be activated if it uses
                    // the `overrideFormDefaults` prop to control its disabled status itself.
                    disabled: overrideFormDefaults ? childDisabled : disabled || childDisabled,
                    onChange: (...args) => {
                        safeInvoke(onChange, ...args);
                        this.onPropertyChange();
                    }
                });
            } else {
                return child;
            }
        });
    },

    // Validate all child Properties we're keeping track of
    validate() {
        return Object.entries(this._refs).reduce((errors, [name, propertyRef]) => {
            const error = propertyRef.validate();

            if (error) {
                errors[name] = error;
            }

            return errors;
        }, {});
    },

    render() {
        const {
            autoComplete,
            className,
            fakeAutoCompleteFields,
            header,
            headerType: HeaderType
        } = this.props;

        const fakeAutoCompleteInputs = autoComplete === 'on' && fakeAutoCompleteFields.length ? (
            <FakeAutoCompleteInputs fields={fakeAutoCompleteFields} />
        ) : null;

        const headerElement = header ? (<HeaderType header={header} />) : null;

        return (
            <form
                autoComplete={autoComplete}
                className={className}
                onSubmit={this.onSubmit}
                role="form">
                {headerElement}
                {fakeAutoCompleteInputs}
                {this.renderChildren()}
                {this.getButtons()}
            </form>
        );
    }
});

export default Form;
