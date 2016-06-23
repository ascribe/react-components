import React from 'react';
import classNames from 'classnames';
import CssModules from 'react-css-modules';

import styles from './spinner.scss';


const { bool, number, object, oneOf, oneOfType, string } = React.PropTypes;

const propTypes = {
    color: oneOf(['black', 'blue', 'dark-blue', 'light-blue', 'pink', 'white']),
    loop: bool,
    size: oneOfType([number, string]),
    style: object
};

const defaultProps = {
    color: 'dark-blue',
    size: 30
};

const Spinner = ({ color, loop, size, style, ...props }) => (
    <span styleName={classNames({ 'loop-color': loop })}>
        <div
            {...props}
            style={{ height: size, width: size, ...style }}
            styleName={loop ? 'spinner' : `spinner-${color}`} />
    </span>
);

Spinner.propTypes = propTypes;
Spinner.defaultProps = defaultProps;

export default CssModules(Spinner, styles);
