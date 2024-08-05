
export type PrimitiveType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"

export type Validator = PrimitiveType | RegExp | Function | ArrayValidator | ObjectValidator

export interface ArrayValidator extends Array<Validator>{}

export interface ObjectValidator extends Record<string, Validator>{}

/**
 * Validate a value using typeof==, {@link validateArray}, {@link validateObject}.
 * If a type is a callback, the value will be validated with the callback.
 * If a type is a regex, the value will be validated as a string that contains a match of the regex.
 * @param obj 
 * @param type 
 */
export function validate(obj: any, type: Validator){
    if(typeof type=="function") return type(obj)
    else if(type instanceof RegExp) return typeof obj=="string" && type.test(obj)
    else if(typeof type=="string") return typeof obj==type
    else if(Array.isArray(type)) return validateArray(obj, type)
    else if(typeof type=="object") return validateObject(obj, type)
    else return false
}

/**
 * Validate an array using Array.isArray, and validating each member with {@link validate}
 */
export function validateArray(value: any, type: ArrayValidator): value is any[]{
    if(!Array.isArray(value))return false
    if(value.length!=type.length)return false
    for(let i=0; i<value.length; i++){
        if(!validate(value[i], type[i]))return false
    }
    return true
}

/**
 * Validate an object using Object.keys, and validating each member with {@link validate}
 */
export function validateObject(value: any, type: ObjectValidator): value is Record<string, any>{
    if(typeof value!="object")return false
    if(Object.keys(value).length!=Object.keys(type).length)return false
    for(let key in type){
        if(!validate(value[key], type[key]))return false
    }
    return true
}

export const Test={
    /** A positive number or 0*/
    POSITIVE: value=>typeof value=="number" && value>=0,

    /** A negative number or 0*/
    NEGATIVE: value=>typeof value=="number" && value<=0,

    /** Test if this is an array of any size with all value matching the validator */
    EVERY(validator: Validator){ return value=>Array.isArray(value) && value.every(it=>validate(it,validator)) },

    /** Test if the value is undefined or matching the validator */
    OPTIONAL(validator: Validator){ return value=>value===undefined || validate(value,validator) }
}