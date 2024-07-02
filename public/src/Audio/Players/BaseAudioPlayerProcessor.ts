

/**
 * A base audio processor for playing audio content.
 */
import { AudioWorkletGlobalScope } from "@webaudiomodules/api";
import type { WamProcessor as WPT } from "@webaudiomodules/sdk";

export interface IBaseAudioPlayerProcessor{
    /**
     * Write a part of the readed audio content to the output buffer
     * @param from From where to start the reading in milliseconds 
     * @param to To where to stop the reading in milliseconds exclusive
     * @param msRate The ms rate in milliseconds per sample
     */
    play(
        from:number, to:number, msRate:number,
        inputs:Float32Array[][], outputs:Float32Array[][],
        parameters:Record<string, Float32Array>
    ): void

    /**
     * Treat a received message
     * @param event 
     */
    _onMessage(event: MessageEvent): Promise<void>
}

export function getBaseAudioPlayerProcessor(moduleId: string){

    const { webAudioModules } = globalThis as unknown as AudioWorkletGlobalScope
    const moduleScope= webAudioModules.getModuleScope(moduleId)
    const { WamProcessor } = moduleScope as {WamProcessor:typeof WPT}

    abstract class BaseAudioPlayerProcessor extends WamProcessor implements IBaseAudioPlayerProcessor  {

        /** The playhead position in milliseconds */
        playhead= 0
        /**The previous playhead position in milliseconds */
        previousPlayhead= 0
    
        /** The loop start in milliseconds or -1 */
        loopStart= -1
        /** The loop end in milliseconds */
        loopEnd= 0
        
        constructor(options: any){
            super(options)
        }
    
        override async _onMessage(event: MessageEvent){
            await super._onMessage(event)
            if("playhead" in event.data){
                this.playhead = event.data.playhead
                this.previousPlayhead = this.playhead-1
                console.log("playhead"+this.constructor.name)
            }
            if("loopStart" in event.data) this.loopStart = event.data.loopStart
            if("loopEnd" in event.data) this.loopEnd = event.data.loopEnd
            if("waiting" in event.data) this.port.postMessage({resolve: event.data.waiting})
        }

        override _process(startSample: number, endSample: number, inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): void {
            if(parameters["isPlaying"][0]<0.5)return

            // Move the playhead
            this.previousPlayhead= this.playhead
            const msRate= 1000/sampleRate
            this.playhead+= outputs[0][0].length*msRate
    
            // Play the note
            this.play(this.previousPlayhead, this.playhead, msRate, inputs, outputs, parameters)
    
            // Move the playhead in the node
            this.port.postMessage({playhead: this.playhead})
        }
    
        /**
         * Write a part of the readed audio content to the output buffer
         * @param from From where to start the reading in milliseconds 
         * @param to To where to stop the reading in milliseconds exclusive
         * @param msRate The ms rate in milliseconds per sample
         */
        abstract play(
            from:number,
            to:number, 
            msRate:number,
            inputs:Float32Array[][],
            outputs:Float32Array[][],
            parameters:Record<string, Float32Array>
        ): void
        
        static override parameterDescriptors=[
            {name:"isPlaying", defaultValue:0, minValue:0, maxValue:1, automationRate:"k-rate" as const},
        ]
    }

    moduleScope.BaseAudioPlayerProcessor= BaseAudioPlayerProcessor
}