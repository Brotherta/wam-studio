/**
 * Create a document fragment from a template string.
 * Support for nodes and iterable values.
 * Other values are stringified, and their special characters are escaped.
 * @param strings
 * @param values
 * @returns
 */
export declare function doc(strings: TemplateStringsArray, ...values: any[]): DocumentFragment;
export declare function adoc(strings: TemplateStringsArray, ...values: any[]): Element;
