import type { ParameterUtils as ParameterUtilsType, Pedalboard2SharedData } from "./Pedalboard2Node"
import type { AudioWorkletGlobalScope, WamEvent } from "./webaudiomodules/api"
import { WamGroup, WamProcessor } from "./webaudiomodules/sdk"


export function getPedalboard2Processor(moduleId: string){
    
    const context = globalThis as unknown as AudioWorkletGlobalScope
    const module = context.webAudioModules.getModuleScope(moduleId) as {WamProcessor: typeof WamProcessor, ParameterUtils: typeof ParameterUtilsType}

    const {ParameterUtils}=module

    /**
     * The processor class for the Pedalboard2 Node.
     */
    class Pedalboard2Processor extends module.WamProcessor{

        private shared?: Pedalboard2SharedData
        private group?: WamGroup

        _initialize(): void {
            super._initialize()
        }

        async _onMessage(message: MessageEvent): Promise<void> {
            const { id, request, content } = message.data
            if(request=="set/shared"){
                this.shared=content as Pedalboard2SharedData
                this.group=context.webAudioModules.getGroup(this.shared.innerGroupId, this.shared.innerGroupKey) as WamGroup
            }
            else if(request=="add/event"){
                this.scheduleEventDown(content.event as WamEvent)
            }
            super._onMessage(message)
        }

        // Do nothing to the audio
        // Just copy the input to the output
        _process(startSample: number, endSample: number, inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): void {
            // For only first input and output
            const input= inputs[0]
            const output= outputs[0]
            // For each channel
            for(let c=0; c<input.length; c++){
                const inChannel= input[c]
                const outChannel= output[c]
                // Copy samples of the provided range
                outChannel.set(inChannel.subarray(startSample, endSample), startSample)
            }
        }



        /** -~- UTILS -~- */
        /** Get a wamprocessor and a parameter inernal name from an exposed parameter name  */
        private getInternalName(name: string): [WamProcessor, string]|null{            
            if(!this.shared || !this.group)return null

            const internal= ParameterUtils.internal_id(name)
            if(!internal)return null

            const instanceId= this.shared.childs[internal.id].instanceId
            const processor= this.group.processors.get(instanceId) as WamProcessor
            if(!processor)return null
    
            return [processor, internal.parameter]
        }



        /** -~- SEND TO CHILDS -~- */
        /** Send an event to the childs nodes */
        scheduleEventDown(event: WamEvent): void{
            if(event.type=="wam-automation"){
                const target= this.getInternalName(event.data.id)
                console.log("Try send", event, target)
                if(target){
                    const [processor, paramName]= target
                    console.log("Send to", target, {id: paramName, time:event.time, value: event.data.value, normalized: event.data.normalized})
                    processor.scheduleEvents({type: "wam-automation", time:event.time, data: {id: paramName, value: event.data.value, normalized: event.data.normalized}})
                }
            }
            else{
                if(this.group){
                    for(const processor of this.group.processors.values()){
                        processor.scheduleEvents(event)
                    }
                }
            }
        }



        /** -~- COMPOSITE METHODS OVERLOADS -~- */
        // Give back the events to the child nodes, and convert the exposer parameter names
        scheduleEvents(...event: WamEvent[]): void {
            for(const e of event) this.scheduleEventDown(e)
        }

        // Clear the events of the child nodes
        clearEvents(): void {
            for(const processor of this.group?.processors.values() || []){
                processor.clearEvents()
            }
        }
    }

    try{ context.registerProcessor(moduleId,Pedalboard2Processor) }catch(e){}
}