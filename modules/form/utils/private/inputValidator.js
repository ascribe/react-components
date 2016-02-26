function validateRequired(val, required) {
    return !!val && required;
}

function validatePattern(val, pattern) {
    return typeof val === 'string' && !!val.match(pattern);
}

function validateVal(val, checkAgainst, type, maxOrMin) {
    // Use the standard comparison operator check as min/max are inclusive:
    //   > 0 => left bigger
    //   < 0 => right bigger
    //   = 0 => equal
    let checkResult;

    if (type === 'number') {
        checkResult = parseInt(val, 10) - checkAgainst;
    } else {
        checkResult = 1;
    }

    return maxOrMin === 'min' ? checkResult <= 0 : checkResult >= 0;
}

export default {
    max: (val, max, type) => validateVal(val, max, type, 'max'),
    min: (val, min, type) => validateVal(val, min, type, 'min'),
    pattern: validatePattern,
    required: validateRequired
}
