import { WebAudioModule } from "@webaudiomodules/sdk";
import { audioCtx } from "../../index";
import WamAudioWorkletNode from "./WamAudioWorkletNode";

export default class WamEventDestination extends WebAudioModule {

    // @ts-ignore
    override async createAudioNode(initialState) {
        await WamAudioWorkletNode.addModules(audioCtx, this.moduleId);
        const node: WamAudioWorkletNode = new WamAudioWorkletNode(this);
        // Initialize the node audio node. Register the processor in the audio context and the WAM group.
        node._initialize();
        return node;
    }

}