import BaseAudioPlayerWAM from "../BaseAudioPlayerWAM";
import SamplePlayerNode from "./SamplePlayerNode";
import { getSamplePlayerProcessor } from "./SamplePlayerProcessor";


export default abstract class SamplePlayerWAM extends BaseAudioPlayerWAM<SamplePlayerNode> {

    constructor(groupId: string, audioContext: AudioContext){
        super(
            groupId,
            audioContext,
            (wam:SamplePlayerWAM)=>new SamplePlayerNode(wam),
            getSamplePlayerProcessor
        )
    }

}