import { WamNode, WebAudioModule } from "@webaudiomodules/api";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import SamplePlayerNode from "../../Audio/Players/Sample/SamplePlayerNode";
import SamplePlayerWAM from "../../Audio/Players/Sample/SamplePlayerWAM";
import { RingBuffer } from "../../Audio/Utils/Ringbuffer";
import { bufferToWave } from "../../Audio/Utils/audioBufferToWave";
import { audioCtx } from "../../index";
import { RegionOf, RegionType } from "./Region";
import RegionPlayer from "./RegionPlayer";


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
        const player=await SamplePlayerWAM.createInstance(groupid,audioContext)
        await (player.audioNode as SamplePlayerNode).setAudio(this.buffer.toArray())
        return new SampleRegionPlayer(player, this.buffer)
    }

}

class SampleRegionPlayer implements RegionPlayer{

    constructor(wam:WebAudioModule<WamNode>, buffer: OperableAudioBuffer){
        const sab = RingBuffer.getStorageForCapacity(audioCtx.sampleRate * 2,Float32Array);
        this.node = wam.audioNode as SamplePlayerNode;
    }

    public node: SamplePlayerNode

    setLoop(range:[number,number]|null): void{
        this.node.setLoop(range)
    }

    connect(node: AudioNode): void {
        this.node.connect(node)
    }

    disconnect(node: AudioNode): void {
        this.node.disconnect(node)
    }

    connectEvents(node: WamNode): void {
        this.node.connectEvents(node.instanceId)
    }

    disconnectEvents(node: WamNode): void {
        this.node.disconnectEvents(node.instanceId)
    }

    set isPlaying(value: boolean){
        this.node.isPlaying=value
    }
    
    get isPlaying(): boolean{
        return this.node.isPlaying
    }

    playEfficiently(start: number, duration: number): Promise<void>{
        return this.node.playEfficiently(start, duration)
    }

    set playhead(value: number) {
        this.node.playhead=value
    }

    get playhead(): number {
        return this.node.playhead
    }

    destroy(): void {
        this.node.disconnectEvents()
        this.node.disconnect()
        this.node.destroy()
    }
}