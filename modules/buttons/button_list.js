import React from 'react';
import CssModules from 'react-css-modules';

import styles from './button_list.scss';


const { bool, node, oneOf, string } = React.PropTypes;

const propTypes = {
    children: node.isRequired,

    className: string,
    pull: oneOf(['left', 'right']),
    vertical: bool
};

const ButtonList = ({ children, className, pull, vertical }) => {
    return (
        <div styleName={vertical ? 'button-list-vertical' : 'button-list'}>
            <div className={pull ? `pull-${pull}` : null}>
                {children}
            </div>
        </div>
    );
};

ButtonList.propTypes = propTypes;

export default CssModules(ButtonList, styles);
