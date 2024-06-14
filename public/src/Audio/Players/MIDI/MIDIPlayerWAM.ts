import BaseAudioPlayerWAModule from "../BaseAudioPlayerWAModule";
import MIDIPlayerNode from "./MIDIPlayerNode";
import { getMIDIPlayerProcessor } from "./MIDIPlayerProcessor";


export default abstract class MIDIPlayerWAM extends BaseAudioPlayerWAModule<MIDIPlayerNode> {

    constructor(groupId: string, audioContext: AudioContext){
        super(
            groupId,
            audioContext,
            (wam:MIDIPlayerWAM)=>new MIDIPlayerNode(wam),
            getMIDIPlayerProcessor
        )
    }

}