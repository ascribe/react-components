import React from 'react';
import CssModules from 'react-css-modules';

import { childrenType } from '../utils/prop_types';

import styles from './button.scss';


const { bool, oneOf, string } = React.PropTypes;

const Button = React.createClass({
    propTypes: {
        children: childrenType,
        className: string,
        classType: oneOf(['primary', 'secondary', 'tertiary']),
        size: oneOf(['xs', 'sm', 'md', 'lg']),
        wide: bool
    },

    getDefaultProps() {
        return {
            classType: 'primary',
            size: 'md'
        }
    },

    render() {
        const { children, classType, size, wide, ...buttonProps } = this.props;

        let styleName = classType;
        if (size && size !== 'md') {
            styleName += `-${size}`;
        }
        if (wide) {
            styleName += '-wide';
        }

        return (
            <button
                {...buttonProps}
                styleName={styleName}>
                {children}
            </button>
        );
    }
});

export default CssModules(Button, styles);
