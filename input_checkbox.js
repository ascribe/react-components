import React from 'react';

import AlertMixin from '../../mixins/alert_mixin'

let InputCheckbox = React.createClass({

    mixins : [AlertMixin],

    getInitialState() {
        return {value: null,
                alerts: null // needed in AlertMixin
        };
    },
    handleChange(event) {
        this.setState({value: event.target.value});
    },
    render() {
        let alerts = (this.props.submitted) ? null : this.state.alerts;
        return (
            <div className="form-group">
                {alerts}
                <div className="input-checkbox-ascribe">
                    <div className="checkbox">
                        <label>
                            <input
                                type="checkbox"
                                required={this.props.required}
                                onChange={this.handleChange}
                            />
                            {this.props.label}
                        </label>
                    </div>
                </div>
            </div>
        );

    }
});

export default InputCheckbox;