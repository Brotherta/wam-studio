import BaseAudioPlayerWAM from "../BaseAudioPlayerWAM";
import MIDIPlayerNode from "./MIDIPlayerNode";
import { getMIDIPlayerProcessor } from "./MIDIPlayerProcessor";


export default abstract class MIDIPlayerWAM extends BaseAudioPlayerWAM<MIDIPlayerNode> {

    constructor(groupId: string, audioContext: AudioContext){
        super(
            groupId,
            audioContext,
            (wam:MIDIPlayerWAM)=>new MIDIPlayerNode(wam),
            getMIDIPlayerProcessor
        )
    }

}