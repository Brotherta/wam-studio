import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import { bufferToWave } from "../../Audio/Utils/audioBufferToWave";
import { audioCtx } from "../../index";
import { RegionOf } from "./Region";


export default class SampleRegion extends RegionOf<SampleRegion>{

    buffer;

    constructor(trackId: number, buffer: OperableAudioBuffer, start: number, regionId: number) {
        super(trackId, start, regionId);
        this.buffer = buffer;
    }
    

    override get duration(): number { return this.buffer.duration*1000 }

    /** @inheritdoc */
    override split(cut:number, id1:number, id2:number): [SampleRegion, SampleRegion] {
        const [first,second]=this.buffer.split(cut * audioCtx.sampleRate / 1000)
        return [new SampleRegion(this.trackId, first!, this.start, id1), new SampleRegion(this.trackId, second!, this.start+cut, id2)]
    }

    /** @inheritdoc */
    override clone(id: number): SampleRegion {
        return new SampleRegion(this.trackId, this.buffer.clone(), this.start, id);
    }

    /** @inheritdoc */
    override mergeWith(other: SampleRegion): void {
        this.buffer=this.buffer.merge(other.buffer, (other.start-this.start)*audioCtx.sampleRate/1000)
        if(other.start<this.start)this.start=other.start
    }

    /** @inheritdoc */
    override save(): Blob {
        return bufferToWave(this.buffer)
    }

}