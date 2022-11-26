import { WebAudioModule } from "@webaudiomodules/api";
import {addFunctionModule, WamNode} from "@webaudiomodules/sdk";
import getProcessor from "./WamProcessor";

export default class WamAudioWorkletNode extends WamNode {
    

    
    static override async addModules(audioCtx: AudioContext, moduleId: any) {
        const {audioWorklet} = audioCtx;
        await super.addModules(audioCtx, moduleId);
        await addFunctionModule(audioWorklet, getProcessor, moduleId);
    }


    constructor(module: WebAudioModule) {
        super(module,
            {
                processorOptions: {
                    numberOfInputs: 1,
                    numberOfOutputs: 1,
                    outputChannelCount: [2],
                    useSab: true
                }
            });
    }

    setAudio(audio: Float32Array[]) {
        this.port.postMessage({audio});
    }

    removeAudio() {
        this.port.postMessage({"removeAudio": true})
    }
}