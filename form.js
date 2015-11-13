'use strict';

import React from 'react';
import ReactAddons from 'react/addons';

import Button from 'react-bootstrap/lib/Button';
import AlertDismissable from './alert';

import GlobalNotificationModel from '../../models/global_notification_model';
import GlobalNotificationActions from '../../actions/global_notification_actions';

import requests from '../../utils/requests';

import { getLangText } from '../../utils/lang_utils';
import { mergeOptionsWithDuplicates, sanitize } from '../../utils/general_utils';


let Form = React.createClass({
    propTypes: {
        url: React.PropTypes.string,
        method: React.PropTypes.string,
        buttonSubmitText: React.PropTypes.string,
        handleSuccess: React.PropTypes.func,
        getFormData: React.PropTypes.func,
        children: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.array
        ]),
        className: React.PropTypes.string,
        spinner: React.PropTypes.element,
        buttons: React.PropTypes.oneOfType([
            React.PropTypes.element,
            React.PropTypes.arrayOf(React.PropTypes.element)
        ]),

        // Can be used to freeze the whole form
        disabled: React.PropTypes.bool,

        // You can use the form for inline requests, like the submit click on a button.
        // For the form to then not display the error on top, you need to enable this option.
        // It will make use of the GlobalNotification
        isInline: React.PropTypes.bool,

        autoComplete: React.PropTypes.string,

        onReset: React.PropTypes.func
    },

    getDefaultProps() {
        return {
            method: 'post',
            buttonSubmitText: 'SAVE',
            autoComplete: 'off'
        };
    },

    getInitialState() {
        return {
            edited: false,
            submitted: false,
            errors: []
        };
    },

    reset() {
        // If onReset prop is defined from outside,
        // notify component that a form reset is happening.
        if(typeof this.props.onReset === 'function') {
            this.props.onReset();
        }

        for(let ref in this.refs) {
            if(typeof this.refs[ref].reset === 'function') {
                this.refs[ref].reset();
            }
        }
        this.setState(this.getInitialState());
    },

    submit(event){
        if(event) {
            event.preventDefault();
        }

        this.setState({submitted: true});
        this.clearErrors();

        // selecting http method based on props
        if(this[this.props.method] && typeof this[this.props.method] === 'function') {
            window.setTimeout(() => this[this.props.method](), 100);
        } else {
            throw new Error('This HTTP method is not supported by form.js (' + this.props.method + ')');
        }
    },

    post() {
        requests
            .post(this.props.url, { body: this.getFormData() })
            .then(this.handleSuccess)
            .catch(this.handleError);
    },

    put() {
        requests
            .put(this.props.url, { body: this.getFormData() })
            .then(this.handleSuccess)
            .catch(this.handleError);
    },

    patch() {
        requests
            .patch(this.props.url, { body: this.getFormData() })
            .then(this.handleSuccess)
            .catch(this.handleError);
    },

    delete() {
        requests
            .delete(this.props.url, this.getFormData())
            .then(this.handleSuccess)
            .catch(this.handleError);
    },

    getFormData() {
        let data = {};

        for(let ref in this.refs) {
            data[this.refs[ref].props.name] = this.refs[ref].state.value;
        }

        if(typeof this.props.getFormData === 'function') {
            data = mergeOptionsWithDuplicates(data, this.props.getFormData());
        }

        return data;
    },

    handleChangeChild(){
        this.setState({ edited: true });
    },

    handleSuccess(response){
        if(typeof this.props.handleSuccess === 'function') {
            this.props.handleSuccess(response);
        }

        for(let ref in this.refs) {
            if(this.refs[ref] && typeof this.refs[ref].handleSuccess === 'function'){
                this.refs[ref].handleSuccess();
            }
        }
        this.setState({
            edited: false,
            submitted: false
        });
    },

    handleError(err) {
        if (err.json) {
            for (let input in err.json.errors){
                if (this.refs && this.refs[input] && this.refs[input].state) {
                    this.refs[input].setErrors(err.json.errors[input]);
                } else {
                    this.setState({errors: this.state.errors.concat(err.json.errors[input])});
                }
            }
        } else {
            let formData = this.getFormData();

            // sentry shouldn't post the user's password
            if(formData.password) {
                delete formData.password;
            }

            console.logGlobal(err, false, formData);

            if(this.props.isInline) {
                let notification = new GlobalNotificationModel(getLangText('Something went wrong, please try again later'), 'danger');
                GlobalNotificationActions.appendGlobalNotification(notification);
            } else {
                this.setState({errors: [getLangText('Something went wrong, please try again later')]});
            }

        }
        this.setState({submitted: false});
    },

    clearErrors() {
        for(let ref in this.refs){
            if (this.refs[ref] && typeof this.refs[ref].clearErrors === 'function'){
                this.refs[ref].clearErrors();
            }
        }
        this.setState({errors: []});
    },

    getButtons() {
        if (this.state.submitted){
            return this.props.spinner;
        }
        if (this.props.buttons){
            return this.props.buttons;
        }
        let buttons = null;

        if (this.state.edited && !this.props.disabled){
            buttons = (
                <div className="row" style={{margin: 0}}>
                    <p className="pull-right">
                        <Button
                            className="btn btn-default btn-sm ascribe-margin-1px"
                            type="submit">
                            {this.props.buttonSubmitText}
                        </Button>
                        <Button
                            className="btn btn-danger btn-delete btn-sm ascribe-margin-1px"
                            type="reset">
                            CANCEL
                        </Button>
                    </p>
                </div>
            );

        }
        return buttons;
    },

    getErrors() {
        let errors = null;
        if (this.state.errors.length > 0){
            errors = this.state.errors.map((error) => {
                return <AlertDismissable error={error} key={error}/>;
            });
        }
        return errors;
    },

    renderChildren() {
        return ReactAddons.Children.map(this.props.children, (child, i) => {
            if (child) {
                return ReactAddons.addons.cloneWithProps(child, {
                    handleChange: this.handleChangeChild,
                    ref: child.props.name,
                    key: i,
                    // We need this in order to make editable be overridable when setting it directly
                    // on Property
                    editable: child.props.overrideForm ? child.props.editable : !this.props.disabled
                });
            }
        });
    },

    /**
     * All webkit-based browsers are ignoring the attribute autoComplete="off",
     * as stated here: http://stackoverflow.com/questions/15738259/disabling-chrome-autofill/15917221#15917221
     * So what we actually have to do is depended on whether or not this.props.autoComplete is set to "on" or "off"
     * insert two fake hidden inputs that mock password and username so that chrome/safari is filling those
     */
    getFakeAutocompletableInputs() {
        if(this.props.autoComplete === 'off') {
            return (
                <span>
                    <input style={{display: 'none'}} type="text" name="fakeusernameremembered"/>
                    <input style={{display: 'none'}} type="password" name="fakepasswordremembered"/>
                </span>
            );
        } else {
            return null;
        }
    },

    /**
     * Validates a single ref and returns a human-readable error message
     * @param  {object} refToValidate A customly constructed object to check
     * @return {oneOfType([arrayOf(string), bool])} Either an error message or false, saying that
     * everything is valid
     */
    _hasRefErrors(refToValidate) {
        let errors = Object
            .keys(refToValidate)
            .reduce((a, constraintKey) => {
                const contraintValue = refToValidate[constraintKey];

                if(!contraintValue) {
                    switch(constraintKey) {
                        case 'min' || 'max':
                            a.push(getLangText('The field you defined is not in the valid range'));
                            break;
                        case 'pattern':
                            a.push(getLangText('The value you defined is not matching the valid pattern'));
                            break;
                        case 'required':
                            a.push(getLangText('This field is required'));
                            break;
                    }
                }

                return a;
            }, []);

        return errors.length ? errors : false;
    },

    /**
     * This method validates all child inputs of the form.
     *
     * As of now, it only considers
     * - `max`
     * - `min`
     * - `pattern`
     * - `required`
     *
     * The idea is to enhance this method everytime we need more thorough validation.
     * So feel free to add props that additionally should be checked, if they're present
     * in the input's props.
     *
     * @return {[type]} [description]
     */
    validate() {
        this.clearErrors();
        const validatedFormInputs = {};

        Object
            .keys(this.refs)
            .forEach((refName) => {
                let refToValidate = {};
                const property = this.refs[refName];
                const input = property.refs.input;
                const value = input.getDOMNode().value || input.state.value;
                const { max,
                        min,
                        pattern,
                        required,
                        type } = input.props;

                refToValidate.required = required ? value : true;
                refToValidate.pattern = pattern && typeof value === 'string' ? value.match(pattern) : true;
                refToValidate.max = type === 'number' ? parseInt(value, 10) <= max : true;
                refToValidate.min = type === 'number' ? parseInt(value, 10) >= min : true;

                const validatedRef = this._hasRefErrors(refToValidate);
                validatedFormInputs[refName] = validatedRef;
            });
        const errorMessagesForRefs = sanitize(validatedFormInputs, (val) => !val);
        this.handleError({ json: { errors: errorMessagesForRefs } });
        return !Object.keys(errorMessagesForRefs).length;
    },

    render() {
        let className = 'ascribe-form';

        if(this.props.className) {
            className += ' ' + this.props.className;
        }

        return (
            <form
                role="form"
                className={className}
                onSubmit={this.submit}
                onReset={this.reset}
                autoComplete={this.props.autoComplete}>
                {this.getFakeAutocompletableInputs()}
                {this.getErrors()}
                {this.renderChildren()}
                {this.getButtons()}
            </form>
        );
    }
});

export default Form;
