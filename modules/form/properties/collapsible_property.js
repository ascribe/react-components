import React from 'react';
import classNames from 'classnames';
import CssModules from 'react-css-modules';

import Property from './property';
import propertySpecExtender from '../utils/property_spec_extender';

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
        <PropertyLayoutType expanded={expanded} onClick={handleFocus}>
            {children}
        </PropertyLayoutType>
    </div>
), styles);

const CollapsiblePanel = CssModules(({ children, expanded, ...props }) => (
    <div {...props} className={classNames({ 'hide': !expanded })} styleName="collapsible-body">
        {children}
    </div>
), styles);

CollapsibleHeader.displayName = 'CollapsibleHeader';
CollapsibleLayout.displayName = 'CollapsibleLayout';
CollapsiblePanel.displayName = 'CollapsiblePanel';

// Use propertySpecExtender to shim Property's public API (that Form depends on) into this component.
const CollapsibleProperty = React.createClass(propertySpecExtender({
    displayName: 'CollapsibleProperty',

    propTypes: {
        children: element.isRequired,
        name: string.isRequired,

        disabled: bool,
        expanded: bool,

        // Header type and label that will always be shown and is used to expand / collapse the Property
        headerLabel: string,
        headerType: func,

        layoutType: func,

        /**
         * Called when the expanded state of this component is changed.
         *
         * @param {bool} expanding If the property will be expanded or not
         */
        onExpandToggle: func,

        removeValueWhenCollapsed: bool,

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
            expanded: this.props.expanded,

            initialExpanded: this.props.expanded
        };
    },

    componentWillMount() {
        this.registerLayouts();
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.expanded !== this.props.expanded &&
            nextProps.expanded !== this.state.expanded) {
            this.setState({
                expanded: nextProps.expanded,
                initialExpanded: nextProps.expanded
            }, () => { safeInvoke(nextProps.onExpandToggle, nextProps.expanded); });
        }

        // If any of the layouts have changed, recreate our collapsed / expanded layout types
        if (nextProps.headerLabel !== this.props.headerLabel ||
            nextProps.headerType !== this.props.headerType ||
            nextProps.layoutType !== this.props.layoutType) {
            this.registerLayouts(nextProps);
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
                if (expanding) {
                    this.refs.property.focus();
                }
            });
        }
    },

    onSubmitSuccess() {
        this.setState({
            initialExpanded: this.state.expanded
        });

        this.refs.property.onSubmitSuccess();
    },

    reset() {
        const { expanded, initialExpanded } = this.state;

        if (expanded !== initialExpanded) {
            this.setState({
                expanded: initialExpanded
            });
        }

        this.refs.property.reset();
    },

    // Create a cached collapsed and expanded layout type that composes the types we've been given.
    // We can't do this on the fly on each render as focus on a child element gets lost whenever
    // an old / new type is unmounted / mounted in the render.
    registerLayouts(props = this.props) {
        const { headerLabel, headerType, layoutType: propertyLayoutType } = props;
        const additionalProps = {
            headerLabel,
            headerType,
            propertyLayoutType,
            handleExpandToggle: this.handleExpandToggle
        };

        // Cache these layouts on the component to avoid recreating a new type on each render
        // as it removes focus from any child input elements.
        this.collapsedLayout = PropStuffer(CollapsibleLayout,
                                           additionalProps,
                                           'CollapsedPropertyLayout');

        this.expandedLayout = PropStuffer(CollapsibleLayout, {
            ...additionalProps,
            expanded: true,
        }, 'ExpandedPropertyLayout');
    },

    renderChildren() {
        const { children, removeValueWhenCollapsed } = this.props;

        // Ensure that only one child is used per property; if there is more than one child,
        // React.Children.only() will throw
        const child = React.Children.only(children);

        // Don't show the children unless the property's expanded
        return this.state.expanded ? child : React.cloneElement(child, {
            className: 'hide',
            removeValue: removeValueWhenCollapsed
        });
    },

    render() {
        const {
            children: ignoredChildren, // ignore
            expanded: ignoredExpanded, // ignore
            headerLabel: ignoredHeaderLabel, // ignore
            headerType: ignoredHeaderType, // ignore
            layoutType: ignoredLayoutType, // ignore
            onExpandToggle: ignoredOnExpandToggle, // ignore
            removeValueWhenCollapsed: ignoredRemoveValueWhenCollapsed, // ignore
            ...propertyProps
        } = this.props;
        const { expanded } = this.state;

        return (
            <Property
                ref="property"
                {...propertyProps}
                layoutType={expanded ? this.expandedLayout : this.collapsedLayout}>
                {this.renderChildren()}
            </Property>
        );
    }
}));

export default CollapsibleProperty;
