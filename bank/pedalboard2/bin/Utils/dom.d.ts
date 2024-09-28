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
export declare function replaceInTemplate(target: Element, replacement: Element): void;
/**
 * Type safe CSS selector class.
 * Work with the selector Tagger Template Function, so strings can be escaped correctly.
 */
export declare class Selector {
    readonly raw: string;
    /** @deprecated Use {@link selector} instead */
    constructor(raw: string);
    query(node: Element): Element | null;
    queryAll(node: Element): NodeListOf<Element>;
}
export declare function selector(strings: TemplateStringsArray, ...values: any[]): Selector;
