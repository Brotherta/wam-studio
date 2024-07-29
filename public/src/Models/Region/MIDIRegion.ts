import { WamNode, WebAudioModule } from "@webaudiomodules/api";
import { audioCtx } from "../..";
import { MIDI } from "../../Audio/MIDI/MIDI";
import MIDIPlayerNode from "../../Audio/Players/MIDI/MIDIPlayerNode";
import MIDIPlayerWAM from "../../Audio/Players/MIDI/MIDIPlayerWAM";
import { RingBuffer } from "../../Audio/Utils/Ringbuffer";
import { RegionOf, RegionType } from "./Region";
import RegionPlayer from "./RegionPlayer";

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
        return this.midi.save()
    }

    override emptyAlike(start: number, duration: number): MIDIRegion {
        return new MIDIRegion(MIDI.empty(this.midi.instant_duration, duration), start)
    }
    
    static TYPE: RegionType<MIDIRegion>="MIDI"
    get regionType(): RegionType<MIDIRegion> { return MIDIRegion.TYPE } 

    override async createPlayer(groupid: string, audioContext: AudioContext): Promise<RegionPlayer> {
        const player=await MIDIPlayerWAM.createInstance(groupid,audioContext)
        await (player.audioNode as MIDIPlayerNode).setMidi(this.midi)
        return new MIDIRegionPlayer(player, this.midi)
    }

}


class MIDIRegionPlayer implements RegionPlayer{

    constructor(wam:WebAudioModule<WamNode>, midi: MIDI){
        const sab = RingBuffer.getStorageForCapacity(audioCtx.sampleRate * 2,Float32Array);
        this.wam=wam
        this.node = wam.audioNode as MIDIPlayerNode;
    }

    public node
    public wam

    setLoop(range: [number,number]|null): void{
        console.log("Setting loop",range)
        this.node.setLoop(range)
    }

    connect(node: WamNode): void {
        this.node.connect(node)
    }

    disconnect(node: WamNode): void {
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

    dispose(): void {
        this.node.disconnect()
        this.node.disconnectEvents()
        this.node.destroy()
    }
}