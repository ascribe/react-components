import React from 'react';
import update from 'react-addon-update';
import CssModules from 'react-css-modules';

import Button from '../buttons/button';

import { safeInvoke } from '../utils/general';

import styles from './form.scss';


const { arrayOf, func, node, shape, string } = React.PropTypes;

/**
 * All webkit-based browsers are ignoring the attribute autoComplete="off", as stated here:
 * http://stackoverflow.com/questions/15738259/disabling-chrome-autofill/15917221#15917221,
 * so if props.autoComplete is set to "off", we insert fake hidden inputs that mock the given
 * fields to trick chrome/safari into filling those instead of the actual fields
 */
const FakeAutoCompleteInputs = ({ fields }) => fields.map(({ name, type }) => {
    const fakeName = `fake-${name}`;

    return (
        <input
            key={fakeName}
            name={fakeName}
            style={{display: 'none'}}
            type={type} />
    );
});

const Form = React.createClass({
    propTypes: {
        children: node.required,

        autoComplete: bool,
        buttons: node,
        buttonCancelText: string,
        buttonSubmitText: string,
        className: string,
        disabled: bool, // Can be used to freeze the whole form
        fakeAutoCompleteFields: arrayOf(shape({
            name: string,
            type: string
        })),
        header: string,
        onError: func,
        onSubmit: func
    },

    getDefaultProps() {
        return {
            buttonCancelText: 'CANCEL',
            buttonSubmitText: 'SAVE',
            fakeAutoCompleteFields: [{
                name: 'username',
                type: 'text'
            }, {
                name: 'password',
                type: 'password'
            }]
        };
    },

    getInitialState() {
        return {
            edited: false,
            formData: {}
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
            formData: initialFormData
        });
    },

    onSubmit(event) {
        const { onError, onSubmit } = this.props;
        const errors = this.validate();

        event.preventDefault();

        if (Object.keys(errors).length) {
            safeInvoke(onError, errors);
        } else {
            //FIXME: this could be .then(handleSuccess) if we use the object notation for safeInvoke
            safeInvoke(onSubmit, this.getFormData(), handleSuccess);
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

            const newState = { formData };
            if (!this.state.edited) {
                newState.edited = true
            }

            this.setState(newState);
        }
    },

    handleSuccess(response) {
        // Let each Property know that a form submission was successful, so they should update
        // their initial values
        Object.values(this._refs).forEach((propertyRef) => propertyRef.handleSuccess(response));
    },

    getButtons() {
        const { buttons, buttonSubmitText, buttonCancelText, disabled } = this.props;

        if (buttons !== undefined) {
            return buttons;
        }

        //FIXME: probably need a ButtonGroup component or something that will add spacing between the buttons
        if (this.state.edited && !disabled) {
            return (
                <div styleName='button-row'>
                    <div className="pull-right">
                        <Button type="submit">
                            {buttonSubmitText}
                        </Button>
                        <Button
                            classType="tertiary"
                            onClick={this.reset}
                            type="button">
                            {buttonCancelText}
                        </Button>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    },

    renderChildren() {
        const { children, disabled } = this.props;

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
        const { autoComplete, className, fakeAutoCompleteFields, header } = this.props;

        const fakeAutoCompleteInputs = autoComplete ? (
            <FakeAutoCompleteInputs fields={fakeAutoCompleteFields} />
        ) : null;

        const headerElement = header ? (<h3 styleName="header">{header}</h3>) : null;

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
