import React from 'react';
import update from 'react-addons-update';
import CssModules from 'react-css-modules';

import Button from '../buttons/button';
import ButtonList from '../buttons/button_list';

import { safeInvoke } from '../utils/general';

import styles from './form.scss';


const { arrayOf, bool, func, node, shape, string } = React.PropTypes;

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

const Form = React.createClass({
    propTypes: {
        children: node.isRequired,

        autoComplete: bool,
        buttonDefault: node,
        buttonEdited: node,
        buttonSubmitting: node,
        className: string,
        disabled: bool, // Can be used to freeze the whole form
        fakeAutoCompleteFields: arrayOf(shape({
            name: string,
            type: string
        })),
        header: string,
        headerType: func,
        onError: func,
        onSubmit: func
    },

    getDefaultProps() {
        return {
            buttonEdited: (<EditedButtonList />),
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
            formData: {},
            submitting: false
        };
    },

    componentWillMount() {
        // Set up internal storage for callback refs
        this._refs = {};
    },

    reset() {
        // Reset child Properties too
        const initialFormData = Object.entries(this._refs).reduce((formData, [name, propertyRef]) => {
            formData[name] = propertyRef.reset();
        }, {});

        this.setState({
            edited: false,
            formData: initialFormData,
            submitting: false
        });
    },

    onSubmit(event) {
        const { onError, onSubmit } = this.props;

        event.preventDefault();

        const errors = this.validate();
        if (Object.keys(errors).length) {
            safeInvoke(onError, errors);
        } else {
            const { invoked, result } = safeInvoke(onSubmit, this.getFormData());

            if (invoked) {
                result.then(this.handleSubmitComplete((propertyRef) => propertyRef.handleSubmitSuccess()))
                      .catch(this.handleSubmitComplete((propertyRef) => propertyRef.handleSubmitFailure()));
            }

            this.setState({ submitting: true });
        }
    },

    getFormData() {
        return this.state.formData;
    },

    onPropertyChange(name) {
        return (value) => {
            const formData = update(this.state.formData, {
                [name]: { $set: value }
            });

            this.setState(this.state.edited ? { formData }
                                            : { formData, edited: true });
        }
    },

    handleSubmitComplete(propertyFn) {
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
        const { children, disabled } = this.props;
        // Reset and reregister our tracked Properties to ensure we're not tracking any Properties
        // that were removed
        this._refs = {};

        return React.Children.map(children, (child) => {
            // Only register child Properties with this form
            if (child && child.type === Property) {
                const { props: { disabled: childDisabled, name, overrideForm } } = child;

                return React.cloneElement(child, {
                    key: name,
                    ref: (ref) => {
                        this._refs[name] = ref;

                        // By attaching refs to the child from this component, we're overwriting any
                        // already attached refs to the child from parent components. Since we'd still
                        // like parents to be able to attach refs to nested `Form` or `Property`s,
                        // we need to invoke their callback refs with our refs here.
                        safeInvoke(child.ref, ref);
                    },
                    // Allow the child to override the default disabled status of the form
                    disabled: overrideForm ? childDisabled: disabled,
                    onChange: this.onPropertyChange(name)
                });
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

        const fakeAutoCompleteInputs = !autoComplete ? (
            <FakeAutoCompleteInputs fields={fakeAutoCompleteFields} />
        ) : null;

        const headerElement = header ? (<HeaderType header={header} />) : null;

        return (
            <form
                autoComplete={autoComplete ? 'on' : 'off'}
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

export default CssModules(Form, styles);
