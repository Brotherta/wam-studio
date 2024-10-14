import { WamNode, WebAudioModule } from "@webaudiomodules/api";
import { crashOnDebug } from "../../App";
import AudioGraph from "../../Audio/Graph/AudioGraph";
import PassthroughWAM from "../../Audio/Node/PassthroughWAM";
import SoundProviderElement from "../../Components/Editor/SoundProviderElement";
import Automation from "../Automation";
import Plugin, { PluginInstance } from "../Plugin";

/**
 * A sound output, controlled by a playhead, and with a volume and a balance.
 * You can also attach a plugin to it.
 * Tracks are sound providers.
 * The host is a sound provider.
 * 
 * The internal audio graph of a sound provider is the following:
 * Without any plugin attached: audioInputNode -> pannerNode -> gainNode -> outputNode
 * With a plugin attached: audioInputNode -> pluginNode -> pannerNode -> gainNode -> outputNode
 */
export default abstract class SoundProvider {

  /* -~- OUTPUT NODES -~- */
  /** The gain node associated to the track. It is used to control the volume of the track and is the outputNode of the track. **/
  protected gainNode: GainNode

  /** The panner node associated to the track. It is used to control the balance of the track. **/
  private pannerNode: StereoPannerNode

  /** The WAM input : The input of the sound provider */
  private inputWAM: WebAudioModule

  /* -~- TRACK PROPERTIES -~- */
  /** The unique id of the track. */
  public id: number

  /** The track element associated to the track. */
  private _element: SoundProviderElement
  public get element(){ return this._element }

  /** The automation associated to the track. */
  public automation: Automation

  private _modified: boolean

  constructor(element: SoundProviderElement, readonly groupId: string, readonly audioContext: BaseAudioContext) {
    // Audio Nodes
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0.5;
    this.pannerNode = audioContext.createStereoPanner();
    this.pannerNode.connect(this.gainNode)

    // Track properties
    this._element = element;
    this.color = "";
    this.automation = new Automation();

    // Default Controls
    this.volume = 0.5;

    // Recording controls.
    this.isMuted=false

    this.modified=true

  }


  /** LIFTIME */
  /** 
   * Should be called at the sound provider creation.
   * Initialize the input node of the sound provider.
   **/
  async init(){
    this.inputWAM= await PassthroughWAM.createInstance(this.groupId, this.audioContext)
    this.audioInputNode.connect(this.pannerNode)
  }

  /** Should be called at the sound provider destruction to clean up */
  dispose(){
    this.audioInputNode.destroy()
  }



  /** VOLUME, MUTE and SOLO */
  /** The volume of the track. */
  private _volume: number

  protected updateVolume(){
    if(!this.isMuted)this.gainNode.gain.value=this._volume
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
    this.element.isMuted=value
    this.updateVolume()
  }

  public get isMuted() { return this._muted }

  private _muted: boolean=false


  /** The color of the track in HEX format (#FF00FF). It is used to display the waveform. */
  private _color: string

  public set color(newColor: string){
    this._color = newColor
    this.element.color = newColor
  }

  public get color() { return this._color }
  

  /**
   * The balance of the track. The panning of the track.
   */
  public set balance(value: number){
    this.pannerNode.pan.value = value
    this.element.balanceSlider.value = "" + value
  }

  public get balance() { return this.pannerNode.pan.value }

  /**
   * Updates the track cached data when his content has been modified.
   * @param context - The audio context.
   * @param playhead - The playhead position in buffer samples.
   */
  public abstract update(context: AudioContext, playhead: number): void



  /* ~ CONNECTIONS ~ */
  /**
   * The input node of the effect graph, any sound or event send into it will be treated
   * by the plugin and the settings.
   */
  get audioInputNode(){
    if(!this.inputWAM.initialized)crashOnDebug(`This sound provider${this.constructor.name} has not been initialized`)
    return this.inputWAM.audioNode
  }

  /**
   * The output node of the sound provider.
   */
  public get outputNode(): AudioNode { return this.gainNode }




  /** ~ PLUGINS ~ **/
  private _plugin: PluginInstance|null = null // The plugin associated to the track.

  get plugin(): PluginInstance|null{ return this._plugin }

  /**
   * Connect the track to a plugin and disconnect it from the previous one.
   * @param node 
   */
  public async connectPlugin(plugin: Plugin|null){
    // Create the instance first
    const pluginInstance = plugin ? await plugin.instantiate(this.audioContext, this.groupId) : null

    // Disconnect the previous plugin node if it exists.
    if(this.plugin){
      const wam=this.plugin.instance
      if(wam){
        wam.audioNode.disconnect(this.pannerNode)
        this.audioInputNode.disconnect(wam.audioNode)
        this.audioInputNode.disconnectEvents(wam.audioNode.instanceId)
      }
      this.plugin.dispose()
      this._plugin=null
    }
    // Disconnect from panner node
    else {
      this.audioInputNode.disconnect(this.pannerNode)
    }

    // Connect to a plugin node
    if(pluginInstance){
      this._plugin=pluginInstance
      this.audioInputNode.connect(pluginInstance.audioNode)
      this.audioInputNode.connectEvents(pluginInstance.audioNode.instanceId)
      pluginInstance.audioNode.connect(this.pannerNode)
    }
    // Connect to panner node
    else{
      this.audioInputNode.connect(this.pannerNode)
    }

    this.element.hasPlugin= !!this._plugin // !!value = Convert value to boolean
  }


  public abstract play(): void

  public abstract pause(): void


  /** LOOP */
  private _loop_range: [number,number]|null = null
  get loopRange(): [number,number]|null{ return this._loop_range==null ? null : [...this._loop_range]}

  setLoop(range: [number,number]|null){
    this._loop_range=range
  }

  /** The playhead positions of the track in milliseconds. */
  public abstract playhead: number

  /**
   * The modified state of the track. It is used to know if the track has been modified and should be updated.
   */
  public set modified(value: boolean){ this._modified=value }
  public get modified(): boolean{ return this._isModified(this._modified) }

  /**
   * Override this method to add more conditions to the modified state.
   * @returns 
   */
  protected _isModified(decorated: boolean):boolean{ return decorated }


  /** Audio Graph Creation */
  /**
   * Get the sound provider graph of this sound provider.
   */
  public get sound_provider_graph(){
    const that=this
    return this._sound_provider_graph=this._sound_provider_graph ?? {
      async instantiate(audioContext: BaseAudioContext, groupId: string) {
        // Create the graph
        const gainNode = audioContext.createGain()
        gainNode.gain.value = that.gainNode.gain.value
    
        const pannerNode = audioContext.createStereoPanner()
        pannerNode.pan.value = that.pannerNode.pan.value
        pannerNode.connect(gainNode)
    
        let plugin_instance=await that.plugin?.cloneInto(audioContext,groupId) ?? null
        if(plugin_instance)plugin_instance.audioNode.connect(pannerNode)
        return new SoundProviderGraphInstance(gainNode, pannerNode, plugin_instance, groupId)
      }
    }
  }

  private _sound_provider_graph: AudioGraph<SoundProviderGraphInstance>|null=null

}


export class SoundProviderGraphInstance{

  constructor(
    public gainNode: GainNode,
    public pannerNode: StereoPannerNode,
    public plugin: PluginInstance|null,
    public groupId: string,
  ){}

  connect(destination: AudioNode): void { this.gainNode.connect(destination) }
  disconnect(destination?: AudioNode): void { destination ? this.gainNode.disconnect(destination) : this.gainNode.disconnect() }

  connectEvents(destination: WamNode): void { if(this.plugin)this.plugin.audioNode.connectEvents(destination.instanceId) }
  disconnectEvents(destination?: WamNode | undefined): void {
    if(this.plugin){
      if(destination)this.plugin.audioNode.disconnectEvents(destination.instanceId)
      else this.plugin.audioNode.disconnectEvents()
    }
  }

  dispose(): void {
    this.gainNode.disconnect()
    this.pannerNode.disconnect()
    this.plugin?.dispose()
  }

  get inputNode() { return this.plugin ? this.plugin.audioNode : this.pannerNode }
}
