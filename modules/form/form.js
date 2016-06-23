import coreIncludes from 'core-js/library/fn/array/includes';

import React from 'react';

import { safeInvoke } from 'js-utility-belt/es6';

import Property from './properties/property';
import SimpleProperty from './properties/simple_property';

import FakeAutoCompleteInputs from './utils/fake_auto_complete_inputs';

import Grouping from '../ui/grouping';


const { arrayOf, bool, func, node, object, oneOf, shape, string } = React.PropTypes;

// Property types that Form will always recognize and track
const DEFAULT_TRACKED_PROPERTY_TYPES = [Property, SimpleProperty];

// eslint-disable-next-line react/prop-types
const EditedButtonList = ({ handleCancel }) => (
    <div className="clearfix">
        <Grouping className="pull-right">
            <button type="submit">
                SAVE
            </button>
            <button onClick={handleCancel} type="button">
                CANCEL
            </button>
        </Grouping>
    </div>
);

EditedButtonList.displayName = 'EditedButtonList';

function createFormForPropertyTypes(...TRACKED_PROPERTY_TYPES) {
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

            /**
             * Allows you to specify fake hidden inputs that will be inserted at the start of the form
             * when the `autoComplete` prop is also set to "off". This is necessary to trick
             * Webkit-based browsers, which ignore the `autoComplete="off"` attribute
             * (see http://stackoverflow.com/questions/15738259/disabling-chrome-autofill/15917221#15917221),
             * into autocompleting these fake inputs rather than the actual inputs.
             */
            fakeAutoCompleteInputs: shape({
                type: oneOf([FakeAutoCompleteInputs])
            }),

            onSubmit: func,
            onValidationError: func,
            style: object
        },

        getDefaultProps() {
            const fakeAutoCompleteFields = [{
                name: 'username',
                type: 'text'
            }, {
                name: 'password',
                type: 'password'
            }];

            return {
                autoComplete: 'off',
                buttonEdited: (<EditedButtonList />),
                customPropertyTypes: [],
                fakeAutoCompleteInputs: (<FakeAutoCompleteInputs fields={fakeAutoCompleteFields} />)
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

        getFormData() {
            return Object.entries(this._refs).reduce((formData, [name, propertyRef]) => {
                formData[name] = propertyRef.getValue();
                return formData;
            }, {});
        },

        reset() {
            // Reset child Properties too
            Object.values(this._refs).forEach((propertyRef) => propertyRef.reset());

            this.setState({
                edited: false,
                submitting: false
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

        onSubmitComplete(propertyFn) {
            return () => {
                Object.values(this._refs).forEach(propertyFn);

                this.setState({ edited: false, submitting: false });
            };
        },

        renderButtons() {
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
            const trackedPropertyTypes = customPropertyTypes.concat(
                TRACKED_PROPERTY_TYPES,
                DEFAULT_TRACKED_PROPERTY_TYPES
            );

            // Reset and reregister our tracked Properties to ensure we're not tracking any
            // Properties that were removed
            this._refs = {};

            return React.Children.map(children, (child) => {
                // Only register child Properties that are of a type known to this Form
                if (coreIncludes(trackedPropertyTypes, child.type)) {
                    const {
                        props: {
                            disabled: childDisabled,
                            name,
                            onChange,
                            overrideFormDefaults
                        }
                    } = child;

                    return React.cloneElement(child, {
                        key: name,
                        ref: (ref) => {
                            this._refs[name] = ref;

                            // By attaching refs to the child from this component, we're overwriting
                            // any already attached refs to the child from parent components. Since
                            // we'd still like parents to be able to attach refs to nested `Form` or
                            // `Property`s, we need to invoke their callback refs with our refs
                            // here.
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

        render() {
            const {
                autoComplete,
                className,
                fakeAutoCompleteInputs,
                style
            } = this.props;

            return (
                <form
                    autoComplete={autoComplete}
                    className={className}
                    onSubmit={this.onSubmit}
                    role="form"
                    style={style}>
                    {autoComplete === 'off' ? fakeAutoCompleteInputs : null}
                    {this.renderChildren()}
                    {this.renderButtons()}
                </form>
            );
        }
    });

    return Form;
}

export default createFormForPropertyTypes();
export { createFormForPropertyTypes };
