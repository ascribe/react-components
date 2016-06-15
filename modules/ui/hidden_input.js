import React from 'react';


const { number } = React.PropTypes;

// Although simple, this component needs to be created with createClass rather than a stateless
// function so parents can attach refs to it.
const HiddenInput = React.createClass({
    propTypes: {
        tabIndex: number
    },

    getDefaultProps() {
        return {
            // By default ignore this input from tabbing
            tabIndex: -1
        };
    },

    render() {
        // Inputs cannot be focused when they are hidden with display: none and visibility: hidden,
        // so we have to use opacity and positioning instead. Opera also doesn't trigger simulated
        // click events if the targeted input has `display:none` set.
        // See http://stackoverflow.com/questions/12880604/jquery-triggerclick-not-working-on-opera-if-the-element-is-not-displayed
        return (
            <input
                ref={(ref) => {
                    // Unfortunately, React doesn't have a great way for us to expose the backing
                    // input element's public methods (ie. things like `.focus()` and `.blur()`)
                    // to parents of this component.
                    //
                    // The recommended strategy to accomodate parent components who need to access
                    // these methods is to pass through our input element ref. The refs to
                    // HiddenInput can look something like:
                    // <HiddenElement
                    //     ref={(ref) => { this.inputElement = ref && ref.inputElement }}
                    //     ... />
                    //
                    // Where parent components can then directly access the input element's methods
                    // by using `this.inputElement`.
                    this.inputElement = ref;
                }}
                {...this.props}
                style={{
                    height: 0,
                    left: -100,
                    opacity: 0,
                    position: 'absolute',
                    top: -100,
                    width: 0
                }} />
        );
    }
});

export default HiddenInput;
