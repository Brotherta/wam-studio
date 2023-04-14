import OperableAudioBuffer from "../Audio/OperableAudioBuffer";


export default class Region {

    start: number;
    duration: number;

    buffer: OperableAudioBuffer;
    trackId: number;
    id: number;


    constructor(trackId: number, buffer: OperableAudioBuffer, start: number, regionId: number) {
        this.buffer = buffer;
        this.start = start;
        this.duration = buffer.duration;
        this.trackId = trackId;
        this.id = regionId;
    }

    updateStart(newStart: number) {
        this.start = newStart;
    }
}