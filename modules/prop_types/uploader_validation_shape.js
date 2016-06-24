import React from 'react';


const { arrayOf, number, shape, string } = React.PropTypes;

const uploaderValidationShapeSpec = {
    allowedExtensions: arrayOf(string),
    itemLimit: number,
    minSizeLimit: number,
    sizeLimit: number
};

export default shape(uploaderValidationShapeSpec);
export {
    uploaderValidationShapeSpec
};
