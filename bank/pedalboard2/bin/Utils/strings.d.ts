/**
 * Prettyfy a string.
 * Exemple: "   stereoEnhancer   plugin" -> "Stereo Enhancer Plugin"
 */
export declare function prettyfy(str: string): string;
/**
 * Standardize a string. Remove spaces, upper case...
 * If two person want to write the same word but make a mistake, the standardize function will make them write the same thing.
 */
export declare function standardize(str: string): string;
