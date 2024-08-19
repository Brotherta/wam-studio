import type { AudioWorkletGlobalScope } from "@webaudiomodules/api"
import type { IBaseAudioPlayerProcessor } from "../BaseAudioPlayerProcessor"


export function getObservePlayerProcessor(moduleId:string){

    const { webAudioModules } = globalThis as unknown as AudioWorkletGlobalScope
    const { BaseAudioPlayerProcessor } = webAudioModules.getModuleScope(moduleId)

    
    class ObservePlayerProcessor extends BaseAudioPlayerProcessor implements IBaseAudioPlayerProcessor {
    
        constructor(options: any){ super(options) }

        play(from: number, to: number, msRate: number, inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): void { }

        _prepareProcessing(duration: number): boolean{
            return false
        }

        _onMessage(event: MessageEvent): Promise<void> {
            return super._onMessage(event)
        }
    
    }

    try{ registerProcessor(moduleId, ObservePlayerProcessor) } catch(e){}
}