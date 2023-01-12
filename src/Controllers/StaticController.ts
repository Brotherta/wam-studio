const trackDiv = document.getElementById("track-container") as HTMLDivElement;
const editorDiv = document.getElementById("editor") as HTMLDivElement;
const playhead = document.getElementById("playhead") as HTMLDivElement;


/**
 * This function makes the track div and the editor div scroll synchronously.
 */
function makeDivScrollSync2() {
    
    let active: EventTarget | undefined = undefined;

    let offset = playhead.offsetLeft
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