
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

    set audio(audio: Float32Array[] | undefined){
        this.port.postMessage({audio})
    }
    
}