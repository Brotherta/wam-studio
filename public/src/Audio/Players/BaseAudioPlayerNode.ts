import { WamNode, WebAudioModule, addFunctionModule } from "@webaudiomodules/sdk"
import { getBaseAudioPlayerProcessor } from "./BaseAudioPlayerProcessor"


/**
 * Base class for all audio player nodes.
 * With default management of the playhead and isPlaying parameter.
 */
export default class BaseAudioPlayerNode extends WamNode{

    constructor(module: WebAudioModule<BaseAudioPlayerNode>, options: AudioWorkletNodeOptions){
        super(module,options)
        this.port.onmessage = this.onmessage.bind(this)
    }

    private onmessage(event:MessageEvent<any>){
        if(event.data.playhead){
            this._playhead = event.data.playhead
        }
    }
    
    /** Is the player playing */
    get isPlaying(){ return this.parameters.get("isPlaying")!.value > 0.5 }

    set isPlaying(value: boolean){ this.parameters.get("isPlaying")!.value = value?1:0 }


    /* The player playhead position in milliseconds. */
    set playhead(value: number){
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

}