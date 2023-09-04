import {app} from "../index";

const trackDiv = document.getElementById("track-container") as HTMLDivElement;
const automationController = document.getElementById("automation-container") as HTMLElement;

/**
 * This function makes the track div and the editor div scroll synchronously.
 */
function makeDivScrollSync() {
    let active: EventTarget | undefined = undefined;

    trackDiv.addEventListener("mouseenter", function(e: Event) {
        active = e.target as EventTarget;
    })
    automationController.addEventListener("mouseenter", function(e: Event) {
        active = e.target as EventTarget;
    })
    trackDiv.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        automationController.scrollTop = trackDiv.scrollTop;
        app.editorView.verticalScrollbar.customScrollTop(trackDiv.scrollTop);
    })
    automationController.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        trackDiv.scrollTop = automationController.scrollTop;
    })
}


export { makeDivScrollSync }
