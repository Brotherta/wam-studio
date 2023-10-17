export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:6002";
export const SONGS_FILE_URL = process.env.SONGS_FILE_URL || "http://localhost:6002";

export let HEIGHT_TRACK = 120; // track 100px height

export const MAX_DURATION_SEC = 600; // 15 minutes
export const NUM_CHANNELS = 2;
export const OFFSET_FIRST_TRACK = 76 // Offset of the first track element in the host.
export const HEIGHT_NEW_TRACK = 88+16; // 88px height + 16px margin

// @@ MB : obsolete, need to change all calls to this by new version at the end of
// this file !
export const updateRatioMillsByPxOld = (value: number) => {
    RATIO_MILLS_BY_PX = value;
}
// ---------------------------------------------------------

// MB : new way to handle ms to pixels conversion, depending
// on Zoom level and on tempo. In the old code, the ratio was
// fixed to 16.85 ms per pixel, which is the value for 120bpm
// and zoom level 1. The new code allows to change the tempo
// and the zoom level, and the ratio is updated accordingly.
export const DEFAULT_TEMPO = 120;
export let TEMPO = DEFAULT_TEMPO;
// ZOOM_LEVEL is a multiplication factor. If > 1 then things are bigger on screen.
export let ZOOM_LEVEL = 1;
export let TEMPO_RATIO = 1; // tempo ratio is 1 by default, its value is currentTempo/120 (120bpm is default)
export let TEMPO_DELTA = 1; // ratio between new tempo and previous tempo
                            // useful for updating region.start when tempo changes

// default value for ratio ms per pixels.
// we set the default value assuming a tempo of 120bpm and a zoom level of 1
export let DEFAULT_RATIO_MILLS_BY_PX_FOR_120_BPM = 16.85;
// current ratio ms per pixels. Depends on tempo and zoom level
export let RATIO_MILLS_BY_PX = DEFAULT_RATIO_MILLS_BY_PX_FOR_120_BPM; 

/**
 * 
 * @param newTempo in bpm
 * TEMPO_RATIO is a multiplication factor compared to DEFAULT_TEMPO
 */
export const updateTempo = (newTempo: number) => {
    console.log("Old tempo = " + TEMPO)

    TEMPO_DELTA = newTempo/TEMPO;
    console.log("TEMPO_DELTA = " + TEMPO_DELTA);

    TEMPO_RATIO = newTempo / 120;
    console.log("TEMPO_RATIO = " + TEMPO_DELTA);

    // update tempo
    TEMPO = newTempo;
    console.log("New tempo = " + TEMPO)

    updateRatioMsByPixels();
}

/**
 * 
 * @param newZoomLevel
 * Value can be 0.25, 0.5, 0.75, 1, 2, 3, 4, 8 etc... a multiplication factor
 */
export const updateZoomLevel = (newZoomLevel: number) => {
    ZOOM_LEVEL = newZoomLevel;
    updateRatioMsByPixels();
}

export const incrementZoomLevel = () => {
    const newZoomLevel = ZOOM_LEVEL * 2;

    if(newZoomLevel > 16) return;   

    updateZoomLevel(newZoomLevel);
}

export const decrementZoomLevel = () => {
    const newZoomLevel = ZOOM_LEVEL /2;

    if(newZoomLevel < 0.05) return;

    updateZoomLevel(newZoomLevel);
}
/** 
 *  Update the ratio ms per pixels, depending on the current tempo ratio and zoom level.
    See https://docs.google.com/spreadsheets/d/1Vl2cQ2SZ0o8LwL0svlI6l4WJoWmbZN3eeb5q8VLGb7k/edit?usp=sharing
*/
export const updateRatioMsByPixels = () => {
    RATIO_MILLS_BY_PX = (DEFAULT_RATIO_MILLS_BY_PX_FOR_120_BPM/ZOOM_LEVEL) / TEMPO_RATIO;
    console.log("new ratio = " + RATIO_MILLS_BY_PX + " ms per pixel");
}




