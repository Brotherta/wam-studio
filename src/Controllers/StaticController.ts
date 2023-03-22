const trackDiv = document.getElementById("track-container") as HTMLDivElement;
const editorDiv = document.getElementById("editor") as HTMLDivElement;
const playhead = document.getElementById("playhead") as HTMLDivElement;

const automationController = document.getElementById("automation-container") as HTMLElement;

const settingsHeader = document.getElementById("settings-header") as HTMLElement;
const settingsWindow = document.getElementById("settings-window") as HTMLElement;

const pluginHeader = document.getElementById("plugin-header") as HTMLElement;
const pluginWindow = document.getElementById("plugin-window") as HTMLElement;


/**
 * This function makes the track div and the editor div scroll synchronously.
 */

function makeDivScrollSync2() {
    
    let active: EventTarget | undefined = undefined;

    let offset = 0;
    playhead.style.zIndex = "1";
    trackDiv.style.zIndex = "2";

    playhead.addEventListener("mouseenter", function(e: Event) {
        active = e.target as EventTarget;
    })
    editorDiv.addEventListener("mouseenter", function(e: Event) {
        active = e.target as EventTarget;
    })

    playhead.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        editorDiv.scrollLeft = playhead.scrollLeft;
    })   
    editorDiv.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        playhead.style.left = `${offset -editorDiv.scrollLeft}`;
    })
}

/**
 * This function makes the track div and the editor div scroll synchronously.
 */
function makeDivScrollSync() {
    let active: EventTarget | undefined = undefined;

    trackDiv.addEventListener("mouseenter", function(e: Event) {
        active = e.target as EventTarget;
    })
    editorDiv.addEventListener("mouseenter", function(e: Event) {
        active = e.target as EventTarget;
    })
    automationController.addEventListener("mouseenter", function(e: Event) {
        active = e.target as EventTarget;
    })

    trackDiv.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        editorDiv.scrollTop = trackDiv.scrollTop;
        automationController.scrollTop = trackDiv.scrollTop;
    })   
    editorDiv.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        trackDiv.scrollTop = editorDiv.scrollTop;
        automationController.scrollTop = editorDiv.scrollTop;
    })
    automationController.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        trackDiv.scrollTop = automationController.scrollTop;
        editorDiv.scrollTop = automationController.scrollTop;
    })

    makeDivScrollSync2();
}

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

function focusWindow(windowToFocus: HTMLElement) {
    if (windowToFocus === draggableWindow.resizableWindow) {
        draggableWindow2.resizableWindow.style.zIndex = "99";
        draggableWindow.resizableWindow.style.zIndex = "100";
    } else {
        draggableWindow2.resizableWindow.style.zIndex = "100";
        draggableWindow.resizableWindow.style.zIndex = "99";
    }
}

// @ts-ignore
const draggableWindow = new DraggableWindow(pluginHeader, pluginWindow);
// @ts-ignore
const draggableWindow2 = new DraggableWindow(settingsHeader, settingsWindow);

draggableWindow2.resizableWindow.onmousedown = () => { focusWindow(draggableWindow2.resizableWindow) };
draggableWindow.resizableWindow.onmousedown = () => { focusWindow(draggableWindow.resizableWindow) };



export { makeDivScrollSync, focusWindow }
