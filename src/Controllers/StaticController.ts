const trackDiv = document.getElementById("track-container") as HTMLDivElement;
const editorDiv = document.getElementById("editor") as HTMLDivElement;
const playhead = document.getElementById("playhead") as HTMLDivElement;


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

    trackDiv.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        editorDiv.scrollTop = trackDiv.scrollTop;
    })   
    editorDiv.addEventListener("scroll", function(e: Event) {
        if (e.target !== active) return;
        trackDiv.scrollTop = editorDiv.scrollTop;
    })
    makeDivScrollSync2();
}

export { makeDivScrollSync }


let isDragging = false;
let currentX: number;
let currentY: number;
let initialX: number;
let initialY: number;
let xOffset = 0;
let yOffset = 0;

const header = document.getElementById("header");
const resizableWindow = document.getElementById("resizableWindow");

// @ts-ignore
header.addEventListener("mousedown", dragStart);
// @ts-ignore
header.addEventListener("mouseup", dragEnd);
// // @ts-ignore
// header.addEventListener("mouseleave", dragEnd);
// @ts-ignore
window.addEventListener("mousemove", drag);

function dragStart(e: { clientX: number; clientY: number; }) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    isDragging = true;
}

function dragEnd() {
    initialX = currentX;
    initialY = currentY;

    isDragging = false;
}

function drag(e: { preventDefault: () => void; clientX: number; clientY: number; }) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, resizableWindow);
    }
}

function setTranslate(xPos: string | number, yPos: string | number, el: HTMLElement | null) {
    // @ts-ignore
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
}