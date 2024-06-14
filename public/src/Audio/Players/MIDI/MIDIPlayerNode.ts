
import { WebAudioModule } from "@webaudiomodules/sdk"
import { MIDI } from "../../MIDI"
import BaseAudioPlayerNode from "../BaseAudioPlayerNode"

export default class MIDIPlayerNode extends BaseAudioPlayerNode{

    constructor(module: WebAudioModule<MIDIPlayerNode>){
        super(module,{
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [2]
        })
    }

    set midi(midi: MIDI | undefined){
        if(midi) this.port.postMessage({instants:midi.instants, instant_duration:midi.instant_duration})
        else this.port.postMessage({instants:undefined})
    }
    
}