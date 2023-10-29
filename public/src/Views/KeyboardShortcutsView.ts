import DraggableWindow from "../Utils/DraggableWindow";

/**
 * View for the about window. It contains all the elements of the about window.
 */
export default class KeyboarsShortcutsWindow extends DraggableWindow {

    constructor() {
        super(document.getElementById("keyboard-shortcuts-header") as HTMLDivElement, document.getElementById("keyboard-shortcuts-window") as HTMLDivElement);
    }

}