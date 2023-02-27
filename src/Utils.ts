export const SAMPLE_RATE = 44100;
export const NUM_CHANNELS = 2;

let time = 600; // 10 minutes

if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    console.log("Firefox detected");
    time = 300; // 5 minutes
}
else {
    console.log("Not Firefox");
}

export const MAX_DURATION_SEC = time; // 10 minutes

export const RATIO_MILLS_BY_PX = 50; // 50 ms / pixels

export const HEIGHT_TRACK = 90; // track 90px height
export const OFFSET_FIRST_TRACK = 73 // Offset of the first track element in the host.