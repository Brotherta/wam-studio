export let RATIO_MILLS_BY_PX = 50; // 50 ms / pixels
export let HEIGHT_TRACK = 120; // track 100px height

export const MAX_DURATION_SEC = 600; // 15 minutes
export const NUM_CHANNELS = 2;
export const OFFSET_FIRST_TRACK = 76 // Offset of the first track element in the host.
export const HEIGHT_NEW_TRACK = 88+16; // 88px height + 16px margin

export const updateRatioMillsByPx = (value: number) => {
    RATIO_MILLS_BY_PX = value
}