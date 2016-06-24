import React from 'react';

import { fakeAutoCompleteFieldShape } from '../../prop_types';

const { arrayOf } = React.PropTypes;

const propTypes = {
    fields: arrayOf(fakeAutoCompleteFieldShape)
};

/**
 * Fake auto complete inputs for tricking webkit-based browsers that ignore the `autoComplete="off"`
 * attribute (see http://stackoverflow.com/questions/15738259/disabling-chrome-autofill/15917221#15917221).
 */
const FakeAutoCompleteInputs = ({ fields }) => (
    <div style={{ display: 'none' }}>
        {fields.map(({ name, type }) => {
            const fakeName = `fake-${name}`;

            return (<input key={fakeName} name={fakeName} type={type} />);
        })}
    </div>
);

FakeAutoCompleteInputs.propTypes = propTypes;

export default FakeAutoCompleteInputs;
