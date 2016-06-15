import React from 'react';
import CssModules from 'react-css-modules';

import CollapsibleProperty from './collapsible_property';
import propertySpecExtender from '../utils/property_spec_extender';

import Checkbox from '../../ui/checkbox';

import { safeInvoke } from '../../utils/general';
import { PropStuffer } from '../../utils/react';

import styles from './collapsible_checkbox_property.scss';


const { bool, element, func, string } = React.PropTypes;

const PropertyCheckboxHeading = CssModules(({ disabled, expanded, handleExpandToggle, label, name }) => (
    <button onClick={handleExpandToggle} styleName="checkbox-header">
        <Checkbox
            checked={expanded}
            disabled={disabled}
            label={label}
            name={`${name}-checkbox`}
            onChange={handleExpandToggle}
            tabIndex={-1} />
    </button>
), styles);

PropertyCheckboxHeading.displayName = 'PropertyCheckboxHeading';

// Use propertySpecExtender to shim Property's public API (that Form depends on) into this component.
const CollapsibleCheckboxProperty = React.createClass(propertySpecExtender({
    displayName: 'CollapsibleCheckboxProperty',

    propTypes: {
        children: element.isRequired,
        name: string.isRequired,

        checkboxLabel: string,
        checked: bool,
        disabled: bool,
        onChange: func,
        onExpandToggle: func

        // Any props used by the base Property are also passed down
    },

    componentWillMount() {
        this.registerHeaderLayout();
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.disabled !== this.props.disabled ||
            nextProps.name !== this.props.name) {
            this.registerHeaderLayout(nextProps);
        }
    },

    onExpandToggle(expanding) {
        const { onChange, onExpandToggle } = this.props;

        // Reset the property to its initial value when the checkbox is unticked (ie. when
        // `expanding` is false) since the user doesn't want to specify their own value for this
        // property.
        if (!expanding) {
            // CollapsibleProperty.reset is supplied by propertySpecExtender and delegates to the
            // base Property
            this.refs.property.reset();
        }

        safeInvoke(onExpandToggle, expanding);
        safeInvoke(onChange, `${name}-checkbox`, expanding);
    },

    // Create a cached header type that uses our given props to avoid recreating
    // CollapsibleProperty's collapsed / expanded layouts on each render
    registerHeaderLayout(props = this.props) {
        const { disabled, name } = props;

        this.headerLayout = PropStuffer(PropertyCheckboxHeading, { disabled, name });
    },

    render() {
        const {
            checkboxLabel,
            checked,
            onExpandToggle: ignoredOnExpandToggle, // ignore
            ...propertyProps
        } = this.props;

        return (
            <CollapsibleProperty
                ref="property"
                {...propertyProps}
                removeValueWhenCollapsed
                expanded={!!checked}
                headerLabel={checkboxLabel}
                headerType={this.headerLayout}
                onExpandToggle={this.onExpandToggle} />
        );
    }
}));

export default CollapsibleCheckboxProperty;
