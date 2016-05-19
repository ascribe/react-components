function validateRequired(val, required) {
    return !required || !!val;
}

function validatePattern(val, pattern) {
    return !pattern || (typeof val === 'string' && !!val.match(pattern));
}

function validateVal(val, checkAgainst, type, maxOrMin) {
    // Use the standard comparison operator check as min/max are inclusive:
    //   > 0 => left bigger
    //   < 0 => right bigger
    //   = 0 => equal
    let checkResult;

    if (type === 'number' && checkAgainst) {
        checkResult = parseInt(val, 10) - checkAgainst;
        return maxOrMin === 'min' ? checkResult <= 0 : checkResult >= 0;
    } else {
        return true;
    }
}

export default {
    max: (val, max, type) => validateVal(val, max, type, 'max'),
    min: (val, min, type) => validateVal(val, min, type, 'min'),
    pattern: validatePattern,
    required: validateRequired
};
