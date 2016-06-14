import React from 'react';
import CssModules from 'react-css-modules';

import styles from './button.scss';


const { bool, node, oneOf, string } = React.PropTypes;

const Button = React.createClass({
    propTypes: {
        children: node,
        className: string,
        classType: string,

        /**
         * If `href` is supplied as a prop, the button will be rendered as an anchor instead of the
         * default button
         */
        href: string,

        size: oneOf(['xs', 'sm', 'md', 'lg']),
        wide: bool
    },

    getDefaultProps() {
        return {
            classType: 'primary',
            size: 'md'
        };
    },

    render() {
        const { children, classType, size, wide, ...buttonProps } = this.props;

        let ComponentType = 'button';
        if (this.props.hasOwnProperty('href')) {
            ComponentType = 'a';

            // Also add role to the anchor to signify that it's being used as a button
            buttonProps.role = 'button';
        }

        let styleName = classType;
        if (size && size !== 'md') {
            styleName += `-${size}`;
        }
        if (wide) {
            styleName += '-wide';
        }

        return (
            <ComponentType
                {...buttonProps}
                styleName={styleName}>
                {children}
            </ComponentType>
        );
    }
});

export default CssModules(Button, styles);
