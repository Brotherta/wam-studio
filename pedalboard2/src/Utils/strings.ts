

/**
 * Prettyfy a string.
 * Exemple: "   stereoEnhancer   plugin" -> "Stereo Enhancer Plugin"
 */
export function prettyfy(str: string){
    // Exemple:                               stereoEnhancer  plugin

    // Add Spaces Before UpperCase            stereo Enhancer  plugin
    str = str.replace(/^([A-Z ])([A-Z]])/g, '$1 $2');

    // UpperCase First Letter                 Stereo Enhancer  Plugin
    str = str.charAt(0).toUpperCase() + str.slice(1);
    str = str.replaceAll(/\s[a-z]/g, str=>" "+str.charAt(1).toUpperCase())

    // Strip duplicate spaces                 Stereo Enhancer Plugin
    str = str.replaceAll(/\s+/g, ' ').trim();

    return str
}


/**
 * Standardize a string. Remove spaces, upper case...
 * If two person want to write the same word but make a mistake, the standardize function will make them write the same thing.
 */
export function standardize(str: string){
    // Standardize white spaces and equivalent
    str = ' '+str.replace(/[\s\-\.\,_]+/g, ' ')+' '
    str = str.replace(/([A-Z])/g, ' $1')

    // Lower case
    str = str.toLowerCase()

    // Remove trailling 'S'
    str = str.replace(/s /g, ' ')

    // Remove double characters
    str = str.replace(/(.)\1+/g, '$1')

    // Remove white spaces
    str = str.replace(/ */g, '')

    return str
}