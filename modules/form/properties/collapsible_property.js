import React from 'react';
import CssModules from 'react-css-modules';

import Property from './property';
import PropertyExtender from '../utils/property_extender';

import { safeInvoke } from '../../utils/general';
import { PropStuffer } from '../../utils/react';

import styles from './collapsible_property.scss';


const { bool, element, func, string } = React.PropTypes;

// Default layouts
const CollapsibleHeader = CssModules(({ handleExpandToggle, label }) => (
    <div onClick={handleExpandToggle} styleName="header">{label}</div>
), styles);

const CollapsibleLayout = CssModules(({
    children,
    className,
    expanded,
    handleExpandToggle,
    handleFocus,
    headerLabel,
    status,
    headerType: HeaderType,
    propertyLayoutType: PropertyLayoutType
}) => (
    <div
        className={className}
        styleName={status ? `collapsible-property-${status}` : 'collapsible-property'}>
        <HeaderType
            expanded={expanded}
            handleExpandToggle={handleExpandToggle}
            label={headerLabel} />
        <PropertyLayoutType onClick={handleFocus} expanded={expanded}>
            {children}
        </PropertyLayoutType>
    </div>
), styles);

const CollapsiblePanel = CssModules(({ children, expanded, ...props }) => (
    <div {...props} className={expanded ? '' : 'hide'} styleName="collapsible-body">
        {children}
    </div>
), styles);

CollapsibleHeader.displayName = 'CollapsibleHeader';
CollapsibleLayout.displayName = 'CollapsibleLayout';
CollapsiblePanel.displayName = 'CollapsiblePanel';

// Use PropertyExtender to shim into this component the public Property API that Form depends on.
const CollapsibleProperty = PropertyExtender(React.createClass({
    propTypes: {
        children: element.isRequired,
        name: string.isRequired,

        disabled: bool,
        expanded: bool,
        headerLabel: string,

        // Header type that will always be shown and is used to expand / collapse the Property
        headerType: func,

        layoutType: func,

        /**
         * Called when the expanded state of this component is changed internally (ie. through
         * user interaction) rather than by the outside props.
         *
         * @param {bool} expanding If the property will be expanded or not
         */
        onExpandToggle: func,

        // Any props used by the base Property are also passed down
    },

    getDefaultProps() {
        return {
            expanded: true,
            headerType: CollapsibleHeader,
            layoutType: CollapsiblePanel
        };
    },

    getInitialState() {
        return {
            // Mirror the `expanded` prop to set the initial state of `expanded`.
            // This is not an antipattern as it's not a "source-of-truth" duplication
            // (we hereafter always use the `expanded` state rather than the props)
            expanded: this.props.expanded
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.expanded !== this.state.expanded) {
            this.setState({
                expanded: nextProps.expanded
            });
        }
    },

    handleExpandToggle() {
        const { disabled, onExpandToggle } = this.props;

        // If this property's disabled, ignore attempts to collapse or expand it as well
        if (!disabled) {
            const expanding = !this.state.expanded;

            safeInvoke(onExpandToggle, expanding);
            this.setState({ expanded: expanding }, () => {
                // If the Property's now expanded, try to focus on it
                if (expanding && this.refs.property) {
                    this.refs.property.handleFocus();
                }
            });
        }
    },

    renderChildren() {
        // Ensure that only one child is used per property; if there is more than one child,
        // React.Children.only() will throw
        const child = React.Children.only(this.props.children);

        // Don't show the children unless the property's expanded
        return this.state.expanded ? child : React.cloneElement(child, { className: 'hide' });
    },

    render() {
        const {
            headerLabel,
            headerType,
            layoutType: propertyLayoutType,
            expanded: _, // ignore
            onExpandToggle: __, // ignore
            ...propertyProps
        } = this.props;
        const { expanded } = this.state;

        const layoutType = PropStuffer(CollapsibleLayout, {
            expanded,
            headerLabel,
            headerType,
            propertyLayoutType,
            handleExpandToggle: this.handleExpandToggle
        }, `${expanded ? 'Expanded' : 'Collapsed'}PropertyLayout`);

        return (
            <Property
                ref="property"
                {...propertyProps}
                layoutType={layoutType}>
                {this.renderChildren()}
            </Property>
        );
    }
}));

export default CssModules(CollapsibleProperty, styles);