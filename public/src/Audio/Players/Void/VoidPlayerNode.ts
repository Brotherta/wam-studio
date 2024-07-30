
import { WebAudioModule } from "@webaudiomodules/sdk"
import BaseAudioPlayerNode from "../BaseAudioPlayerNode"

/**
 * A player node for MIDI files.
 * Can play MIDI files with the given instants and instant_duration.
 * @author Samuel DEMONT
 */
export default class VoidPlayerNode extends BaseAudioPlayerNode{

    constructor(module: WebAudioModule<VoidPlayerNode>){
        super(module,{
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [2]
        })
    }

    
}