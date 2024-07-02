import type { AudioWorkletGlobalScope } from "@webaudiomodules/api"
import { IBaseAudioPlayerProcessor } from "../BaseAudioPlayerProcessor"


export function getSamplePlayerProcessor(moduleId:string){

    const { webAudioModules } = globalThis as unknown as AudioWorkletGlobalScope
    const { BaseAudioPlayerProcessor } = webAudioModules.getModuleScope(moduleId)

    class SamplePlayerProcessor extends BaseAudioPlayerProcessor implements IBaseAudioPlayerProcessor {

        audio: Float32Array[] | undefined
    
        constructor(options: any){
            super(options)
        }
    
        async _onMessage(e: MessageEvent<any>){
            if ("audio" in e.data){
                this.audio = e.data.audio
                this.port.postMessage({resolve:"audio"})
            }
            await super._onMessage(e)
        }
    
        play(from: number, to: number, msRate: number, inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): void {
            if (!this.audio) return
            const bufferSize: number = outputs[0][0].length;
            const output: Float32Array[] = outputs[0];
    
            const audioLength: number = this.audio[0].length
            const fromSample= Math.floor(from*sampleRate/1000);                     if (fromSample > audioLength)return
            const toSample= Math.min(Math.floor(to*sampleRate/1000), audioLength)
            const sampleCount= toSample-fromSample;                                 if (sampleCount <= 0) return
            const maxi=Math.min(bufferSize, sampleCount)
            const channelCount = Math.min(this.audio.length, output.length)
    
            for (let channel = 0; channel < channelCount; channel++) {
                for (let i = 0; i < maxi; i++) {
                    output[channel][i] = this.audio[channel][i+fromSample];
                }
            }
        }
    
    }
    try{ registerProcessor(moduleId, SamplePlayerProcessor) } catch(e){}
}