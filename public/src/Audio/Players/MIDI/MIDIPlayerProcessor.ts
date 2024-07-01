import type { AudioWorkletGlobalScope } from "@webaudiomodules/api"
import type { MIDIInstant } from "../../MIDI"
import type { IBaseAudioPlayerProcessor } from "../BaseAudioPlayerProcessor"


export function getMIDIPlayerProcessor(moduleId:string){

    const { webAudioModules } = globalThis as unknown as AudioWorkletGlobalScope
    const { BaseAudioPlayerProcessor } = webAudioModules.getModuleScope(moduleId)

    
    class MIDIPlayerProcessor extends BaseAudioPlayerProcessor implements IBaseAudioPlayerProcessor {

        instants: MIDIInstant[] | undefined
        instant_duration=1000
    
        constructor(options: any){
            super(options)
        }
    
        async _onMessage(e: MessageEvent<any>) { 
            await super._onMessage(e)
            if("instants" in e.data) this.instants = e.data.instants
            if("instant_duration" in e.data) this.instant_duration=e.data.instant_duration
        }
    
        play(from: number, to: number, msRate: number, inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): void {
            if (!this.instants) return

            // Get the instant
            let fromInstantI = Math.max(Math.floor(from/this.instant_duration),0)
            let toInstantI = Math.min(Math.floor(to/this.instant_duration),this.instants.length-1)
            if(fromInstantI>=this.instants.length)return
            
            for(let instantI=fromInstantI; instantI<=toInstantI; instantI++){
                let instant = this.instants[instantI]

                // Get the from and to locally in the instant
                let localFrom= from-this.instant_duration*instantI
                let localTo= to-this.instant_duration*instantI
                let selectedNote=-1
                for(const {offset,note} of instant){
                    if(localFrom<=offset && offset<localTo){
                        selectedNote=note.note
                        /*for(let c=0; c<outputs[0].length; c++){
                            for(let i=0; i<outputs[0][c].length; i++){
                                outputs[0][c][i] += Math.sin((currentFrame+i)/(selectedNote-200)*20)*0.2;
                            }
                        }*/
                        console.log(selectedNote)
                        this.emitEvents(
                            { type: 'wam-midi', time: currentTime, data: { bytes: new Uint8Array([0x90 | note.channel, note.note, note.velocity]) } },
                            { type: 'wam-midi', time: currentTime+note.duration/1000, data: { bytes: new Uint8Array([0x80 | note.channel, note.note, note.velocity]) } },
                        );
                    }
                }
            }
        }

        _connectEvents(...args: any[]){
            super._connectEvents(...args)
        }
    
    }

    
    try{ registerProcessor(moduleId, MIDIPlayerProcessor) } catch(e){}
}