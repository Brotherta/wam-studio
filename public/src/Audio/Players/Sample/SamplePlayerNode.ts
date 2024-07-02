
import { WebAudioModule } from "@webaudiomodules/sdk"
import BaseAudioPlayerNode from "../BaseAudioPlayerNode"

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