/**
 * Useful functions for GUI and element management.
 */
/**
 * Add a class to an element, and remove it for every other siblings.
 * Call a callback on the elements that previously had the class.
 */
export declare function selectWithClass(element: Element, className: string, on_select?: (element: Element) => void): void;
/**
 * Setup a pannel selector menu.
 * A pannel selector menu is a list of pannel name,
 * where only one can be selected at a time and the
 * selected pannel is displayed.
 * @param base The base element containing the menus and the panels.
 */
export declare function setupPannelMenus(base: ParentNode): void;
/**
 * Get the next event as a promise.
 * @param element The element to listen to.
 * @param event The event to listen to.
 * @returns A promise that resolves with the event.
 */
export declare function waitForEvent<T extends keyof HTMLElementEventMap>(element: HTMLElement, event: T): Promise<HTMLElementEventMap[T]>;
