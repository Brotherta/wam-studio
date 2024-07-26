import { WamNode } from "@webaudiomodules/api";
import App from "../../../../App";
import { MIDIAccumulator } from "../../../../Audio/MIDI/MIDI";
import TrackElement from "../../../../Components/Editor/TrackElement";
import MIDIRegion from "../../../../Models/Region/MIDIRegion";
import { RegionRecorder } from "./../RegionRecorder";



export class MIDIRegionRecorder implements RegionRecorder<MIDIRegion>{

    app: App
    //@ts-ignore NEED BECAUSE MIDIMessageEvent is not defined in the api
    midi_listener: (message: MIDIMessageEvent) => void
    element?: TrackElement

    private constructor(){}
    static async create(app: App): Promise<MIDIRegionRecorder> {
        const recorder=new this()
        recorder.app=app
        recorder.midi_listener = recorder.on_midi_message.bind(recorder)
        recorder.app.settingsView.on_midi_message.add(recorder.midi_listener)
        return recorder;
    }

    //@ts-ignore NEED BECAUSE MIDIMessageEvent is not defined in the api
    on_midi_message(message: MIDIMessageEvent): void {
        this._connecteds.forEach(node =>{
            if(message.data){
                node.scheduleEvents({
                    type: "wam-midi",
                    data: {bytes: [message.data[0], message.data[1], message.data[2]]},
                    time: node.context.currentTime
                })
            }
        })
        if(message.data){
            if(this.on_part && this.accumulator){
                const noteState= message.data[0] & 0xf0
                const channel= message.data[0] & 0x0f
                const note = message.data[1]
                const velocity = message.data[2]/127
                const time= Date.now() - this.startTime
                console.log("startTime",this.startTime,"date.now",Date.now(),"time",time)
                console.log("MIDI", noteState, channel, note, velocity, time)
                if(noteState === 0x90) this.accumulator.noteOn(note, channel, velocity, time)
                else if(noteState === 0x80) this.accumulator.noteOff(note, channel, time)
                if(this.accumulator.closedCount>0 && this.accumulator.openCount==0){
                    const midi = this.accumulator.build()
                    const region = new MIDIRegion(midi,0)
                    this.on_part(region)
                    this.accumulator = new MIDIAccumulator()
                    this.startTime = Date.now()
                }
            }
            else if(this.on_stop){
                if(this.accumulator && this.accumulator.closedCount>0){
                    const midi = this.accumulator.build()
                    const region = new MIDIRegion(midi,0)
                    this.on_stop(region)
                    this.accumulator=undefined
                }
                this.on_stop=undefined
                this.resolver?.()
            }
        }
    }

    private _connecteds  = new Set<WamNode>()

    connect(node: WamNode): void { this._connecteds.add(node) }

    disconnect(node: WamNode): void { this._connecteds.delete(node) }


    // Recordings
    private on_part?: (addedRegion: MIDIRegion) => void
    private on_stop?: (addedRegion: MIDIRegion) => void
    private resolver?: ()=>void
    private accumulator?: MIDIAccumulator
    private startTime = 0

    start(on_part: (addedRegion: MIDIRegion) => void, on_stop: (addedRegion: MIDIRegion) => void): void {
        this.on_part= on_part
        this.on_stop= on_stop
        this.accumulator= new MIDIAccumulator()
        this.startTime= Date.now()
    }

    stop(): Promise<void> {
        return new Promise(resolver=>{
            this.on_part=undefined
            this.resolver=resolver
        })
    }

    destroy(): void {
        this.app.settingsView.on_midi_message.delete(this.midi_listener)
    }

}