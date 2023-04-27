export const NUM_CHANNELS = 2;

let time = 300; // 10 minutes

if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    time = 300; // 5 minutes
}

export const MAX_DURATION_SEC = time; // 10 minutes

export const RATIO_MILLS_BY_PX = 50; // 50 ms / pixels

export const HEIGHT_TRACK = 120; // track 100px height
export const OFFSET_FIRST_TRACK = 73 // Offset of the first track element in the host.