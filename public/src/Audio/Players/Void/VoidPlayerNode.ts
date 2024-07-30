
import { WebAudioModule } from "@webaudiomodules/sdk"
import BaseAudioPlayerNode from "../BaseAudioPlayerNode"

/**
 * A player playing nothing.
 * It just update its playhead depending on the start, stop, and its loop state.
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