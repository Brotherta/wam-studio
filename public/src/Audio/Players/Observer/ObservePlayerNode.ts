
import { WebAudioModule } from "@webaudiomodules/sdk"
import BaseAudioPlayerNode from "../BaseAudioPlayerNode"

/**
 * A player playing nothing, but that call registred observers when its playhead is moved with many informations.
 * It just update its playhead depending on the start, stop, and its loop state.
 * @author Samuel DEMONT
 */
export default class ObservePlayerNode extends BaseAudioPlayerNode{

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
        this.on_update.forEach(it=>it(value))
    }
    override get playhead(): number {
        return super.playhead
    }

    
}