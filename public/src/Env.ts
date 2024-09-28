export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:6002";
export const SONGS_FILE_URL = process.env.SONGS_FILE_URL || "http://localhost:6002";

export let HEIGHT_TRACK = 120; // track 100px height

export const MAX_DURATION_SEC = 600; // 15 minutes
export const NUM_CHANNELS = 2;
export const OFFSET_FIRST_TRACK = 76 // Offset of the first track element in the host.
export const HEIGHT_NEW_TRACK = 88+16; // 88px height + 16px margin



// MB : new way to handle ms to pixels conversion, depending
// on Zoom level and on tempo. In the old code, the ratio was
// fixed to 16.85 ms per pixel, which is the value for 120bpm
// and zoom level 1. The new code allows to change the tempo
// and the zoom level, and the ratio is updated accordingly.



/// TEMPO ////
/** The current tempo in BPM */
export let TEMPO = 120

/**
 * Set the tempo in bpm
 * @param newTempo in bpm
 */
export const setTempo = (newTempo: number) => {
    TEMPO = newTempo;
    updateRatioMsByPixels()
}



//// ZOOM LEVEL ////
/** The zoom level of the editor view */
export let ZOOM_LEVEL = 1

/** The minimum zoom level */
export let MIN_ZOOM_LEVEL = 0.125

/** The maximum zoom level */
export let MAX_ZOOM_LEVEL = 16

/**
 * Set the zoom level
 * Value can be 0.25, 0.5, 0.75, 1, 2, 3, 4, 8 etc... a multiplication factor
 * @param newZoomLevel
 */
export function setZoomLevel(newZoomLevel: number){
    ZOOM_LEVEL = newZoomLevel
    updateRatioMsByPixels()
}



//// MILLISECONDS BY PIXEL RATIO ////
/** The number of milliseconds by pixel for 120 BPM and a zoom level of 1 */
export let RATIO_MILLS_BY_PX_FOR_120_BPM = 16.85

/**
 * The number of milliseconds by pixel in the editor view.
 * Depends on tempo and zoom level
 */
export let RATIO_MILLS_BY_PX = 0

/** 
 *  Update RATIO_MILLS_BY_PX, depending on the current tempo ratio and zoom level.
    See https://docs.google.com/spreadsheets/d/1Vl2cQ2SZ0o8LwL0svlI6l4WJoWmbZN3eeb5q8VLGb7k/edit?usp=sharing
*/
export const updateRatioMsByPixels = () => {
    RATIO_MILLS_BY_PX = (RATIO_MILLS_BY_PX_FOR_120_BPM/ZOOM_LEVEL) * 120 / TEMPO;
}

updateRatioMsByPixels()