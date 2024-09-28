function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/**
 * Create a document fragment from a template string.
 * Support for nodes and iterable values.
 * Other values are stringified, and their special characters are escaped.
 * @param strings
 * @param values
 * @returns
 */
export function doc(strings, ...values) {
    let result = "";
    let nodes = [];
    // Built the inner html and fetch the nodes
    function addValue(value) {
        if (value === null || value === undefined)
            result;
        else if (value instanceof Node) {
            result += `<span id="_sam_frament_target_${nodes.length}></span>`;
            nodes.push(value);
        }
        else if (typeof value === "string") {
            result += escapeHtml(value);
        }
        else if (typeof value[Symbol.iterator] === "function") {
            for (const v of value)
                addValue(v);
        }
        else
            result += escapeHtml("" + value);
    }
    for (let i = 0; i < values.length; i++) {
        result += strings[i];
        addValue(values[i]);
    }
    result += strings[strings.length - 1];
    // Create the fragment and replace the placeholders
    const fragment = document.createRange().createContextualFragment(result);
    for (let i = 0; i < nodes.length; i++) {
        const target = fragment.getElementById(`_sam_frament_target_${i}`);
        target?.replaceWith(nodes[i]);
    }
    return fragment;
}
export function adoc(strings, ...values) {
    return doc(strings, ...values).firstElementChild;
}
export function replaceInTemplate(target, replacement) {
    replacement.className = target.className;
    replacement.id = target.id;
    target.replaceWith(replacement);
}
/**
 * Type safe CSS selector class.
 * Work with the selector Tagger Template Function, so strings can be escaped correctly.
 */
export class Selector {
    raw;
    /** @deprecated Use {@link selector} instead */
    constructor(raw) {
        this.raw = raw;
    }
    query(node) {
        return node.querySelector(this.raw);
    }
    queryAll(node) {
        return node.querySelectorAll(this.raw);
    }
}
export function selector(strings, ...values) {
    let result = "";
    // Built the inner html and fetch the nodes
    function addValue(value) {
        if (value === null || value === undefined) { }
        else if (value instanceof Selector)
            result += value.raw;
        else if (typeof value === "string")
            result += escapeHtml(value);
        else if (typeof value[Symbol.iterator] === "function") {
            for (const v of value)
                addValue(v);
        }
        else
            result += escapeHtml("" + value);
    }
    for (let i = 0; i < values.length; i++) {
        result += strings[i];
        addValue(values[i]);
    }
    result += strings[strings.length - 1];
    return new Selector(result);
}
