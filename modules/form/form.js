import coreIncludes from 'core-js/library/fn/array/includes';

import React from 'react';

import { safeInvoke } from 'js-utility-belt/es6';

import Property from './properties/property';
import SimpleProperty from './properties/simple_property';

import FakeAutoCompleteInputs from './utils/fake_auto_complete_inputs';

import { objectOnlyArrayValue } from '../prop_types';

import Grouping from '../ui/grouping';


const { arrayOf, bool, func, node, oneOf, shape } = React.PropTypes;

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


/**
 * Forms are set up to track only a few Property types in their children; any other extraneous
 * elements, including inputs, will be ignored by the Form (such elements may be useful for styling,
 * for example). If you define your own custom Property types, you should use
 * createFormForPropertyTypes() to create a custom Form type that can track those Properties.
 *
 * @param  {...function} propertyType Custom Property types to track on the returned Form
 * @return {Component}                Form component that can track the given Properties
 */
function createFormForPropertyTypes(...TRACKED_PROPERTY_TYPES) {
    /**
     * Easier-to-use Form component whose philosophy is based upon a form being a set of properties.
     * Having properties as an abstraction layer above raw inputs provides a standard structure for
     * styling inputs as well as a standard interface for defining new, custom inputs.
     */
    const Form = React.createClass({
        propTypes: {
            children: node.isRequired,

            // Same as <form>'s `autocomplete` property
            autoComplete: oneOf(['on', 'off']),

            /**
             * Elements to use as buttons at the bottom of the Form for different Form states:
             *   - buttonDefault:    default; when the Form is not in an edited or submitting state
             *   - buttonEdited:     when the Form has been edited from its last submission state
             *   - buttonSubmitting: when the Form is being submitted (ie. when onSubmit()'s promise
             *                       is still pending)
             *
             * If you'd like to place buttons somewhere else, or have more control, you can pass
             * `null` for these buttons and use the `onEdited`, `onSubmit`, and `onValidationError`
             * callbacks to control your buttons.
             */
            buttonDefault: node,
            buttonEdited: node,
            buttonSubmitting: node,

            /**
             * Any additional custom property types that the form should track.
             * Regardless of custom types given here, the Form will always recognize the property
             * types in TRACKED_PROPERTY_TYPES
             */
            customPropertyTypes: arrayOf(func),

            // Can be used to freeze the whole form
            disabled: bool,

            /**
             * Errors to display.
             *
             * Should be a dictionary mapping Property names to an array of errors.
             * The errors will be filtered out and passed to the Property whose name matches the key
             * (if any). A special `form` key in this dictionary will associate any of the errors
             * under it to the Form (to be rendered through `renderFormErrors`) instead of any
             * Properties.
             *
             * Each entry in this dictionary should be of the form:
             *   - [Property name]: error[]
             *   - form: error[] to associate with the Form
             */
            errors: objectOnlyArrayValue,

            /**
             * Allows you to specify fake hidden inputs that will be inserted at the start of the form
             * when the `autoComplete` prop is also set to "off". This is necessary to trick
             * Webkit-based browsers, which ignore the `autoComplete="off"` attribute
             * (see http://stackoverflow.com/questions/15738259/disabling-chrome-autofill/15917221#15917221),
             * into autocompleting these fake inputs rather than the actual inputs.
             *
             * See FakeAutoCompleteInputs for an easy way to generate these inputs.
             */
            fakeAutoCompleteInputs: shape({
                type: oneOf([FakeAutoCompleteInputs, node])
            }),

            // Same as <form>'s `novalidate` property
            noValidate: bool,

            /**
             * Called when the Form has been edited for the first time, either after being loaded or
             * after a successful submission.
             */
            onEdited: func,

            /**
             * Called on form submission, similar to <form>'s `onSubmit` callback except no request
             * is sent automatically.
             *
             * If a promise is returned, it is expected that the promise will resolve on
             * submission success or rejects on submission failure. If only a value is returned,
             * it's assumed to be a successful submission. Will call each of the tracked Property's
             * onSubmitSuccess and onSubmitError callbacks and forward any success values or
             * failure errors.
             *
             * Note: All onSubmit handling should be handled through this callback, including any
             * network requests. The event handler returns false and `preventDefault` is called on
             * the native onSubmit event so the rendered form won't make a request even if the
             * `action` and `method` props are included.
             *
             * @param  {object} formData Form data dictionary, holding entires in the form of:
             *                             [Property's name]: value
             * @return {*}               Result of form submission, either as a Promise or a normal
             *                           value
             */
            onSubmit: func,

            /**
             * Called when validation of any of the tracked Properties fails.
             *
             * @param {object} errors Errors dictionary, holding entries in the form of:
             *                          [Property's name]: failed validation property
             */
            onValidationError: func,

            /**
             * Render any Form-associated errors (ie. errors passed in through `errors.form`) that
             * will be displayed on top of any other children.
             *
             * If you'd like more control or want to place your errors somewhere else, you can
             * ignore this prop and render your components using the given `errors.form`.
             *
             * @param  {*[]}  errors Errors associated to this Form
             * @return {node}        Any React-renderable node
             */
            renderFormErrors: func,

            // All other props are passed to the rendered <form> element
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


        /** PUBLICLY EXPOSED METHODS FOR PARENTS (EVEN AFTER EXTENSION) **/
        getData() {
            return Object.entries(this._refs).reduce((formData, [name, propertyRef]) => {
                formData[name] = propertyRef.getValue();
                return formData;
            }, {});
        },

        getProperties() {
            return this._refs;
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


        /** CALLBACK HANDLERS **/
        onPropertyChange() {
            if (!this.state.edited) {
                this.setState({ edited: true }, this.props.onEdited);
            }
        },

        onSubmit(event) {
            const { noValidate, onSubmit, onValidationError } = this.props;

            let errors;
            if (!noValidate) {
                errors = this.validate();
            }

            if (errors && Object.keys(errors).length) {
                safeInvoke(onValidationError, errors);
            } else {
                this.setState({ submitting: true });

                const { invoked, result } = safeInvoke(onSubmit, this.getData());
                if (invoked) {
                    Promise.resolve(result)
                    .then((res) => {
                        Object
                            .values(this._refs)
                            .forEach((propertyRef) => propertyRef.onSubmitSuccess(res));

                        return true;
                    })
                    .catch((err) => {
                        Object
                            .values(this._refs)
                            .forEach((propertyRef) => propertyRef.onSubmitError(err));

                        // Make the following .then() clause act as a .finally() clause
                        return false;
                    })
                    .then((success) => {
                        this.setState({
                            // Once a form has been edited, it should be reset if it's been successfully
                            // submitted or reset; if submission fails, it should stay edited.
                            edited: !success,
                            submitting: false
                        });
                    });
                }
            }

            event.preventDefault();
            return false;
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
            const { children, customPropertyTypes, disabled, errors = {} } = this.props;
            const trackedPropertyTypes = customPropertyTypes.concat(TRACKED_PROPERTY_TYPES);

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
                        errors: errors[name],
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
                errors,
                fakeAutoCompleteInputs,
                renderFormErrors,
                buttonDefault: ignoredButtonDefault, // ignored
                buttonEdited: ignoredButtonEdited, // ignored
                buttonSubmitting: ignoredButtonSubmitted, // ignored
                customPropertyTypes: ignoredCustomPropertyTypes, // ignored
                onEdited: ignoredOnEdited, // ignored
                onSubmit: ignoredOnSubmit, // ignored
                onValidationError: ignoredOnValidationError, // ignored
                ...props
            } = this.props;

            let errorComponent;
            if (errors && errors.form) {
                const { invoked, result } = safeInvoke(renderFormErrors, errors.form);
                if (invoked) {
                    errorComponent = result;
                }
            }

            return (
                <form
                    {...props}
                    autoComplete={autoComplete}
                    onSubmit={this.onSubmit}
                    role="form">
                    {autoComplete === 'off' ? fakeAutoCompleteInputs : null}
                    {errorComponent}
                    {this.renderChildren()}
                    {this.renderButtons()}
                </form>
            );
        }
    });

    return Form;
}

// Property types that Form will always recognize and track
const DEFAULT_TRACKED_PROPERTY_TYPES = [Property, SimpleProperty];

// Export a default Form with the default registered Property types, but allow others to build their
// own Forms that track custom Properties.
export default createFormForPropertyTypes(DEFAULT_TRACKED_PROPERTY_TYPES);
export { createFormForPropertyTypes };
