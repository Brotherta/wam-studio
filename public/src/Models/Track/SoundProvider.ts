import { WamNode } from "@webaudiomodules/api";
import { crashOnDebug } from "../../App";
import TrackElement from "../../Components/TrackElement.js";
import type TracksController from "../../Controllers/Editor/Track/TracksController";
import { audioCtx } from "../../index";
import Automation from "../Automation";
import Plugin from "../Plugin";

/**
 * A sound output, controlled by a playhead, and with a volume and a balance.
 * You can also attach a plugin to it.
 * Tracks are sound providers.
 */
export default abstract class SoundProvider {

  /* -~- OUTPUT NODES -~- */
  /* junctionNode -> pannerNode -> gainNode -> monitoredNode */
  /** The gain node associated to the track. It is used to control the volume of the track and is the outputNode of the track. **/
  private gainNode: GainNode

  /** The panner node associated to the track. It is used to control the balance of the track. **/
  private pannerNode: StereoPannerNode

  /** The monitored output node. It output the sound of the track only when it is monitored. */
  private monitoredNode: GainNode

  /* -~- TRACK PROPERTIES -~- */
  /** The unique id of the track. */
  public id: number

  /** The track element associated to the track. */
  public element: TrackElement

  /** The automation associated to the track. */
  public automation: Automation

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
   * Position of the loop start in milliseconds.
   */
  public loopStart: number;
  
  /**
   * Position of the loop end in milliseconds.
   */
  public loopEnd: number;

  constructor(element: TrackElement, readonly groupId: string) {
    // Audio Nodes
    this.monitoredNode= audioCtx.createGain();
    this.gainNode = audioCtx.createGain();
    this.gainNode.gain.value = 0.5;
    this.pannerNode = audioCtx.createStereoPanner();
    this.pannerNode.connect(this.gainNode).connect(this.monitoredNode)

    // Track properties
    this.element = element;
    this.color = "";
    this.automation = new Automation();

    // Default Controls
    this.volume = 0.5;

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
    this._connect(this.pannerNode)
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


  /** The color of the track in HEX format (#FF00FF). It is used to display the waveform. */
  private _color: string

  public set color(newColor: string){
    this._color = newColor
    if(this.element.color)this.element.color.style.background = newColor
  }

  public get color() { return this._color }
  


  /**
   * The balance of the track. The panning of the track.
   */
  public set balance(value: number){
    this.pannerNode.pan.value = value
    if(this.element.balanceSlider)this.element.balanceSlider.value = "" + value
  }

  public get balance() { return this.pannerNode.pan.value }
  
  /**
   * Sets the start and end of the loop.
   *
   * @param leftTime - Start of the loop in milliseconds.
   * @param rightTime - End of the loop in milliseconds.
   */
  public updateLoopTime(loopStart: number, loopEnd: number): void {
    this.loopStart = loopStart;
    this.loopEnd = loopEnd;
  }

  /**
   * Updates the track cached data when his content has been modified.
   * @param context - The audio context.
   * @param playhead - The playhead position in buffer samples.
   */
  public abstract update(context: AudioContext, playhead: number): void



  /** ~ PLUGINS ~ **/
  private _plugin: Plugin|null = null // The plugin associated to the track.

  get plugin(): Plugin|null{ return this._plugin }

  /**
   * Connect the track to a plugin and disconnect it from the previous one.
   * @param node 
   */
  public async connectPlugin(plugin: Plugin|null){
    console.log(">>> Instantiate")
    if(plugin)await plugin.instantiate(this.pannerNode.context,this.groupId)//TODO 

      console.log(">>> Disconnect")
    // Disconnect the previous plugin node if it exists.
    if(this.plugin){
      const wam=this.plugin.instance
      if(wam){
        wam.audioNode.disconnect(this.pannerNode)
        this._disconnect(wam.audioNode)
        this._disconnectEvents(wam.audioNode)
      }
      this.plugin.destroy()
      this._plugin=null
    }
    // Disconnect from panner node
    else {
      this._disconnect(this.pannerNode)
    }

    console.log(">>> Connect")
    // Connect to a plugin node
    if(plugin){
      if(plugin.instance===null){
        crashOnDebug("Plugin instance is null")
        return
      }
      this._plugin=plugin
      this._connect(plugin.instance.audioNode)
      this._connectEvents(plugin.instance.audioNode)
      plugin.instance.audioNode.connect(this.pannerNode)
    }
    // Connect to panner node
    else{
      this._connect(this.pannerNode)
    }
    console.log(">>> End")
  }

  public abstract _connect(node: AudioNode): void

  public abstract _disconnect(node: AudioNode): void

  public abstract _connectEvents(node: WamNode): void

  public abstract _disconnectEvents(node: WamNode): void

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

  public get outputNode(): AudioNode {
    return this.gainNode
  }

  public get monitoredOutputNode(): AudioNode {
    return this.monitoredNode
  }

  public abstract play(): void

  public abstract pause(): void

  public abstract loop(value:boolean): void

  /** The playhead positions of the track in milliseconds. */
  public abstract playhead: number

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