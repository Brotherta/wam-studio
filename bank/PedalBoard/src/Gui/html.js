

/**
 * Create a new html element from its html representation.
 * @param {string} html
 * @returns {Node}
 */
export function elementOf(html){
    const template = document.createElement('div');
    template.innerHTML = html.trim();
    return template.children[0];
}