import { audioCtx } from "../../index";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import TrackElement from "../../Components/TrackElement.js";
import Plugin from "../Plugin.js";
import Automation from "../Automation";
import WamAudioWorkletNode from "../../Audio/WAM/WamAudioWorkletNode.js";
import RegionOf, { Region } from "../Region/Region.js";
import { NUM_CHANNELS } from "../../Env";
import { RingBuffer } from "../../Audio/Utils/ringbuf.js";
import SampleRegion from "../Region/SampleRegion";

export type TrackRegionType<Type> = Type extends TrackOf<infer X> ? X : never

export type Track=TrackOf<Region>

export default abstract class TrackOf<REGION extends RegionOf<REGION>> {

  // Output Node
  /** 
   * The gain node associated to the track. It is used to control the volume of the track and is the outputNode of the track.
   * pannerNode -> gainNode
   **/
  private gainNode: GainNode;

  /** 
   * The panner node associated to the track. It is used to control the balance of the track.
   * pannerNode -> gainNode
   **/
  private pannerNode: StereoPannerNode;

  /**
   * The monitored output node. It output the sound of the track only when it is monitored.
   */
  private monitoredNode: GainNode;

  /** The unique id of the track. */
  public id: number;

  /** The track element associated to the track. */
  public element: TrackElement;

  /** The color of the track in HEX format (#FF00FF). It is used to display the waveform. */
  public color: string;

  /** The plugin associated to the track. */
  public plugin: Plugin;

  /** The automation associated to the track. */
  public automation: Automation;

  /** The regions associated to the track. */
  public regions: REGION[];

  /**
   * The old volume of the track. It is used to store the volume before muting the track.
   */
  public _oldVolume: number;

  /**
   * The muted state of the track.
   */
  public muted: boolean;

  /**
   * The solo state of the track.
   */
  public solo: boolean;

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

  constructor(id: number, element: TrackElement) {
    // Audio Nodes
    this.monitoredNode= audioCtx.createGain();
    this.gainNode = audioCtx.createGain();
    this.gainNode.gain.value = 0.5;
    this.pannerNode = audioCtx.createStereoPanner();
    this.pannerNode.connect(this.gainNode).connect(this.monitoredNode)

    // Track properties
    this.id = id;
    this.element = element;
    this.color = "";
    this.automation = new Automation();
    this.regions = [];

    // Default Controls
    this.volume = 0.5;
    this._oldVolume = 0.5;
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

    this.modified=true

  }

  protected postInit(){
    this.connectPlugin(undefined)
  }

  /**
   * Set the volume of the track.
   * @param value 
   */
  public set volume(value:number){
    if(value==this.volume)return
    this._oldVolume=this.volume
    this.gainNode.gain.value=value
  }

  /**
   * Get the volume of the track
   * @param value
   */
  public get volume(): number{
    return this.gainNode.gain.value
  }

  /** Mute the track. */
  public mute(): void {
    if(this.volume!=0)this.volume=0
  }

  /** Unmute the track. */
  public unmute(): void {
    this.volume=this._oldVolume
  }

  /** Mute the track. */
  public muteSolo(): void {
    this.mute()
  }


  /**
   * Changes the balance of the track with a value between -1 and 1.
   * @param value - The balance to set.
   */
  public set balance(value: number){
    this.pannerNode.pan.value = value;
  }

  /**
   * Get the balance of the track
   */
  public get balance():number {
    return this.pannerNode.pan.value;
  }

  /**
   * Adds a region to the regions list.
   *
   * @param region - The region to add.
   */
  public addRegion(region: REGION): void {
    this.regions.push(region);
  }

  /**
   * Gets the region according to its id.
   * @param regionId - The id of the region.
   * @returns The region if it exists, undefined otherwise.
   */
  public getRegionById(regionId: number): REGION | undefined {
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
  public updateLoopTime(loopStart: number, loopEnd: number): void {
    this.loopStart = loopStart;
    this.loopEnd = loopEnd;
    this._onLoopChange(loopStart, loopEnd);
  }

  public abstract _onLoopChange(leftTime: number, rightTime: number):void;

  /**
   * Updates the track cached data when his content has been modified.
   * @param context - The audio context.
   * @param playhead - The playhead position in buffer samples.
   */
  public abstract update(context: AudioContext, playhead: number): void;

  /**
   * Connect the track to the audio node input/output of a plugin and disconnect the previous one.
   * @param node 
   */
  public connectPlugin(node?: AudioNode){
    if(node){
      this._connectPlugin(node)
      node.disconnect()
      node.connect(this.pannerNode)
    }
    else{
      this._connectPlugin(this.pannerNode)
    }
  }

  /**
   * Set the track to be monitored or not.
   * If the track is monitored, its output is connected, else it is not.
   */
  public set monitored(value: boolean){
    this.monitoredNode.gain.value = value?1:0
  }

  public get monitored(){
    return this.monitoredNode.gain.value>0
  }

  /**
   * Connect the track direct output to the plugion node input and disconnect the previous one.
   * @param node 
   */
  protected abstract _connectPlugin(node: AudioNode): void;

  public get outputNode(): AudioNode {
    return this.gainNode
  }

  public get monitoredOutputNode(): AudioNode {
    return this.monitoredNode
  }

  public abstract play(): void

  public abstract pause(): void

  public abstract loop(value:boolean): void
}
