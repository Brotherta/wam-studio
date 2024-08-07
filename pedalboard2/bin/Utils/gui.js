/**
 * Useful functions for GUI and element management.
 */
/**
 * Add a class to an element, and remove it for every other siblings.
 * Call a callback on the elements that previously had the class.
 */
export function selectWithClass(element, className, on_select = () => { }) {
    const parent = element.parentElement;
    if (parent) {
        for (const child of parent.children) {
            if (child.classList.contains(className)) {
                on_select(child);
                child.classList.remove(className);
            }
        }
        element.classList.add(className);
    }
}
/**
 * Setup a pannel selector menu.
 * A pannel selector menu is a list of pannel name,
 * where only one can be selected at a time and the
 * selected pannel is displayed.
 * @param base The base element containing the menus and the panels.
 */
export function setupPannelMenus(base) {
    const pannels = base.querySelectorAll(".pannel") ?? [];
    for (const pannel of pannels) {
        // Get buttons
        const buttons = pannel.querySelectorAll(":scope>._button");
        for (const button of buttons) {
            // Get target
            const target = base.querySelector("#" + button.getAttribute("--data-target") ?? "__nothing__");
            // Set button
            button.addEventListener("click", () => {
                selectWithClass(button, "_selected", it => {
                    const tohide = base.querySelector("#" + it.getAttribute("--data-target") ?? "__nothing__");
                    if (tohide)
                        tohide.classList.add("hidden");
                });
                if (target)
                    target.classList.remove("hidden");
            });
            // Hide by default
            if (target && !button.classList.contains("_selected"))
                target.classList.add("hidden");
        }
    }
}
/**
 * Get the next event as a promise.
 * @param element The element to listen to.
 * @param event The event to listen to.
 * @returns A promise that resolves with the event.
 */
export function waitForEvent(element, event) {
    return new Promise(resolve => {
        const action = function (e) {
            element.removeEventListener(event, action);
            resolve(e);
        };
        element.addEventListener(event, action);
    });
}
