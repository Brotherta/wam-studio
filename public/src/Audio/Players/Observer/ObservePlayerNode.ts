
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

    override _onMessage(message: MessageEvent<any>): void {
        super._onMessage(message)
        if(message.data.playhead){
            this.on_update.forEach(it=>it(message.data.playhead))
        }
    }

    override set playhead(value: number) {
        super.playhead = value
    }
    override get playhead(): number {
        return super.playhead
    }

    
}