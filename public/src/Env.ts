export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:6002";
export const SONGS_FILE_URL = process.env.SONGS_FILE_URL || "http://localhost:6002";

// default value for ration/zomm in ms / pixels
// we set the default value assuming a tempo of 120bpm and a 4/4 time signature
export let DEFAULT_RATIO_MILLS_BY_PX_FOR_120_BPM = 16.85;

export let RATIO_MILLS_BY_PX = DEFAULT_RATIO_MILLS_BY_PX_FOR_120_BPM; 
export let HEIGHT_TRACK = 120; // track 100px height

export const MAX_DURATION_SEC = 600; // 15 minutes
export const NUM_CHANNELS = 2;
export const OFFSET_FIRST_TRACK = 76 // Offset of the first track element in the host.
export const HEIGHT_NEW_TRACK = 88+16; // 88px height + 16px margin

export const updateRatioMillsByPx = (value: number) => {
    RATIO_MILLS_BY_PX = value
}