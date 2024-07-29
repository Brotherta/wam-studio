import { WamEvent, WamMidiData } from "@webaudiomodules/api";
import { WamNode, WamProcessor, WebAudioModule } from "@webaudiomodules/sdk";
import { runToModule, WorkletUploadingContextFn } from "../Utils/AudioModule/import";

/**
 * A simple passthrough WebAudioModule.
 * Do absolutely nothing to the audio.
 * Can serve as an output or an input for a hidden audio graph.
 * Emited events are transmitted to the next node as normal.
 * 
 * You can override it connect it to an audio graph and override its connect method to make a composite node.
 * @author Samuel DEMONT
 */
export default class PassthroughWAM extends WebAudioModule<PassthroughWAMNode>{

    options: ConstructorParameters<typeof PassthroughWAMNode>[1]= {channelCount: 2, numberOfInputOutput: 1}

    override async createAudioNode(initialState?: any): Promise<PassthroughWAMNode> {
        this.descriptor.identifier="WamStudio."+PassthroughWAM.name
        await PassthroughWAMNode.addModules(this.audioContext, this.moduleId)
        const node=new PassthroughWAMNode(this, this.options)
        await node._initialize()
        return node
    }
}

/**
 * @see PassthroughWAM
 * @author Samuel DEMONT
 **/
class PassthroughWAMNode extends WamNode {

    constructor(wam: WebAudioModule, options:{channelCount: number, numberOfInputOutput: number}) {
        super(
            wam,
            {
                numberOfInputs: options.numberOfInputOutput,
                numberOfOutputs: options.numberOfInputOutput,
                channelCount: options.channelCount,
                outputChannelCount: Array(options.numberOfInputOutput).fill(options.channelCount)
            }
        )
    }

    static override async addModules(audioContext: BaseAudioContext, moduleId: any) {
        await super.addModules(audioContext, moduleId)
        await runToModule({audioContext, moduleId}, moduleCode)
    }
}

/**
 * @see PassthroughWAM
 * @author Samuel DEMONT
 */
const moduleCode: WorkletUploadingContextFn= function({context,moduleId}){

    const imports=context as {WamProcessor: typeof WamProcessor}

    class PassthroughWAMProcessor extends imports.WamProcessor {

        override _process(startSample: number, endSample: number, inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): void {
            const inout=Math.min(inputs.length, outputs.length)
            for(let i=0; i<inout; i++) {
                const max_channel=Math.min(inputs[i].length, outputs[i].length)
                for(let channel=0; channel<max_channel; channel++){
                    for(let sample=startSample; sample<endSample; sample++) {
                        outputs[i][channel][sample] = inputs[i][channel][sample];
                    }
                }
            }
        }
        
        override _processEvent(event: WamEvent): void {
            this.emitEvents(event)
        }

        override _onMidi(midiData: WamMidiData): void { }
    }

    try{ this.registerProcessor(moduleId, PassthroughWAMProcessor) }catch(e){ }
}
