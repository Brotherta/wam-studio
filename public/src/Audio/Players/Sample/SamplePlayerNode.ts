
import { WebAudioModule } from "@webaudiomodules/sdk"
import BaseAudioPlayerNode from "../BaseAudioPlayerNode"

/**
 * A player node for sample files.
 * Can play sample files with the given audio.
 * @author Samuel DEMONT
 */
export default class SamplePlayerNode extends BaseAudioPlayerNode{

    constructor(module: WebAudioModule<SamplePlayerNode>){
        super(module,{
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [2]
        })
    }

    override _onMessage(message: MessageEvent<any>): void {
        super._onMessage(message)
    }

    setAudio(audio: Float32Array[] | undefined): Promise<void>{
        return this.postMessageAsync({audio})
    }
    
}