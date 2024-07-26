import type { AudioWorkletGlobalScope } from "@webaudiomodules/api"
import type { MIDIInstant } from "../../MIDI/MIDI"
import type { IBaseAudioPlayerProcessor } from "../BaseAudioPlayerProcessor"


export function getMIDIPlayerProcessor(moduleId:string){

    const { webAudioModules } = globalThis as unknown as AudioWorkletGlobalScope
    const { BaseAudioPlayerProcessor } = webAudioModules.getModuleScope(moduleId)

    
    class MIDIPlayerProcessor extends BaseAudioPlayerProcessor implements IBaseAudioPlayerProcessor {

        instants: MIDIInstant[] | undefined
        instant_duration=1000
        current_channel=0
    
        constructor(options: any){
            super(options)
        }
    
        async _onMessage(e: MessageEvent<any>) { 
            if("instants" in e.data){
                this.instants = e.data.instants
                this.port.postMessage({resolve:"midi"})
            }
            if("instant_duration" in e.data) this.instant_duration=e.data.instant_duration
            await super._onMessage(e)
        }
    
        static ANTI_LATENCY=0
        play(from: number, to: number, msRate: number, inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): void {
            if (!this.instants) return

            const {ANTI_LATENCY}=MIDIPlayerProcessor

            from += ANTI_LATENCY
            to += ANTI_LATENCY

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
                        /*const freq= note.note
                        const velo= note.velocity*100
                        const chan= note.channel
                        const type= note.duration==0 ? 0x90 : 0x80
                        this.emitEvents(
                            { type: 'wam-midi', time: currentTime, data: { bytes: new Uint8Array([type | chan, freq, velo]) } },
                        );*/
                        this.emitEvents(
                            { type: 'wam-midi', time: currentTime+ANTI_LATENCY/1000, data: { bytes: new Uint8Array([0x90 | this.current_channel, note.note, note.velocity*100]) } },
                            { type: 'wam-midi', time: currentTime+ANTI_LATENCY/1000+note.duration/1000, data: { bytes: new Uint8Array([0x90 | this.current_channel, note.note, 0]) } },
                            { type: 'wam-midi', time: currentTime+ANTI_LATENCY/1000+note.duration/1000, data: { bytes: new Uint8Array([0x80 | this.current_channel, note.note, note.velocity*100]) } },
                        );
                    }
                }
            }
        }


        _prepareProcessing(duration: number): boolean{
            if(!this.instants)return false
            const startInstant= Math.max(Math.floor(this.playhead/this.instant_duration), 0)
            const endInstant= Math.min(Math.floor((this.playhead+duration)/this.instant_duration), this.instants.length-1)
            const endTime= this.playhead+duration
            for(let i=startInstant; i<=endInstant; i++){
                const instant= this.instants[i]
                const instant_start= i*this.instant_duration-this.playhead
                for(const {offset,note} of instant){
                    const start= (instant_start+offset)/1000
                    if(start<0 || start>endTime)continue
                    /* MULTI CHANNEL SUPPORT  : Unactivated because of burns instruments not supporting them
                    this.current_channel++
                    if(this.current_channel>=16)this.current_channel=0*/
                    // TODO I add a negative offset to the note end because icannot use channel because some WAM don't work if I do.
                    this.emitEvents(
                        { type: 'wam-midi', time: currentTime+start, data: { bytes: new Uint8Array([0x90 | this.current_channel, note.note, note.velocity*100]) } },
                        { type: 'wam-midi', time: currentTime+start+note.duration/1000-0.0001, data: { bytes: new Uint8Array([0x90 | this.current_channel, note.note, 0]) } },
                        { type: 'wam-midi', time: currentTime+start+note.duration/1000-0.0001, data: { bytes: new Uint8Array([0x80 | this.current_channel, note.note, note.velocity*100]) } },
                    );
                }
            }
            return false
        }

        _connectEvents(...args: any[]){
            super._connectEvents(...args)
        }
    
    }

    
    try{ registerProcessor(moduleId, MIDIPlayerProcessor) } catch(e){}
}