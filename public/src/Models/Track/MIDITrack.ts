import MIDIAudioNode from "../../Audio/MIDI/MIDIAudioNode";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import WamAudioWorkletNode from "../../Audio/WAM/WamAudioWorkletNode.js";
import TrackElement from "../../Components/TrackElement.js";
import { NUM_CHANNELS } from "../../Env";
import { audioCtx } from "../../index";
import MIDIRegion from "../Region/MIDIRegion";
import TrackOf from "./Track";

export default class MIDITrack extends TrackOf<MIDIRegion> {

  /** The audio node associated to the track. */
  public node: MIDIAudioNode;
  
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


  constructor(element: TrackElement) {
    super(element)
    this.url = "";

    // Nodes creation and connection.
    audioCtx.audioWorklet.addModule(new URL("../../Audio/MIDI/MIDIAudioProcessor", import.meta.url))
    this.node = new MIDIAudioNode(audioCtx, {});
    this.micRecNode = undefined;
    this.splitterNode = audioCtx.createChannelSplitter(NUM_CHANNELS);
    this.mergerNode = audioCtx.createChannelMerger(NUM_CHANNELS);

    // Audio Buffers
    this.audioBuffer = undefined;
    this.modified = true;

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
    for(const region of this.regions){
      this.node.midi=region.midi
      break
    }
  }

  protected override _connectPlugin(node: AudioNode): void {
    this.node?.connect(node!)
  }

  protected override _disconnectPlugin(node: AudioNode): void {
    this.node?.disconnect(node)
  }

  public override play(){
    this.node.isPlaying = true
  }

  public override pause(){
    this.node.isPlaying = false
  }

  public override loop(value:boolean): void{
    //this.node?.loop(value)
  }
}
