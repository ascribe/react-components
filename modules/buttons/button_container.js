import React from 'react';
import CssModules from 'react-css-modules';

import { childrenType } from '../utils/prop_types';

import styles from './button_container.scss';


const { string } = React.PropTypes;

const ButtonContainer = React.createClass({
    propTypes: {
        children: childrenType.isRequired,

        className: string,
        label: node
    },

    render() {
        const { children, className, label } = this.props;

        return (
            <div
                className={className}
                styleName={label ? 'container-has-label' : 'container'}>
                {children}
                <div styleName={label ? 'label' : null}>
                    {label}
                </div>
            </div>
        );
    }
});

export default CssModules(ButtonContainer, styles);
