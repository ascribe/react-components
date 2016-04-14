import React from 'react';
import update from 'react-addons-update'
import CssModules from 'react-css-modules';

import styles from './grouping.scss';


const { bool, node, number, oneOfType, string } = React.PropTypes;

const propTypes = {
    children: node.isRequired,

    className: string,

    // Providing a number will default to using 'px' for the margin
    margin: oneOfType([number, string]),

    vertical: bool
};

const defaultProps = {
    margin: 1
};

const Grouping = ({ children, className, margin, vertical }) => {
    const displayStyle = vertical ? {
        display: 'block'
    } : null;

    const marginStyle = {
        [vertical ? 'marginTop' : 'marginLeft']: margin
    };

    const style = {
        ...displayStyle,
        ...marginStyle
    };

    return (
        <span className={className} styleName="grouping-container">
            {React.Children.map(children, (child, ii) => {
                // Only apply the display style to the first child to avoid setting unnecessary
                // margin at the start
                const baseStyle = ii ? style : displayStyle;

                return React.cloneElement(child, {
                    // If the child has styles applied to it already, let those override our base
                    // styles
                    style: child.props.style ? Object.assign({}, baseStyle, child.props.style)
                                             : baseStyle
                });
            })}
        </span>
    );
};

Grouping.propTypes = propTypes;
Grouping.defaultProps = defaultProps;

export default CssModules(Grouping, styles);
