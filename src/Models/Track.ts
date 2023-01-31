import { audioCtx } from "..";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import TrackElement from "../Components/TrackElement";
import AudioPlugin from "./AudioPlugin";

export default class Track {

    id: number;
    element: TrackElement
    color: string;

    node: any;
    gainNode: GainNode;
    pannerNode: StereoPannerNode;

    volume: number = 0.50;
    oldVolume: number = 0.50;

    isMuted: boolean = false;
    isSolo: boolean = false;
    audioBuffer: OperableAudioBuffer | undefined;
    plugin: AudioPlugin;

    removed: boolean

    constructor(id: number, element: TrackElement, node: any) {
        this.id = id;
        this.element = element;
        this.color = "";
        this.node = node;
        this.removed = false;

        this.gainNode = audioCtx.createGain();
        this.gainNode.gain.value = 0.5;
        this.pannerNode = audioCtx.createStereoPanner();
        if (this.node !== undefined) {
            this.node.connect(this.pannerNode).connect(this.gainNode);
        }
    }

    addBuffer(operableAudioBuffer: OperableAudioBuffer) {
        this.audioBuffer = operableAudioBuffer;
    }

    setVolume(value: number) {
        this.volume = value;
        this.gainNode.gain.value = this.volume;
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

    setBalance(value: number) {
        this.pannerNode.pan.value = value;
    }
}