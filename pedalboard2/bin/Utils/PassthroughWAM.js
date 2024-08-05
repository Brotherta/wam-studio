import { addFunctionModule, WamNode, WebAudioModule } from "../webaudiomodules/sdk";
/**
 * A simple passthrough WebAudioModule.
 * Do absolutely nothing to the audio.
 * Can serve as an output or an input for a hidden audio graph.
 * Emited events are transmitted to the next node as normal.
 *
 * You can override it connect it to an audio graph and override its connect method to make a composite node.
 * @author Samuel DEMONT
 */
export default class PassthroughWAM extends WebAudioModule {
    options = { channelCount: 2, numberOfInputOutput: 1 };
    async createAudioNode(initialState) {
        this.descriptor.identifier = "WamStudio." + PassthroughWAM.name;
        await PassthroughWAMNode.addModules(this.audioContext, this.moduleId);
        const node = new PassthroughWAMNode(this, this.options);
        await node._initialize();
        return node;
    }
}
/**
 * @see PassthroughWAM
 * @author Samuel DEMONT
 **/
class PassthroughWAMNode extends WamNode {
    constructor(wam, options) {
        super(wam, {
            numberOfInputs: options.numberOfInputOutput,
            numberOfOutputs: options.numberOfInputOutput,
            channelCount: options.channelCount,
            outputChannelCount: Array(options.numberOfInputOutput).fill(options.channelCount)
        });
    }
    static async addModules(audioContext, moduleId) {
        await super.addModules(audioContext, moduleId);
        await addFunctionModule(audioContext.audioWorklet, moduleId, moduleCode);
    }
}
/**
 * @see PassthroughWAM
 * @author Samuel DEMONT
 */
const moduleCode = function (moduleId) {
    const context = globalThis;
    const imports = context.webAudioModules.getModuleScope(moduleId);
    class PassthroughWAMProcessor extends imports.WamProcessor {
        _process(startSample, endSample, inputs, outputs, parameters) {
            const inout = Math.min(inputs.length, outputs.length);
            for (let i = 0; i < inout; i++) {
                const max_channel = Math.min(inputs[i].length, outputs[i].length);
                for (let channel = 0; channel < max_channel; channel++) {
                    for (let sample = startSample; sample < endSample; sample++) {
                        outputs[i][channel][sample] = inputs[i][channel][sample];
                    }
                }
            }
        }
        _processEvent(event) {
            this.emitEvents(event);
        }
        _onMidi(midiData) { }
    }
    try {
        context.registerProcessor(moduleId, PassthroughWAMProcessor);
    }
    catch (e) { }
};
