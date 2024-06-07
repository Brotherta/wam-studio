import TrackElement from "../../Components/TrackElement.js";
import type TracksController from "../../Controllers/Editor/Track/TracksController";
import { audioCtx } from "../../index";
import Automation from "../Automation";
import Plugin from "../Plugin.js";
import Region from "../Region/Region";

export type TrackRegionType<Type> = Type extends TrackOf<infer X> ? X : never

export type Track=TrackOf<Region>

export default abstract class TrackOf<REGION extends Region> {

  // Output Node
  /** 
   * The gain node associated to the track. It is used to control the volume of the track and is the outputNode of the track.
   * pannerNode -> gainNode
   **/
  private gainNode: GainNode

  /** 
   * The panner node associated to the track. It is used to control the balance of the track.
   * pannerNode -> gainNode
   **/
  private pannerNode: StereoPannerNode

  /**
   * The plugin node if a plugin is connected to the track.
   */
  private pluginNode?: AudioNode

  /**
   * The monitored output node. It output the sound of the track only when it is monitored.
   */
  private monitoredNode: GainNode

  /** The unique id of the track. */
  public id: number

  /** The track element associated to the track. */
  public element: TrackElement

  /** The color of the track in HEX format (#FF00FF). It is used to display the waveform. */
  public color: string

  /** The plugin associated to the track. */
  public plugin: Plugin

  /** The automation associated to the track. */
  public automation: Automation

  /** The regions associated to the track. */
  public regions: REGION[]

  private _modified: boolean
  
  /**
   * The armed state of the track. It is used to record the track.
   */
  set isArmed(value: boolean){
    this._armed=value
    console.log("Armed", value)
    this.element.setArm(value)
  }

  get isArmed(){ return this._armed }

  private _armed: boolean=false
  
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
    this.deleted = false;

    // Recording controls.
    this.isMuted=false
    this.isSolo=false
    this.isArmed = false;
    this.monitored = false;

    // Loop controls.
    this.loopStart = 0;
    this.loopEnd = 0;

    this.modified=true

  }

  protected postInit(){
    this._connectPlugin(this.pannerNode)
  }


  /** VOLUME, MUTE and SOLO */

  /** The volume of the track. */
  private _volume: number

  private updateVolume(){
    if(!this.isMuted && !this.isSoloMuted)this.gainNode.gain.value=this._volume
    else this.gainNode.gain.value=0
  }

  /**
   * The volume of the track
   */
  public set volume(value:number){
    // Set volume
    this._volume=value
    if(this.element.volumeSlider)this.element.volumeSlider.value = "" + value * 100;

    this.updateVolume()
  }

  public get volume() { return this._volume }

  /**
   * Is the track muted, if a track is muted it emits no sound
   */
  public set isMuted(value: boolean) {
    this._muted=value
    this.element.setMute(value)
    this.updateVolume()
  }

  public get isMuted() { return this._muted }

  private _muted: boolean=false

  /**
   * Is the track muted by the solo mode of other tracks, if a track is muted it emits no sound
   */
  public set isSoloMuted(value: boolean) {
    this._solo_muted=value
    this.element.setSoloMute(value)
    this.updateVolume()
  }

  public get isSoloMuted() { return this._solo_muted }

  private _solo_muted: boolean=false
  
  /**
   * Is the track soloed, if at least one track is soloed, only soloed tracks emit sound
   * [WARNING] Don't set isSolo directly, use {@link TracksController#setSolo} instead.
   */
  public set isSolo(value: boolean){
    if(value){
      this.isMuted=false
      this.isSoloMuted=false
    }
    this._solo=value
    this.updateVolume()
    this.element.setSolo(value)
  }

  public get isSolo() { return this._solo }

  private _solo: boolean=false


  /**
   * The balance of the track. The panning of the track.
   */
  public set balance(value: number){
    this.pannerNode.pan.value = value
    if(this.element.balanceSlider)this.element.balanceSlider.value = "" + value
  }

  public get balance() { return this.pannerNode.pan.value }

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
    // Disconnect the previous plugin node if it exists.
    if(this.pluginNode){
      this.pluginNode.disconnect(this.pannerNode)
      this._disconnectPlugin(this.pluginNode)
      this.pluginNode=undefined
    }
    // Disconnect from panner node
    else {
      this._disconnectPlugin(this.pannerNode)
    }

    // Connect to a plugin node
    if(node){
      this.pluginNode=node
      this._connectPlugin(node)
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
    this.element.setMonitoring(value)
  }

  public get monitored(){
    return this.monitoredNode.gain.value>0
  }

  /**
   * Connect the track direct output to the plugin node input.
   */
  protected abstract _connectPlugin(node: AudioNode): void;

  /**
   * Disconnect the track direct output from the plugin node input/output.
   */
  protected abstract _disconnectPlugin(node: AudioNode): void;

  public get outputNode(): AudioNode {
    return this.gainNode
  }

  public get monitoredOutputNode(): AudioNode {
    return this.monitoredNode
  }

  public abstract play(): void

  public abstract pause(): void

  public abstract loop(value:boolean): void

  /**
   * The modified state of the track. It is used to know if the track has been modified and should be updated.
   */
  public set modified(value: boolean){
    this._modified=value
  }
  public get modified(): boolean{
    return this._modified || this._isModified()
  }

  /**
   * Override this method to add more conditions to the modified state.
   * @returns 
   */
  protected _isModified():boolean{
    return false
  }
}
