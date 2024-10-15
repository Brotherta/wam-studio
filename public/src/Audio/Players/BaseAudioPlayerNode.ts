import { WamNode, WebAudioModule, addFunctionModule } from "@webaudiomodules/sdk"
import { getBaseAudioPlayerProcessor } from "./BaseAudioPlayerProcessor"


/**
 * Base class for all audio player nodes.
 * With default management of the playhead and isPlaying parameter.
 * @author Samuel DEMONT
 */
export default class BaseAudioPlayerNode extends WamNode{

    constructor(module: WebAudioModule<BaseAudioPlayerNode>, options: AudioWorkletNodeOptions){
        super(module,options)
    }

    override _onMessage(message: MessageEvent<any>): void {
        super._onMessage(message)
        if(message.data.playhead){
            this._playhead = message.data.playhead
        }
        if(message.data.resolve){
            this.waitMap[message.data.resolve]?.(message.data.payload)
            delete this.waitMap[message.data.resolve]
        }
    }
    
    /** Is the player playing */
    get isPlaying(){ return this.parameters.get("isPlaying")!.value > 0.5 }

    set isPlaying(value: boolean){ this.parameters.get("isPlaying")!.value = value?1:0 }

    /**
     * Start playing the audio content with the playhead at the start position and for the duration.
     * @param start Start position in milliseconds
     * @param duration Duration in milliseconds
     */
    async playEfficiently(start: number, duration: number){
        await this.postMessageAsync({playhead: start})
        const response=await this.postMessageAsync({playEfficiently: duration})
        if(response)this.isPlaying=true
    }

    /* The player playhead position in milliseconds. */
    set playhead(value: number){
        this.port.postMessage({playhead: value})
        this._playhead = value

        //console.log("Track.ts set playhead = " + value);
    }

    get playhead(): number{ 
        return this._playhead 
    }

    private _playhead: number = 0
    
    /**
     * Set the loop start and end in milliseconds
     * @param start in sample
     * @param end in sample
     */
    setLoop(range: [number,number]|null): void{
        this.port.postMessage({
            loopStart: range?.[0] ?? -1,
            loopEnd: range?.[1] ?? -1,
        });
    }

    static override async addModules(audioContext: BaseAudioContext, moduleId: string){
        await super.addModules(audioContext, moduleId)
        await addFunctionModule(audioContext.audioWorklet, getBaseAudioPlayerProcessor, moduleId)
    }

    /**
     * Post a message and return a promise that will be resolved when after the message is treated
     * @param message 
     */
    postMessageAsync(message: any): Promise<any>{
        this.waitId++
        message.waiting = this.waitId
        const promise=new Promise<any>(resolve=>{ this.waitMap[this.waitId]=resolve })
        this.port.postMessage(message)
        return promise
    }
    private waitMap: {[key:number]:(payload:any)=>void} = {}
    private waitId=0

}