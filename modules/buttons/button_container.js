import React from 'react';
import CssModules from 'react-css-modules';

import styles from './button_container.scss';


const { node, string } = React.PropTypes;

const ButtonContainer = React.createClass({
    propTypes: {
        children: node,

        className: string,
        label: node
    },

    render() {
        const { children, className, label } = this.props;
        const labelComponent = label ? (
            <span className={styles.label}>
                {label}
            </span>
        ) : null;

        return (
            <div
                className={labelComponent ? styles['container-has-label'] : styles['container']}>
                {children}
                {labelComponent}
            </div>
        );
    }
});

export default CssModules(ButtonContainer, styles);
