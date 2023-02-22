import { audioCtx } from "..";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import TrackElement from "../Components/TrackElement";
import Plugin from "./Plugin";
import Automations from "./Automations";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import Region from "./Region";
import {NUM_CHANNELS, SAMPLE_RATE} from "../Utils";

export default class Track {

    id: number;
    element: TrackElement
    color: string;

    node: WamAudioWorkletNode | undefined;
    gainNode: GainNode;
    pannerNode: StereoPannerNode;

    volume: number = 0.50;
    oldVolume: number = 0.50;

    isMuted: boolean = false;
    isSolo: boolean = false;
    audioBuffer: OperableAudioBuffer | undefined;
    plugin: Plugin;

    automations: Automations;
    removed: boolean

    regions: Region[];
    modified: boolean;

    constructor(id: number, element: TrackElement, node: WamAudioWorkletNode | undefined) {
        this.id = id;
        this.element = element;
        this.color = "";
        this.node = node;
        this.removed = false;
        this.automations = new Automations();
        this.regions = [];
        this.modified = true;

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

    /**
     * Add a region to the regions list.
     *
     * @param region
     */
    addRegion(region: Region) {
        this.regions.push(region);
    }

    /**
     * Get the region according to its id.
     * @param regionId
     */
    getRegion(regionId: number) {
        return this.regions.find(region => region.id === regionId);
    }

    /**
     * Remove a region from the regions list according to its id.
     * @param regionId
     */
    removeRegion(regionId: number) {
        this.regions = this.regions.filter(region => region.id !== regionId);
    }

    updateBuffer(context: AudioContext, playhead: number) {
        console.log("Updating buffer... of track " + this.id)
        this.modified = false;
        if (this.regions.length === 0) {
            this.audioBuffer = undefined;
            this.node?.setAudio([new Float32Array()]);
            return;
        }

        let opBuffer: OperableAudioBuffer | undefined = undefined;

        this.regions = this.regions.sort((a, b) => a.start - b.start);

        let currentTime = 0; // in milliseconds
        for (let i = 0; i < this.regions.length; i++) {
            let region = this.regions[i];
            let start = region.start; // in milliseconds
            let duration = region.duration * 1000; // in milliseconds

            if (start > currentTime) {
                console.log("Empty buffer: " + (start - currentTime) + "ms");

                let emptyBuffer = context.createBuffer(NUM_CHANNELS, (start - currentTime) * SAMPLE_RATE / 1000, SAMPLE_RATE);
                let emptyOpBuffer = Object.setPrototypeOf(emptyBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;
                if (opBuffer == undefined) {
                    opBuffer = emptyOpBuffer;
                }
                else {
                    opBuffer = opBuffer.concat(emptyOpBuffer);
                }
                currentTime = start;
            }
            if (start === currentTime) {
                console.log("Region buffer: " + duration + "ms");
                if (opBuffer == undefined) {
                    opBuffer = region.buffer;
                }
                else {
                    opBuffer = opBuffer.concat(region.buffer);
                }
                currentTime += duration;
            }
        }
        this.audioBuffer = opBuffer;
        this.node?.setAudio(this.audioBuffer!.toArray());
        this.node?.port.postMessage({playhead: playhead});
    }
}