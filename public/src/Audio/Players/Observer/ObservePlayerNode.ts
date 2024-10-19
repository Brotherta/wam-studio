
import { WebAudioModule } from "@webaudiomodules/sdk"
import BaseAudioPlayerNode from "../BaseAudioPlayerNode"

/**
 * A player playing nothing, but that call registred observers when its playhead is moved with many informations.
 * It just update its playhead depending on the start, stop, and its loop state.
 * @author Samuel DEMONT
 */
export default class ObservePlayerNode extends BaseAudioPlayerNode{

    /** Called when the player move the playhead. Not called when the playhead is moved using the setter! */
    readonly on_update = new Set<(playhead: number)=>void>()

    constructor(module: WebAudioModule<ObservePlayerNode>){
        super(module,{
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [2]
        })
    }

    override get isPlaying(){ return super.isPlaying }

    override set isPlaying(value: boolean){
        if(!super.isPlaying && value && !this.timeout){
            const player= this
            this.timeout = setTimeout(function fn(){
                player.on_update.forEach(it=>it(player.playhead))
                if(player.isPlaying) player.timeout=setTimeout(fn)
                else player.timeout=undefined
            })
        }
        super.isPlaying = value
    }
    private timeout!: any

    
}