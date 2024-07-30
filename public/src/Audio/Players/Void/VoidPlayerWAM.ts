import BaseAudioPlayerWAM from "../BaseAudioPlayerWAM";
import { default as MIDIPlayerNode, default as VoidPlayerNode } from "./VoidPlayerNode";
import { getVoidPlayerProcessor } from "./VoidPlayerProcessor";


export default abstract class VoidPlayerWAM extends BaseAudioPlayerWAM<MIDIPlayerNode> {

    constructor(groupId: string, audioContext: AudioContext){
        super(
            groupId,
            audioContext,
            (wam:VoidPlayerWAM)=>new VoidPlayerNode(wam),
            getVoidPlayerProcessor
        )
    }

}