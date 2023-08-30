import {app} from "../index";

const trackDiv = document.getElementById("track-container") as HTMLDivElement;
const automationController = document.getElementById("automation-container") as HTMLElement;

class DraggableWindow {

    isDragging = false;
    currentX: number;
    currentY: number;
    initialX: number;
    initialY: number;
    xOffset = 0;
    yOffset = 0;

    header: HTMLElement;
    resizableWindow: HTMLElement;

    constructor(header: HTMLElement, resizableWindow: HTMLElement) {
        this.header = header;
        this.resizableWindow = resizableWindow;
        this.header.addEventListener("mousedown", this.dragStart);
        this.header.addEventListener("mouseup", this.dragEnd);
        window.addEventListener("mousemove", this.drag);
    }

    dragStart = (e: { clientX: number; clientY: number; }) => {
        this.initialX = e.clientX - this.xOffset;
        this.initialY = e.clientY - this.yOffset;

        this.isDragging = true;
    }

    dragEnd = () => {
        this.initialX = this.currentX;
        this.initialY = this.currentY;

        this.isDragging = false;
    }

    drag = (e: { preventDefault: () => void; clientX: number; clientY: number; }) => {
        if (this.isDragging) {
            e.preventDefault();
            this.currentX = e.clientX - this.initialX;
            this.currentY = e.clientY - this.initialY;

            this.xOffset = this.currentX;
            this.yOffset = this.currentY;

            this.setTranslate(this.currentX, this.currentY, this.resizableWindow);
        }
    }

    setTranslate = (xPos: string | number, yPos: string | number, el: HTMLElement | null) => {
        // @ts-ignore
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
}

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

const windowIDs = [
    'latency', 'settings', 'plugin', 'about', 'project'
];

const headers: { [id: string]: HTMLElement } = {};
const windows: { [id: string]: HTMLElement } = {};

for (const id of windowIDs) {
    headers[id] = document.getElementById(`${id}-header`) as HTMLElement;
    windows[id] = document.getElementById(`${id}-window`) as HTMLElement;
}

const draggableWindows: { [id: string]: DraggableWindow } = {};

for (const id of windowIDs) {
    draggableWindows[id] = new DraggableWindow(headers[id], windows[id]);
    draggableWindows[id].resizableWindow.onmousedown = () => {
        focusWindow(draggableWindows[id].resizableWindow);
    };
}

function focusWindow(windowToFocus: HTMLElement) {
    for (const id of windowIDs) {
        draggableWindows[id].resizableWindow.style.zIndex = (draggableWindows[id].resizableWindow === windowToFocus) ? "100" : "99";
    }
}

export { makeDivScrollSync, focusWindow }
