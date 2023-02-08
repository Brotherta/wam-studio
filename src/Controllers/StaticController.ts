const trackDiv = document.getElementById("track-container") as HTMLDivElement;
const editorDiv = document.getElementById("editor") as HTMLDivElement;
const playhead = document.getElementById("playhead") as HTMLDivElement;

const specialControl = document.getElementById("special-controls-container") as HTMLDivElement;

const header = document.getElementById("header") as HTMLElement;
const resizableWindow = document.getElementById("resizableWindow") as HTMLElement;

const advancedHeader = document.getElementById("advanced-header") as HTMLElement;
const advancedResizableWindow = document.getElementById("advanced-window") as HTMLElement;

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
    specialControl.addEventListener("mouseenter", function(e: Event) {
        active = e.target as EventTarget;
    })

    trackDiv.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        specialControl.scrollTop = trackDiv.scrollTop;
    })   
    specialControl.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        trackDiv.scrollTop = specialControl.scrollTop;
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

// @ts-ignore
const draggableWindow = new DraggableWindow(header, resizableWindow);
// @ts-ignore
const draggableWindowAdvanced = new DraggableWindow(advancedHeader, advancedResizableWindow);

export { makeDivScrollSync }
