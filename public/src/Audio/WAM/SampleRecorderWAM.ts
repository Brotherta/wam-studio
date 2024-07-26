import { WebAudioModule } from "@webaudiomodules/sdk";
import { audioCtx } from "../../index";
import SampleRecorderNode from "./SampleRecorderNode";

export default class SampleRecorderWAM extends WebAudioModule {

    // @ts-ignore
    override async createAudioNode(initialState) {
        await SampleRecorderNode.addModules(audioCtx, this.moduleId);
        const node: SampleRecorderNode = new SampleRecorderNode(this);
        // Initialize the node audio node. Register the processor in the audio context and the WAM group.
        node._initialize();
        return node;
    }

}