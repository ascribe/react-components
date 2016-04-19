import React from 'react';
import update from 'react-addons-update'
import CssModules from 'react-css-modules';

import styles from './grouping.scss';


const { bool, node, number, object, oneOfType, string } = React.PropTypes;

const propTypes = {
    children: node.isRequired,

    className: string,

    // Providing a number will default to using 'px' for the margin
    margin: oneOfType([number, string]),

    style: object,

    vertical: bool
};

const defaultProps = {
    margin: 1
};

const Grouping = ({ children, className, margin, style, vertical }) => {
    const childDisplayStyle = vertical ? {
        display: 'block'
    } : null;

    const childMarginStyle = {
        [vertical ? 'marginTop' : 'marginLeft']: margin
    };

    const childStyle = {
        ...childDisplayStyle,
        ...childMarginStyle
    };

    return (
        <span className={className} style={style} styleName="grouping-container">
            {React.Children.map(children, (child, ii) => {
                // Only apply the display style to the first child to avoid setting unnecessary
                // margin at the start
                const style = ii ? childStyle : childDisplayStyle;

                return React.cloneElement(child, {
                    // If the child has styles applied to it already, let those override our base
                    // styles
                    style: {
                        ...style,
                        ...child.props.style
                    }
                });
            })}
        </span>
    );
};

Grouping.propTypes = propTypes;
Grouping.defaultProps = defaultProps;

export default CssModules(Grouping, styles);
