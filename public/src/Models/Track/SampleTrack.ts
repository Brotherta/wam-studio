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
  private splitterNode: ChannelSplitterNode
  /**
   * The merger node associated to the track. It is used to merge the track channels according
   * to the selected mode (Stereo, merge, left or right).
   * @see splitterNode
   */
  private mergerNode: ChannelMergerNode

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


  constructor(element: TrackElement, node?: WamAudioWorkletNode) {
    super(element)
    this.url = ""

    // Recording nodes
    this.node = node
    this.micRecNode = undefined
    this.splitterNode = audioCtx.createChannelSplitter(NUM_CHANNELS)
    this.mergerNode = audioCtx.createChannelMerger(NUM_CHANNELS)

    // Audio Buffers
    this.audioBuffer = undefined
    this.modified = true
    if (this.node) {
      this.sab = RingBuffer.getStorageForCapacity(audioCtx.sampleRate * 2,Float32Array);
      this.node!.port.postMessage({ sab: this.sab });
    }

    // Initialize the track
    this.left=true
    this.right=true
    this.isMerged=false
    this.isStereo=true

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
    // Merge the buffer of all regions into a single big buffer
    
    // Get big buffer informations and create it
    let max_length=0
    let max_channel=0
    for(const region of this.regions){
      const end= region.start * audioCtx.sampleRate/1000 + region.buffer.length
      if(end>max_length)max_length=end
      if(region.buffer.numberOfChannels>max_channel)max_channel=region.buffer.numberOfChannels
    }

    const big_buffer = (()=>{
      if(max_length==0 || max_channel==0){
        // Default buffer if there is no region
        return OperableAudioBuffer.create({numberOfChannels:2, length:1, sampleRate:context.sampleRate})
      }
      else{
        // Merge everything
        let big_buffer = OperableAudioBuffer.create({numberOfChannels:max_channel, length:max_length, sampleRate:context.sampleRate})
        for(const region of this.regions){
          big_buffer = big_buffer.merge(region.buffer, region.start*audioCtx.sampleRate/1000)
        }
        return big_buffer
      }
    })()
    
    // Set the buffer
    this.audioBuffer = big_buffer;
    this.node?.setAudio(this.audioBuffer!.toArray())
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


  /** RECORDING INFORMATIONS */
  
  private linkNodes(){
    try{
      this.splitterNode.disconnect(this.mergerNode)
    }catch(e){}
    
    if(this.isStereo){
      if(this.isMerged){
        this.splitterNode.connect(this.mergerNode,0,0)
        this.splitterNode.connect(this.mergerNode,1,0)
        this.splitterNode.connect(this.mergerNode,0,1)
        this.splitterNode.connect(this.mergerNode,1,1)
      }
      else{
        this.splitterNode.connect(this.mergerNode,0,0)
        this.splitterNode.connect(this.mergerNode,1,1)
      }
    }
    else{
      if(this.isMerged){
        this.splitterNode.connect(this.mergerNode,0,0)
        this.splitterNode.connect(this.mergerNode,0,1)
      }
      else{
        if(this.left){
          this.splitterNode.connect(this.mergerNode,0,0)
          this.splitterNode.connect(this.mergerNode,0,1)
        }
        if(this.right){
          this.splitterNode.connect(this.mergerNode,1,0)
          this.splitterNode.connect(this.mergerNode,1,1)
        }
      
      }
    }
  }

  /**
   * The stereo state of the track. It is used to know if the track is stereo or mono.
   */
  set isStereo(value: boolean){
    this._stereo=value
    this.element.setMode(value)
    this.linkNodes()
  }

  get isStereo(){ return this._stereo }

  private _stereo: boolean = true

  /**
   * The merge state of the track. It is used to know if the track is merged or not.
   */
  set isMerged(value: boolean){
    this._merge=value
    this.element.setMerge(value)
    this.linkNodes()
  }

  get isMerged(){ return this._merge }

  private _merge: boolean = true

  /**
   * The left state of the track. It is used to know if the track is left or right when recording.
   */
  set left(value: boolean){
    this._left=value
    this.element.setLeft(value)
    this.linkNodes()
  }

  get left(){ return this._left }

  private _left: boolean = true
  
  /**
   * The right state of the track. It is used to know if the track is left or right when recording.
   */
  set right(value: boolean){
    this._right=value
    this.element.setRight(value)
    this.linkNodes()
  }

  get right(){ return this._right }

  private _right: boolean = false

  /**
   * The recording input node of the track. Microphone is connected to this node when recording.
   */
  get recordingInputNode(){ return this.splitterNode }

  /**
   * The recording output node of the track. It is used to record the track. Its output is what
   * is recorded.
   */
  get recordingOutputNode(){ return this.mergerNode }
}
