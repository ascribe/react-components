export default function objectOnlyArrayValue(props, propName, componentName) {
    const prop = props[propName];

    // If the prop exists but is not an object holding only array values, fail validation
    if (prop &&
        (typeof prop !== 'object' ||
         Object.values(prop).filter((errorVal) => !Array.isArray(errorVal)).length)) {
        return new Error(`Invalid prop \`${propName}\` supplied to \`${componentName}\`. ` +
                         `\`${propName}\` must be an object whose keys each hold an array`);
    } else {
        return undefined;
    }
}
