import { audioCtx } from "..";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import TrackElement from "../Views/Components/TrackElement";
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

    /**
     * Add an audio buffer to the track.
     * @param operableAudioBuffer
     */
    addBuffer(operableAudioBuffer: OperableAudioBuffer) {
        this.audioBuffer = operableAudioBuffer;
    }

    /**
     * Set the volume of the track.
     * @param value
     */
    setVolume(value: number) {
        this.volume = value;
        this.gainNode.gain.value = this.volume;
    }

    /**
     * Mute the track.
     */
    mute() {
        this.oldVolume = this.volume;
        this.setVolume(0);
    }

    /**
     * Unmute the track.
     */
    unmute() {
        this.setVolume(this.oldVolume);
    }

    /**
     * Solo the track.
     */
    muteSolo() {
        this.setVolume(0);
    }

    /**
     * Change the balance of the track of the panner node with a value between -1 and 1.
     * @param value
     */
    setBalance(value: number) {
        this.pannerNode.pan.value = value;
    }
}