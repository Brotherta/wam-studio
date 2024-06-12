import { WamNode, WebAudioModule } from "@webaudiomodules/api";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import { RingBuffer } from "../../Audio/Utils/Ringbuffer";
import { bufferToWave } from "../../Audio/Utils/audioBufferToWave";
import WamAudioWorkletNode from "../../Audio/WAM/WamAudioWorkletNode";
import WamEventDestination from "../../Audio/WAM/WamEventDestination";
import { audioCtx } from "../../index";
import { RegionOf, RegionType } from "./Region";


export default class SampleRegion extends RegionOf<SampleRegion>{

    buffer;

    constructor(buffer: OperableAudioBuffer, start: number) {
        super(start);
        this.buffer = buffer;
    }
    

    override get duration(): number { return this.buffer.duration*1000 }

    override split(cut:number): [SampleRegion, SampleRegion] {
        const [first,second]=this.buffer.split(cut * audioCtx.sampleRate / 1000)
        return [new SampleRegion(first!, this.start), new SampleRegion(second!, this.start+cut)]
    }

    override clone(): SampleRegion {
        return new SampleRegion(this.buffer.clone(), this.start);
    }

    override mergeWith(other: SampleRegion): void {
        this.buffer=this.buffer.merge(other.buffer, (other.start-this.start)*audioCtx.sampleRate/1000)
        if(other.start<this.start)this.start=other.start
    }

    override emptyAlike(start: number, duration: number): SampleRegion {
        return new SampleRegion(OperableAudioBuffer.create({sampleRate: audioCtx.sampleRate, length: duration*audioCtx.sampleRate/1000}), start)
    }

    override save(): Blob {
        return bufferToWave(this.buffer)
    }

    static TYPE: RegionType<SampleRegion>="SAMPLE"
    get regionType(): RegionType<SampleRegion> { return SampleRegion.TYPE } 

    override async createPlayer(groupid: string, audioContext: AudioContext): Promise<RegionPlayer> {
        const wam=await WamEventDestination.createInstance(groupid, audioContext);
        return new SampleRegionPlayer(wam, this.buffer)
    }

}

class SampleRegionPlayer implements RegionPlayer{

    constructor(wam:WebAudioModule<WamNode>, buffer: OperableAudioBuffer){
        let node = wam.audioNode as WamAudioWorkletNode;
        const sab = RingBuffer.getStorageForCapacity(audioCtx.sampleRate * 2,Float32Array);
        this.node = wam.audioNode as WamAudioWorkletNode;
        this.node!.port.postMessage({ sab });
        this.node.setAudio(buffer.toArray())
    }

    public node: WamAudioWorkletNode

    setLoop(start: number|false, end: number): void{
        if(start===false){
            this.node.loop(false)
        }
        else{
            this.node.loop(true)
            this.node.setLoop(start, end)
        }
    }

    connect(node: AudioNode): void {
        console.log("Connecting to", node)
        this.node.connect(node)
    }

    disconnect(node: AudioNode): void {
        console.log("Disconnecting from", node)
        this.node.disconnect(node)
    }

    play(): void {
        this.node.play()
    }

    pause(): void {
        this.node.pause()
    }

    set playhead(value: number) {
        this.node.playhead=value*audioCtx.sampleRate/1000
    }

    clear(): void {
        this.node.removeAudio()
        this.node.disconnectEvents()
        this.node.disconnect()
    }
}