import { audioCtx } from "..";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import TrackElement from "../Components/TrackElement";

export default class Track {

    id: number;
    element: TrackElement
    color: string;

    node: WamAudioWorkletNode;
    gainNode: GainNode;
    pannerNode: PannerNode;

    volume: number = 0.50;
    oldVolume: number = 0.50;

    isMuted: boolean = false;
    isSolo: boolean = false;
    audioBuffer: OperableAudioBuffer | undefined;


    constructor(id: number, element: TrackElement, node: WamAudioWorkletNode) {
        this.id = id;
        this.element = element;
        this.color = "";
        this.node = node;

        this.gainNode = audioCtx.createGain();
        this.gainNode.gain.value = 0.5;
        this.pannerNode = audioCtx.createPanner();
        this.node.connect(this.pannerNode).connect(this.gainNode);
    }

    addBuffer(operableAudioBuffer: OperableAudioBuffer) {
        this.audioBuffer = operableAudioBuffer;
    }

    setVolume(value: number) {
        this.volume = value;
        this.gainNode.gain.value = this.volume;
        console.log(this.gainNode.gain.value);
        
    }

    mute() {
        this.oldVolume = this.volume;
        this.setVolume(0);
    }

    unmute() {
        this.setVolume(this.oldVolume);
    }

    muteSolo() {
        this.setVolume(0);
    }
}