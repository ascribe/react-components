'use strict';

import React from 'react';
import ReactAddons from 'react/addons';

import Button from 'react-bootstrap/lib/Button';

import requests from '../../utils/requests';
import { getLangText } from '../../utils/lang_utils';
import { mergeOptionsWithDuplicates } from '../../utils/general_utils';
import AlertDismissable from './alert';


let Form = React.createClass({
    propTypes: {
        url: React.PropTypes.string,
        handleSuccess: React.PropTypes.func,
        getFormData: React.PropTypes.func,
        children: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.array
        ]),
        className: React.PropTypes.string
    },

    getInitialState() {
        return {
            edited: false,
            submitted: false,
            errors: []
        };
    },
    reset(){
        for (let ref in this.refs){
            if (typeof this.refs[ref].reset === 'function'){
                this.refs[ref].reset();
            }
        }
        this.setState(this.getInitialState());
    },
    submit(event){
        if (event) {
            event.preventDefault();
        }
        this.setState({submitted: true});
        this.clearErrors();
        let action = (this.httpVerb && this.httpVerb()) || 'post';
        window.setTimeout(() => this[action](), 100);
    },
    post(){
        requests
            .post(this.props.url, { body: this.getFormData() })
            .then(this.handleSuccess)
            .catch(this.handleError);
    },

    getFormData(){
        let data = {};
        for (let ref in this.refs){
            data[this.refs[ref].props.name] = this.refs[ref].state.value;
        }

        if ('getFormData' in this.props){
            data = mergeOptionsWithDuplicates(data, this.props.getFormData());
        }
        console.log(data)
        return data;
    },

    handleChangeChild(){
        this.setState({edited: true});
    },
    handleSuccess(response){
        if ('handleSuccess' in this.props){
            this.props.handleSuccess(response);
        }
        for (var ref in this.refs){
            if ('handleSuccess' in this.refs[ref]){
                this.refs[ref].handleSuccess();
            }
        }
        this.setState({edited: false, submitted: false});
    },
    handleError(err){
        if (err.json) {
            for (var input in err.json.errors){
                if (this.refs && this.refs[input] && this.refs[input].state) {
                    this.refs[input].setErrors( err.json.errors[input]);
                } else {
                    this.setState({errors: this.state.errors.concat(err.json.errors[input])});
                }
            }
        }
        else {
            console.logGlobal(err);
            this.setState({errors: [getLangText('Something went wrong, please try again later')]});
        }
        this.setState({submitted: false});
    },
    clearErrors(){
        for (var ref in this.refs){
            if ('clearErrors' in this.refs[ref]){
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

        if (this.state.edited){
            buttons = (
                <div className="row" style={{margin: 0}}>
                    <p className="pull-right">
                        <Button className="btn btn-default btn-sm ascribe-margin-1px" type="submit">SAVE</Button>
                        <Button className="btn btn-danger btn-delete btn-sm ascribe-margin-1px" onClick={this.reset}>CANCEL</Button>
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
        return ReactAddons.Children.map(this.props.children, (child) => {
            if (child) {
                return ReactAddons.addons.cloneWithProps(child, {
                    handleChange: this.handleChangeChild,
                    ref: child.props.name
                });
            }
        });
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
                autoComplete="on">
                {this.getErrors()}
                {this.renderChildren()}
                {this.getButtons()}
            </form>

        );
    }
});


export default Form;
