/**
 * Validate a value using typeof==, {@link validateArray}, {@link validateObject}.
 * If a type is a callback, the value will be validated with the callback.
 * If a type is a regex, the value will be validated as a string that contains a match of the regex.
 * @param obj
 * @param type
 */
export function validate(obj, type) {
    if (typeof type == "function")
        return type(obj);
    else if (type instanceof RegExp)
        return typeof obj == "string" && type.test(obj);
    else if (typeof type == "string")
        return typeof obj == type;
    else if (Array.isArray(type))
        return validateArray(obj, type);
    else if (typeof type == "object")
        return validateObject(obj, type);
    else
        return false;
}
/**
 * Validate an array using Array.isArray, and validating each member with {@link validate}
 */
export function validateArray(value, type) {
    if (!Array.isArray(value))
        return false;
    if (value.length != type.length)
        return false;
    for (let i = 0; i < value.length; i++) {
        if (!validate(value[i], type[i]))
            return false;
    }
    return true;
}
/**
 * Validate an object using Object.keys, and validating each member with {@link validate}
 */
export function validateObject(value, type) {
    if (typeof value != "object")
        return false;
    if (Object.keys(value).length != Object.keys(type).length)
        return false;
    for (let key in type) {
        if (!validate(value[key], type[key]))
            return false;
    }
    return true;
}
export const Test = {
    /** A positive number or 0*/
    POSITIVE: value => typeof value == "number" && value >= 0,
    /** A negative number or 0*/
    NEGATIVE: value => typeof value == "number" && value <= 0,
    /** Test if this is an array of any size with all value matching the validator */
    EVERY(validator) { return value => Array.isArray(value) && value.every(it => validate(it, validator)); },
    /** Test if this is an object with all entries matching the validator */
    EVERY_ENTRIES(key, validator) {
        return value => {
            return typeof value == "object" && Object.entries(value).every(([k, v]) => validate(k, key) && validate(v, validator));
        };
    },
    ANY: value => true,
    /** Test if the value is undefined or matching the validator */
    OPTIONAL(validator) { return value => value === undefined || validate(value, validator); }
};
