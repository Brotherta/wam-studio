import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import { bufferToWave } from "../../Audio/Utils/audioBufferToWave";
import { audioCtx } from "../../index";
import RegionOf from "./Region";

/**
 * A note on a MIDI track.
 */
export class MIDIAction{
    /** In Hz */
    note: number
    
    velocity: number
    
    channel: number

    /** In seconds */
    duration: number 
}

/**
 * A list of notes on a MIDI track played at the same time.
 */
export type MIDIInstant=Array<MIDIAction>

/**
 * A MIDI track, represented as a sequence of MIDIInstant.
 */
export class MIDI{
    notes: MIDIInstant[] 
}

export function MI(){
    const a=audioCtx.createOscillator()
    a.frequency.value
    
}
export default class MIDIRegion extends RegionOf<MIDIRegion>{

    buffer: OperableAudioBuffer;

    constructor(trackId: number, buffer: OperableAudioBuffer, start: number, regionId: number) {
        super(trackId, start, regionId);
        this.buffer = buffer;
    }
    

    override get duration(): number { return this.buffer.duration; }

    /** @inheritdoc */
    override split(cut:number, id1:number, id2:number): [MIDIRegion, MIDIRegion] {
        const [first,second]=this.buffer.split(cut * audioCtx.sampleRate / 1000)
        return [new MIDIRegion(this.trackId, first!, this.start, id1), new SampleRegion(this.trackId, second!, this.start+cut, id2)]
    }

    /** @inheritdoc */
    override clone(id: number): MIDIRegion {
        return new MIDIRegion(this.trackId, this.buffer.clone(), this.start, id);
    }

    /** @inheritdoc */
    override mergeWith(other: MIDIRegion): void {
        this.buffer=this.buffer.concat(other.buffer)
    }

    /** @inheritdoc */
    override save(): Blob {
        return bufferToWave(this.buffer)
    }

}