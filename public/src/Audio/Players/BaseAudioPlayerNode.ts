import { WamNode, WebAudioModule, addFunctionModule } from "@webaudiomodules/sdk"
import { getBaseAudioPlayerProcessor } from "./BaseAudioPlayerProcessor"


/**
 * Base class for all audio player nodes.
 * With default management of the playhead and isPlaying parameter.
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
            this.waitMap[message.data.resolve]?.()
            delete this.waitMap[message.data.resolve]
        }
    }
    
    /** Is the player playing */
    get isPlaying(){ return this.parameters.get("isPlaying")!.value > 0.5 }

    set isPlaying(value: boolean){ this.parameters.get("isPlaying")!.value = value?1:0 }


    /* The player playhead position in milliseconds. */
    set playhead(value: number){
        console.trace()
        console.log("   => Playhead Move "+this.constructor.name)
        this.port.postMessage({playhead: value})
        this._playhead = value
    }

    get playhead(): number{ return this._playhead }

    private _playhead: number = 0
    
    /**
     * Set the loop start and end in milliseconds
     * @param start in sample
     * @param end in sample
     */
    setLoop(start?:number, end?:number){
        this.port.postMessage({
            loopStart: start ?? -1,
            loopEnd: end  ?? start ?? -1,
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
    postMessageAsync(message: any): Promise<void>{
        this.waitId++
        message.waiting = this.waitId
        const promise=new Promise<void>(resolve=>{ this.waitMap[this.waitId]=resolve })
        this.port.postMessage(message)
        return promise
    }
    private waitMap: {[key:number]:()=>void} = {}
    private waitId=0

}