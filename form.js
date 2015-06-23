'use strict';

import React from 'react';
import ReactAddons from 'react/addons';

import Button from 'react-bootstrap/lib/Button';

import requests from '../../utils/requests';
import AlertDismissable from './alert';

let Form = React.createClass({
    propTypes: {
        url: React.PropTypes.string,
        handleSuccess: React.PropTypes.func,
        getFormData: React.PropTypes.func,
        children: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.array
        ])
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
    },
    submit(event){
        if (event) {
            event.preventDefault();
        }
        this.setState({submitted: true});
        this.clearErrors();
        let action = (this.httpVerb && this.httpVerb()) || 'post';
        this[action]();
    },
    post(){
        requests
            .post(this.props.url, { body: this.getFormData() })
            .then(this.handleSuccess)
            .catch(this.handleError);
    },

    getFormData(){
        if ('getFormData' in this.props){
            return this.props.getFormData();
        }
        let data = {};
        for (let ref in this.refs){
            data[this.refs[ref].props.name] = this.refs[ref].state.value;
        }
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
            this.setState({errors: ['Something went wrong, please try again later']});
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
                        <Button className="ascribe-btn" type="submit">Save</Button>
                        <Button className="ascribe-btn" onClick={this.reset}>Cancel</Button>
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
            return ReactAddons.addons.cloneWithProps(child, {
                handleChange: this.handleChangeChild,
                ref: child.props.name
            });
        });
    },
    render() {

        return (
            <form role="form" className="ascribe-form" onSubmit={this.submit} autoComplete="on">
                {this.getErrors()}
                {this.renderChildren()}
                {this.getButtons()}
            </form>

        );
    }
});


export default Form;