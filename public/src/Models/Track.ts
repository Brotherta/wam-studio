import { audioCtx } from "..";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import TrackElement from "../Components/TrackElement";
import Plugin from "./Plugin";
import Automation from "./Automation";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import Region from "./Region";
import {NUM_CHANNELS} from "../Utils/Variables";
import {RingBuffer} from "../Audio/Utils/ringbuf";

export default class Track {

    id: number;
    element: TrackElement
    color: string;

    node: WamAudioWorkletNode | undefined;
    gainNode: GainNode;
    pannerNode: StereoPannerNode;

    micRecNode: MediaStreamAudioSourceNode | undefined;

    splitterNode: ChannelSplitterNode;
    mergerNode: ChannelMergerNode;

    volume: number = 0.50;
    oldVolume: number = 0.50;

    muted: boolean = false;
    solo: boolean = false;
    monitored: boolean = false;

    audioBuffer: OperableAudioBuffer | undefined;
    plugin: Plugin;

    automation: Automation;
    removed: boolean

    regions: Region[];
    modified: boolean;

    armed: boolean = false;
    worker: Worker | undefined;
    sab: SharedArrayBuffer;

    stereo: boolean = false;
    merge: boolean = true;
    left: boolean = true;
    right: boolean = false;

    url: string = "";
    isDeleted: boolean = false;

    constructor(id: number, element: TrackElement, node: WamAudioWorkletNode | undefined) {
        this.id = id;
        this.element = element;
        this.color = "";
        this.node = node;
        this.removed = false;
        this.automation = new Automation();
        this.regions = [];
        this.modified = true;

        this.gainNode = audioCtx.createGain();
        this.gainNode.gain.value = 0.5;
        this.pannerNode = audioCtx.createStereoPanner();

        this.splitterNode = audioCtx.createChannelSplitter(NUM_CHANNELS);
        this.mergerNode = audioCtx.createChannelMerger(NUM_CHANNELS);

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
        this.modified = false;
        if (this.regions.length === 0) {
            this.audioBuffer = undefined;
            this.node?.setAudio([new Float32Array()]);
            return;
        }

        let sampleRate = context.sampleRate;
        let opBuffer: OperableAudioBuffer | undefined = undefined;

        this.regions = this.regions.sort((a, b) => a.start - b.start);

        let currentTime = 0; // in milliseconds
        for (let i = 0; i < this.regions.length; i++) {
            let region = this.regions[i];
            let start = region.start; // in milliseconds
            let duration = region.duration * 1000; // in milliseconds

            if (start > currentTime) { // No buffer until the current time

                let emptyBuffer = context.createBuffer(NUM_CHANNELS, (start - currentTime) * sampleRate / 1000, sampleRate);
                let emptyOpBuffer = Object.setPrototypeOf(emptyBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;
                if (opBuffer == undefined) { // First empty buffer
                    opBuffer = emptyOpBuffer;
                }
                else {
                    opBuffer = opBuffer.concat(emptyOpBuffer);
                }
                currentTime = start;
            }
            if (start === currentTime) { // Buffer is at the current time
                if (opBuffer == undefined) { // First buffer
                    opBuffer = region.buffer;
                }
                else {
                    opBuffer = opBuffer.concat(region.buffer);
                }
                currentTime += duration;
            }
            else if (start < currentTime) { // Overlap of the buffer with the last one
                let overlap = currentTime - start;

                // slice the overlap of the last buffer and the current one
                let overlapSample = Math.floor(overlap * sampleRate / 1000);
                let buffers = opBuffer!.split(opBuffer!.length - overlapSample);
                let buffers2 = region.buffer.split(overlapSample);

                opBuffer = buffers[0]!;
                let currentBuffer = buffers2[1];

                let lastOverlapBuffer = buffers[1];
                let currentOverlapBuffer = buffers2[0];

                // mix the overlap of the last buffer and the current one
                if (lastOverlapBuffer !== null) {
                    lastOverlapBuffer = OperableAudioBuffer.mix(lastOverlapBuffer, currentOverlapBuffer!);
                }
                else {
                    lastOverlapBuffer = currentOverlapBuffer!;
                }

                opBuffer = opBuffer.concat(lastOverlapBuffer);
                if (currentBuffer !== null) {
                    opBuffer = opBuffer.concat(currentBuffer);
                }
                currentTime = start + duration;
            }
        }
        this.audioBuffer = opBuffer;
        this.node?.setAudio(this.audioBuffer!.toArray());
        this.node?.port.postMessage({playhead: playhead});
    }
}