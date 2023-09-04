import DraggableWindow from "../Utils/DraggableWindow";

/**
 * View for the about window. It contains all the elements of the about window.
 */
export default class AboutWindow extends DraggableWindow {

    constructor() {
        super(document.getElementById("about-header") as HTMLDivElement, document.getElementById("about-window") as HTMLDivElement);
    }

}