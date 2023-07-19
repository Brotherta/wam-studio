import { audioCtx } from "../index";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import TrackElement from "../Components/TrackElement";
import Plugin from "./Plugin";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import {RingBuffer} from "../Audio/Utils/ringbuf";
import {SongTagEnum} from "../Utils/SongTagEnum";
import BindControl from "./BindControl";
import BindSliderElement from "../Components/Binds/BindSliderElement";

export default class Track {

    id: number;
    element: TrackElement
    color: string;

    node: WamAudioWorkletNode | undefined;
    gainNode: GainNode;
    pannerNode: StereoPannerNode;

    volume: number = 1;
    oldVolume: number = 1;

    isMuted: boolean = false;
    isSolo: boolean = false;
    audioBuffer: OperableAudioBuffer | undefined;
    plugin: Plugin;

    removed: boolean

    worker: Worker | undefined;
    sab: SharedArrayBuffer;

    bindControl: BindControl;
    url: string;
    tag: SongTagEnum;

    isDeleted: boolean = false;
    volumeSlider: BindSliderElement;

    splitting: boolean;
    splitChannel: string;

    constructor(id: number, element: TrackElement, node: WamAudioWorkletNode | undefined) {
        this.id = id;
        this.element = element;
        this.color = "";
        this.node = node;
        this.removed = false;
        this.tag = SongTagEnum.OTHER;
        this.splitting = false;
        this.splitChannel = "L";

        this.gainNode = audioCtx.createGain();
        this.gainNode.gain.value = 1;
        this.pannerNode = audioCtx.createStereoPanner();
        if (this.node !== undefined) {
            this.node.connect(this.pannerNode).connect(this.gainNode);
            this.sab = RingBuffer.getStorageForCapacity(audioCtx.sampleRate * 2, Float32Array);
            this.node.port.postMessage({"sab": this.sab});
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