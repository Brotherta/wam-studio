import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import { RingBuffer } from "../../Audio/Utils/Ringbuffer";
import WamAudioWorkletNode from "../../Audio/WAM/WamAudioWorkletNode.js";
import TrackElement from "../../Components/TrackElement.js";
import { NUM_CHANNELS } from "../../Env";
import { audioCtx } from "../../index";
import SampleRegion from "../Region/SampleRegion";
import TrackOf from "./Track";

export default class SampleTrack extends TrackOf<SampleRegion> {

  /** The audio node associated to the track. */
  public node: WamAudioWorkletNode | undefined;
  
  /** The recorder node associated to the track. It is used to record the track. */
  public micRecNode: MediaStreamAudioSourceNode | undefined;
  
  /** The audio buffer associated to the track. */
  public audioBuffer: OperableAudioBuffer | undefined;

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
 * The worker associated to the track. It is used to record the track.
 */
  public worker: Worker | undefined;

  /**
   * The url of a potential audio file associated to the track.
   */
  public url: string;

  /**
   * The shared array buffer associated to the track. It is used to record the track.
   * It is used to store the recorded data in AudioWorkletProcessor.
   * @see WamAudioWorkletNode and @see AudioWorkletProcessor
   */
  public sab: SharedArrayBuffer;


  constructor(id: number, element: TrackElement, node?: WamAudioWorkletNode) {
    super(id,element)
    this.url = "";

    // Nodes creation and connection.
    this.node = node;
    this.micRecNode = undefined;
    this.splitterNode = audioCtx.createChannelSplitter(NUM_CHANNELS);
    this.mergerNode = audioCtx.createChannelMerger(NUM_CHANNELS);

    // Audio Buffers
    this.audioBuffer = undefined;
    this.modified = true;
    if (this.node) {
      this.sab = RingBuffer.getStorageForCapacity(audioCtx.sampleRate * 2,Float32Array);
      this.node!.port.postMessage({ sab: this.sab });
    }

    this.postInit()
  }
  
  /**
   * Sets the audio Buffer to the track.
   * @param operableAudioBuffer - The audio buffer to set.
   */
  public setAudioBuffer(operableAudioBuffer: OperableAudioBuffer): void {
    this.audioBuffer = operableAudioBuffer;
  }

  public override _onLoopChange(loopStart: number, loopEnd: number): void {
    const startBuffer = Math.floor(
      (loopStart / 1000) * audioCtx.sampleRate
    );
    const endBuffer = Math.floor((loopEnd / 1000) * audioCtx.sampleRate);
    if (this.node) {
      this.node.port.postMessage({
        loop: true,
        loopStart: startBuffer,
        loopEnd: endBuffer,
      });
    }
  }

  public override update(context: AudioContext, playhead: number): void {
    console.debug("update track");
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
      let duration = region.duration; // in milliseconds

      if (start > currentTime) {
        // No buffer until the current time, create an empty buffer and concat it to the buffer.
        const delta = start - currentTime;
        //console.log("delta", delta)
        // MB : create new region only if there is a minimal ammount between two consecutive regions
        // otherwise createBuffer will fail.
        if (delta > 0.03) { 
          let emptyBuffer = context.createBuffer(
            NUM_CHANNELS,
            ((start - currentTime) * sampleRate) / 1000,
            sampleRate
          );
          //console.log("after createBuffer");
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

    console.debug(this.audioBuffer?.length)
  }

  protected override _connectPlugin(node: AudioNode): void {
    this.node?.connect(node!)
  }

  protected override _disconnectPlugin(node: AudioNode): void {
    this.node?.disconnect(node)
  }

  public override play(){
    this.node?.play()
  }

  public override pause(){
    this.node?.pause()
  }

  public override loop(value:boolean): void{
    this.node?.loop(value)
  }
}
