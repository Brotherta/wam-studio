import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import { RATIO_MILLS_BY_PX } from "../Env";


export default class Region {
    // current start position
    start: number; // in milliseconds
    duration: number; // in seconds
    pos:number; // left end (start pos) in pixels

    buffer: OperableAudioBuffer;
    trackId: number;
    id: number;


    constructor(trackId: number, buffer: OperableAudioBuffer, start: number, regionId: number) {
        this.buffer = buffer;
        // in milliseconds
        this.start = start;
        // in pixels
        this.pos = this.start * RATIO_MILLS_BY_PX;

        // in seconds
        this.duration = buffer.duration;
        this.trackId = trackId;
        this.id = regionId;
    }

    updateStart(newStart: number) {
        this.start = newStart;
    }
}