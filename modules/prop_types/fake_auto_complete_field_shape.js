import React from 'react';


const { shape, string } = React.PropTypes;

const fakeAutoCompleteFieldSpec = {
    name: string,
    type: string
};

export default shape(fakeAutoCompleteFieldSpec);
export {
    fakeAutoCompleteFieldSpec
};
