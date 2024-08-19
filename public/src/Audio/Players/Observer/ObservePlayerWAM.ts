import BaseAudioPlayerWAM from "../BaseAudioPlayerWAM";
import ObservePlayerNode, { default as MIDIPlayerNode } from "./ObservePlayerNode";
import { getObservePlayerProcessor } from "./ObservePlayerProcessor";


export default abstract class ObservePlayerWAM extends BaseAudioPlayerWAM<MIDIPlayerNode> {

    constructor(groupId: string, audioContext: AudioContext){
        super(
            groupId,
            audioContext,
            (wam:ObservePlayerWAM)=>new ObservePlayerNode(wam),
            getObservePlayerProcessor
        )
    }

}