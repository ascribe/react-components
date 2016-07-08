import React from 'react';


const { shape, string } = React.PropTypes;

const fakeAutoCompleteFieldSpec = {
    name: string.isRequired,
    type: string.isRequired
};

export default shape(fakeAutoCompleteFieldSpec);
export {
    fakeAutoCompleteFieldSpec
};
