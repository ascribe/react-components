import React from 'react';
import CssModules from 'react-css-modules';

import styles from './button_container.scss';


const { node, string } = React.PropTypes;

const propTypes = {
    children: node.isRequired,

    className: string,
    label: node
};

const ButtonContainerLabel = CssModules(({ content }) => {
    return content ? (<span styleName="label">{content}</span>) : null;
}, styles);

ButtonContainerLabel.displayName = 'ButtonContainerLabel';


const ButtonContainer = ({ children, className, label }) => (
    <div
        className={className}
        styleName={label ? 'container-has-label' : 'container'}>
        {children}
        <ButtonContainerLabel content={label} />
    </div>
);

ButtonContainer.propTypes = propTypes;

export default CssModules(ButtonContainer, styles);
