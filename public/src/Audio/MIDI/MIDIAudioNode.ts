
// @ts-ignore

import { MIDI } from "../../Models/Region/MIDIRegion"


export default class MIDIAudioNode extends AudioWorkletNode{

    constructor(context: AudioContext, options: AudioWorkletNodeOptions){
        super(context, "jempasam.midi-audio-processor",{
            ...options,
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [2],
        })
    }
    
    get isPlaying(){ return this.parameters.get("isPlaying")!.value > 0.5 }
    set isPlaying(value: boolean){ this.parameters.get("isPlaying")!.value = value?1:0 }

    set midi(midi: MIDI){
        this.port.postMessage({
            instants: midi.instants,
            instant_duration: midi.instant_duration
        })
    }

}