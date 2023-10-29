import { audioCtx } from "..";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import TrackElement from "../Components/TrackElement";
import Plugin from "./Plugin";
import Automation from "./Automation";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import Region from "./Region";
import { NUM_CHANNELS } from "../Env";
import { RingBuffer } from "../Audio/Utils/ringbuf";

export default class Track {
  /**
   * The unique id of the track.
   */
  public id: number;
  /**
   * The track element associated to the track.
   * @see TrackElement
   */
  public element: TrackElement;
  /**
   * The color of the track in HEX format (#FF00FF). It is used to display the waveform.
   */
  public color: string;
  /**
   * The plugin associated to the track.
   */
  public plugin: Plugin;
  /**
   * The automation associated to the track.
   */
  public automation: Automation;
  /**
   * The regions associated to the track.
   */
  public regions: Region[];
  /**
   * The audio buffer associated to the track.
   */
  public audioBuffer: OperableAudioBuffer | undefined;
  /**
   * The audio node associated to the track.
   */
  public node: WamAudioWorkletNode | undefined;
  /**
   * The gain node associated to the track. It is used to control the volume of the track.
   */
  public gainNode: GainNode;
  /**
   * The panner node associated to the track. It is used to control the balance of the track.
   */
  public pannerNode: StereoPannerNode;
  /**
   * The recorder node associated to the track. It is used to record the track.
   */
  public micRecNode: MediaStreamAudioSourceNode | undefined;
  /**
   * The splitter node associated to the track. It is used to split the track channels according
   * to the selected mode (Stereo, merge, left or right).
   * @see mergerNode
   */
  public splitterNode: ChannelSplitterNode;
  /**
   * The merger node associated to the track. It is used to merge the track channels according
   * to the selected mode (Stereo, merge, left or right).
   * @see splitterNode
   */
  public mergerNode: ChannelMergerNode;
  /**
   * The volume of the track.
   */
  public volume: number;
  /**
   * The old volume of the track. It is used to store the volume before muting the track.
   */
  public oldVolume: number;
  /**
   * The muted state of the track.
   */
  public muted: boolean;
  /**
   * The solo state of the track.
   */
  public solo: boolean;
  /**
   * The armed state of the track. It is used to monitor the sound when recording the track.
   */
  public monitored: boolean;
  /**
   * The modified state of the track. It is used to know if the buffer of the track has been modified.
   * If the buffer has been modified, the buffer must be updated in the audio node.
   * @see updateBuffer
   */
  public modified: boolean;
  /**
   * The armed state of the track. It is used to record the track.
   */
  public armed: boolean;
  /**
   * The worker associated to the track. It is used to record the track.
   */
  public worker: Worker | undefined;
  /**
   * The shared array buffer associated to the track. It is used to record the track.
   * It is used to store the recorded data in AudioWorkletProcessor.
   * @see WamAudioWorkletNode and @see AudioWorkletProcessor
   */
  public sab: SharedArrayBuffer;
  /**
   * The stereo state of the track. It is used to know if the track is stereo or mono.
   */
  public stereo: boolean;
  /**
   * The merge state of the track. It is used to know if the track is merged or not.
   */
  public merge: boolean;
  /**
   * The left state of the track. It is used to know if the track is left or right when recording.
   */
  public left: boolean;
  /**
   * The right state of the track. It is used to know if the track is left or right when recording.
   */
  public right: boolean;
  /**
   * The url of a potential audio file associated to the track.
   */
  public url: string;
  /**
   * The deleted state of the track. It is used to know if the track has been deleted.
   * It is used when downloading the url of the track.
   */
  public deleted: boolean;
  /**
   * Position of the loop start in milliseconds.
   */
  public loopStart: number;
  /**
   * Position of the loop end in milliseconds.
   */
  public loopEnd: number;

  constructor(
    id: number,
    element: TrackElement,
    node: WamAudioWorkletNode | undefined
  ) {
    // Track properties
    this.id = id;
    this.element = element;
    this.color = "";
    this.automation = new Automation();
    this.regions = [];
    this.url = "";

    // Defalut Controls
    this.volume = 0.5;
    this.oldVolume = 0.5;
    this.muted = false;
    this.solo = false;
    this.deleted = false;

    // Stereo and recording controls.
    this.stereo = false;
    this.merge = true;
    this.left = true;
    this.right = false;
    this.armed = false;
    this.monitored = false;

    // Loop controls.
    this.loopStart = 0;
    this.loopEnd = 0;

    // Nodes creation and connection.
    this.node = node;
    this.gainNode = audioCtx.createGain();
    this.gainNode.gain.value = 0.5;
    this.pannerNode = audioCtx.createStereoPanner();

    this.micRecNode = undefined;
    this.splitterNode = audioCtx.createChannelSplitter(NUM_CHANNELS);
    this.mergerNode = audioCtx.createChannelMerger(NUM_CHANNELS);

    // Audio Buffers
    this.audioBuffer = undefined;
    this.modified = true;
    if (this.node) {
      this.node!.connect(this.pannerNode).connect(this.gainNode);
      this.sab = RingBuffer.getStorageForCapacity(
        audioCtx.sampleRate * 2,
        Float32Array
      );
      this.node!.port.postMessage({ sab: this.sab });
    }
  }

  /**
   * Sets the audio Buffer to the track.
   * @param operableAudioBuffer - The audio buffer to set.
   */
  public setAudioBuffer(operableAudioBuffer: OperableAudioBuffer): void {
    this.audioBuffer = operableAudioBuffer;
  }

  /**
   * Sets the volume of the track.
   * @param value - The volume to set.
   */
  public setVolume(value: number): void {
    this.volume = value;
    this.gainNode.gain.value = this.volume;
  }

  /**
   * Mutes the track.
   */
  public mute(): void {
    this.oldVolume = this.volume;
    this.setVolume(0);
  }

  /**
   * Unmutes the track.
   */
  public unmute(): void {
    this.setVolume(this.oldVolume);
  }

  /**
   * Solo the track.
   */
  public muteSolo(): void {
    this.setVolume(0);
  }

  /**
   * Changes the balance of the track of the panner node with a value between -1 and 1.
   * @param value - The balance to set.
   */
  public setBalance(value: number): void {
    this.pannerNode.pan.value = value;
  }

  /**
   * Adds a region to the regions list.
   *
   * @param region - The region to add.
   */
  public addRegion(region: Region): void {
    this.regions.push(region);
  }

  /**
   * Gets the region according to its id.
   * @param regionId - The id of the region.
   * @return {Region | undefined} - The region if it exists, undefined otherwise.
   */
  public getRegionById(regionId: number): Region | undefined {
    return this.regions.find((region) => region.id === regionId);
  }

  /**
   * Removes a region from the regions list according to its id.
   * @param regionId - The id of the region to remove.
   */
  public removeRegionById(regionId: number): void {
    this.regions = this.regions.filter((region) => region.id !== regionId);
  }

  /**
   * Sets the start and end of the loop.
   *
   * @param leftTime - Start of the loop in milliseconds.
   * @param rightTime - End of the loop in milliseconds.
   */
  public updateLoopTime(leftTime: number, rightTime: number): void {
    this.loopStart = leftTime;
    this.loopEnd = rightTime;
    const startBuffer = Math.floor(
      (this.loopStart / 1000) * audioCtx.sampleRate
    );
    const endBuffer = Math.floor((this.loopEnd / 1000) * audioCtx.sampleRate);
    if (this.node) {
      this.node.port.postMessage({
        loop: true,
        loopStart: startBuffer,
        loopEnd: endBuffer,
      });
    }
  }

  /**
   * Updates the buffer of the track according to the regions list.
   * @param context - The audio context.
   * @param playhead - The playhead position in buffer samples.
   */
  public updateBuffer(context: AudioContext, playhead: number): void {
    this.modified = false;
    if (this.regions.length === 0) {
      // No regions in the track
      this.audioBuffer = undefined;
      this.node?.setAudio([new Float32Array()]);
      return;
    }

    let sampleRate = context.sampleRate;
    let opBuffer: OperableAudioBuffer | undefined = undefined;

    this.regions = this.regions.sort((a, b) => a.start - b.start);

    let currentTime = 0; // in milliseconds
    for (let i = 0; i < this.regions.length; i++) {
      // For each region in the track buffer regions list, concat the buffer
      let region = this.regions[i];
      let start = region.start; // in milliseconds
      let duration = region.duration * 1000; // in milliseconds

      if (start > currentTime) {
        // No buffer until the current time, create an empty buffer and concat it to the buffer.
        const delta = start - currentTime;
        console.log("delta", delta)
        if (delta > 0.1) {
          let emptyBuffer = context.createBuffer(
            NUM_CHANNELS,
            ((start - currentTime) * sampleRate) / 1000,
            sampleRate
          );
          console.log("after createBuffer");
          let emptyOpBuffer = Object.setPrototypeOf(
            emptyBuffer,
            OperableAudioBuffer.prototype
          ) as OperableAudioBuffer;
          if (opBuffer == undefined) {
            // First empty buffer
            opBuffer = emptyOpBuffer;
          } else {
            opBuffer = opBuffer.concat(emptyOpBuffer);
          }
        }
        currentTime = start;
      }
      if (start === currentTime) {
        // Buffer is at the current time, concat the buffer to the current buffer.
        if (opBuffer == undefined) {
          // It is the first buffer of the track if opBuffer is undefined
          opBuffer = region.buffer;
        } else {
          opBuffer = opBuffer.concat(region.buffer);
        }
        currentTime += duration;
      } else if (start < currentTime) {
        // Overlap of the buffer with the last one, mix the overlap and concat the buffer to the current buffer.
        let overlap = currentTime - start;

        // slice the overlap of the last buffer and the current one
        let overlapSample = Math.floor((overlap * sampleRate) / 1000);
        let buffers = opBuffer!.split(opBuffer!.length - overlapSample);
        let buffers2 = region.buffer.split(overlapSample);

        opBuffer = buffers[0]!;
        let currentBuffer = buffers2[1];

        let lastOverlapBuffer = buffers[1];
        let currentOverlapBuffer = buffers2[0];

        // mix the overlap of the last buffer and the current one
        if (lastOverlapBuffer !== null) {
          // If there is an overlap, mix the overlap
          lastOverlapBuffer = OperableAudioBuffer.mix(
            lastOverlapBuffer,
            currentOverlapBuffer!
          );
        } else {
          // If there is no overlap, the overlap is the current buffer
          lastOverlapBuffer = currentOverlapBuffer!;
        }

        opBuffer = opBuffer.concat(lastOverlapBuffer);
        if (currentBuffer !== null) {
          // If there is a buffer after the overlap, concat it to the current buffer
          opBuffer = opBuffer.concat(currentBuffer);
        }
        currentTime = start + duration;
      }
    }
    this.audioBuffer = opBuffer;
    this.node?.setAudio(this.audioBuffer!.toArray());
    this.node?.port.postMessage({ playhead: playhead });
  }
}
