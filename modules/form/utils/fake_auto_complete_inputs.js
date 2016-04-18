import React from 'react';


const { arrayOf, shape, string } = React.PropTypes;

const propTypes = {
    fields: arrayOf(shape({
        name: string,
        type: string
    }))
};

/**
 * Fake auto complete inputs for tricking webkit-based browsers that ignore the `autoComplete="off"`
 * attribute (see http://stackoverflow.com/questions/15738259/disabling-chrome-autofill/15917221#15917221).
 */
const FakeAutoCompleteInputs = ({ fields }) => (
    <div style={{display: 'none'}}>
        {fields.map(({ name, type }) => {
            const fakeName = `fake-${name}`;

            return (<input key={fakeName} name={fakeName} type={type} />);
        })}
    </div>
);

FakeAutoCompleteInputs.propTypes = propTypes;

export default FakeAutoCompleteInputs;
