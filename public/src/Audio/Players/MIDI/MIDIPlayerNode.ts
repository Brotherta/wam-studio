
import { WebAudioModule } from "@webaudiomodules/sdk"
import { MIDI } from "../../MIDI/MIDI"
import BaseAudioPlayerNode from "../BaseAudioPlayerNode"

export default class MIDIPlayerNode extends BaseAudioPlayerNode{

    constructor(module: WebAudioModule<MIDIPlayerNode>){
        super(module,{
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [2]
        })
    }

    setMidi(midi: MIDI | undefined): Promise<void>{
        if(midi) return this.postMessageAsync({instants:midi.instants, instant_duration:midi.instant_duration})
        else return this.postMessageAsync({instants:undefined})
    }
    
}