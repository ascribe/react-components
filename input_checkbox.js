'use strict';

import React from 'react';

import { getLangText } from '../../utils/lang_utils';

let InputCheckbox = React.createClass({
    propTypes: {
        required: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired
    },

    getInitialState() {
        return {
            show: false
        };
    },

    handleFocus() {
        this.refs.checkbox.getDOMNode().checked = !this.refs.checkbox.getDOMNode().checked;
        this.setState({
            show: this.refs.checkbox.getDOMNode().checked
        });
    },

    render() {
        return (
            <span
                onClick={this.handleFocus}
                onFocus={this.handleFocus}>
                <input type="checkbox" ref="checkbox"/>
                <span className="checkbox">
                    <span>
                        {getLangText('I agree to the Terms of Service') + ' '}
                        (<a href="/terms" target="_blank" style={{fontSize: '0.9em', color: 'rgba(0,0,0,0.7)'}}>
                            {getLangText('read')}
                        </a>)
                    </span>
                </span>
            </span>
        );
    }
});

export default InputCheckbox;