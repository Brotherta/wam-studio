import { WamNode, WebAudioModule } from "@webaudiomodules/api";
import { audioCtx } from "../..";
import { MIDI } from "../../Audio/MIDI";
import MIDIPlayerNode from "../../Audio/Players/MIDI/MIDIPlayerNode";
import MIDIPlayerWAM from "../../Audio/Players/MIDI/MIDIPlayerWAM";
import { RingBuffer } from "../../Audio/Utils/Ringbuffer";
import { RegionOf, RegionType } from "./Region";

export default class MIDIRegion extends RegionOf<MIDIRegion>{

    midi: MIDI;

    constructor(midi: MIDI, start: number) {
        super(start);
        this.midi = midi;
    }
    
    override get duration(): number { return this.midi.duration; }

    override split(cut:number): [MIDIRegion, MIDIRegion] {
        const first=this.midi.view(0,cut).clone()
        const second=this.midi.view(cut).clone()
        return [new MIDIRegion(first, this.start), new MIDIRegion(second, this.start+cut)]
    }

    override clone(): MIDIRegion {
        return new MIDIRegion(this.midi.clone(), this.start);
    }

    override mergeWith(other: MIDIRegion): void {
        this.midi=this.midi.merge(other.midi, other.start-this.start)
    }

    override save(): Blob {
        return new Blob()//bufferToWave(this.buffer)
    }

    override emptyAlike(start: number, duration: number): MIDIRegion {
        return new MIDIRegion(MIDI.empty(this.midi.instant_duration, duration), start)
    }
    
    static TYPE: RegionType<MIDIRegion>="MIDI"
    get regionType(): RegionType<MIDIRegion> { return MIDIRegion.TYPE } 

    override async createPlayer(groupid: string, audioContext: AudioContext): Promise<RegionPlayer> {
        const player=await MIDIPlayerWAM.createInstance(groupid,audioContext)
        return new MIDIRegionPlayer(player, this.midi)
    }

}


class MIDIRegionPlayer implements RegionPlayer{

    constructor(wam:WebAudioModule<WamNode>, midi: MIDI){
        const sab = RingBuffer.getStorageForCapacity(audioCtx.sampleRate * 2,Float32Array);
        this.node = wam.audioNode as MIDIPlayerNode;
        this.node!.port.postMessage({ sab });
        this.node.midi=midi
    }

    public node: MIDIPlayerNode

    setLoop(start: number|false, end: number): void{
        this.node.setLoop(start!==false?start:undefined,end)
    }

    connect(node: AudioNode): void {
        this.node.connect(node)
    }

    disconnect(node: AudioNode): void {
        this.node.disconnect(node)
    }

    set isPlaying(value: boolean){
        this.node.isPlaying=value
    }
    
    get isPlaying(): boolean{
        return this.node.isPlaying
    }

    set playhead(value: number) {
        this.node.playhead=value
    }

    get playhead(): number {
        return this.node.playhead
    }

    clear(): void {
        this.node.disconnect()
    }
}