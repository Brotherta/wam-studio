export type PrimitiveType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
export type Validator = PrimitiveType | RegExp | Function | ArrayValidator | ObjectValidator;
export interface ArrayValidator extends Array<Validator> {
}
export interface ObjectValidator extends Record<string, Validator> {
}
/**
 * Validate a value using typeof==, {@link validateArray}, {@link validateObject}.
 * If a type is a callback, the value will be validated with the callback.
 * If a type is a regex, the value will be validated as a string that contains a match of the regex.
 * @param obj
 * @param type
 */
export declare function validate(obj: any, type: Validator): any;
/**
 * Validate an array using Array.isArray, and validating each member with {@link validate}
 */
export declare function validateArray(value: any, type: ArrayValidator): value is any[];
/**
 * Validate an object using Object.keys, and validating each member with {@link validate}
 */
export declare function validateObject(value: any, type: ObjectValidator): value is Record<string, any>;
export declare const Test: {
    /** A positive number or 0*/
    POSITIVE: (value: any) => boolean;
    /** A negative number or 0*/
    NEGATIVE: (value: any) => boolean;
    /** Test if this is an array of any size with all value matching the validator */
    EVERY(validator: Validator): (value: any) => boolean;
    /** Test if this is an object with all entries matching the validator */
    EVERY_ENTRIES(key: Validator, validator: Validator): (value: any) => boolean;
    ANY: (value: any) => boolean;
    /** Test if the value is undefined or matching the validator */
    OPTIONAL(validator: Validator): (value: any) => any;
};
