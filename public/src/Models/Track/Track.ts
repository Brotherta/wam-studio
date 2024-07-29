import { WamNode } from "@webaudiomodules/api";
import App from "../../App";
import AudioGraph, { AudioGraphInstance } from "../../Audio/Graph/AudioGraph";
import TrackElement from "../../Components/Editor/TrackElement";
import RegionRecorderManager from "../../Controllers/Recording/Recorders/RegionRecorderManager";
import Region, { RegionOf, RegionType } from "../Region/Region";
import RegionPlayer from "../Region/RegionPlayer";
import SoundProvider, { SoundProviderGraphInstance } from "./SoundProvider";

export default class Track extends SoundProvider {


  constructor(element: TrackElement, audioCtx: BaseAudioContext, groupId: string) {
    super(element,groupId,audioCtx)
    this.junctionNode=audioCtx.createGain()
    this.isSolo=false
  }

  override async init(): Promise<void> {
      await super.init()
      this.junctionNode.connect(this.audioInputNode)
  }

  override get element(){return super.element as TrackElement}

  /**
   * Adds a region to the regions list.
   * @param region - The region to add.
   */
  public addRegion(region: Region): void {
    region.trackId=this.id
    this.regions.push(region);
  }

  /**
   * Gets the region according to its id.
   * @param regionId - The id of the region.
   * @returns The region if it exists, undefined otherwise.
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
   * Updates the track cached data when his content has been modified.
   * @param context - The audio context.
   * @param playhead - The playhead position in buffer samples.
   */
  public update(context: AudioContext, playhead: number): void{
    console.log("Mergeds")
    this.updateMergedRegions()
  }

  /* PLAY */
  override setLoop(range: [number, number] | null): void {
    super.setLoop(range)
    for(const [_,[__,player]] of this.merged_regions){ player.setLoop(range) }
  }

  private _playing=false
  public override play(): void{
    this._playing=true
    for(const [_,[__,player]] of this.merged_regions){ player.isPlaying=true }
  }

  public override pause(): void{
    this._playing=false
    for(const [_,[__,player]] of this.merged_regions){ player.isPlaying=false }
  }


  /* CONNECTION */
  public override set playhead(value: number){
    console.log("playhead at",value)
    for(const [_,[__,player]] of this.merged_regions){ player.playhead=value }
  }
  public override get playhead(): number{
    for(const [_,[__,player]] of this.merged_regions){ return player.playhead }
    return 0
  }


  /** The junction node to which all region type output are connected. */
  private junctionNode: GainNode


  /* -~- REGIONS MERGING -~- */
  /** The regions associated to the track. */
  public regions: Region[] = []

  /** The merger regions, for each type of region there is big merger region. */
  public merged_regions = new Map<RegionType<any>, [RegionOf<any>,RegionPlayer]>()

  /** Merge all regions into big merged regions. */
  private async updateMergedRegions(){
    // Sort all regions
    const regionMap= new Map<RegionType<any>,RegionOf<any>[]>()
    for(const region of this.regions as RegionOf<any>[]){
      const list=regionMap.get(region.regionType) ?? []
      regionMap.set(region.regionType, list)
      list.push(region)
    }

    // Collect all player THEN clear and replace them (Probable race condition)
    // TODO Make sure there is no race condition

    // Merge regions
    const new_merged_regions = new Map<RegionType<any>, [RegionOf<any>,RegionPlayer]>()
    for(const [type, regions] of regionMap){
      const merged=Region.mergeAll(regions,true)
      const player=await merged.createPlayer(this.groupId, this.audioContext)
      player.connect(this.junctionNode)
      player.connectEvents(this.audioInputNode)
      new_merged_regions.set(type, [merged,player])
    }

    // Get playstate
    let playstate=false
    let playhead=0
    for(const [_,[__,player]] of this.merged_regions){
      playstate=player.isPlaying
      playhead=player.playhead
      break
    }

    // Change playstate
    for(const [_,[__,player]] of new_merged_regions){
      player.isPlaying=playstate
      player.playhead=playhead
      player.setLoop(this.loopRange)
    }

    // Clear regions
    const old_merged_regions=this.merged_regions
    this.merged_regions=new_merged_regions
    for(const [type,[region,player]] of old_merged_regions){
      player.disconnect(this.junctionNode)
      player.disconnectEvents(this.audioInputNode)
      player.dispose()
    }
  }



  /* -~- LIFETIME -~- */
  /** Is the track deleted */
  public deleted=false;
  
  /** Should be called when the track is deleted and no more used. */
  public override dispose(){
    super.dispose()
    for(const [_,[__,player]] of this.merged_regions){
      player.disconnect(this.junctionNode)
      player.disconnectEvents(this.audioInputNode)
      player.dispose()
    }
    this.outputNode.disconnect()
    this.recorders.dispose()
    this.deleted=true
  }

  /** Audio Graph Creation */
  /**
   * Get the sound provider graph of this sound provider.
   */
  get track_graph(){
    const that=this
    return this._track_graph=this._track_graph ?? {

      async instantiate(audioContext: BaseAudioContext, groupId: string) {
        // Create sound provider graph
        const audioProviderInstance=await that.sound_provider_graph.instantiate(audioContext,groupId)

        // Create players graph
        await that.updateMergedRegions()
        const players=await Promise.all([...that.merged_regions.values()].map(region=>region[0].createPlayer(groupId,audioContext)))
        for(const player of players){
          player.connect(audioProviderInstance.inputNode)
          if(audioProviderInstance.plugin)player.connectEvents(audioProviderInstance.plugin.audioNode)
        }
        return new TrackGraphInstance(audioProviderInstance,players)
      },
    }
  }

  private _track_graph: AudioGraph<TrackGraphInstance>|null=null

  protected override updateVolume(){
    if(!this.isMuted && !this.isSoloMuted)this.gainNode.gain.value=this.volume
    else this.gainNode.gain.value=0
  }

  /**
   * Is the track muted by the solo mode of other tracks, if a track is muted it emits no sound
   */
  public set isSoloMuted(value: boolean) {
    this._solo_muted=value
    this.element.isSoloMuted=value
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
    this.element.isSolo=value
  }

  public get isSolo() { return this._solo }

  private _solo: boolean=false


  /* -~- RECORDING -~- */
  public recorders: RegionRecorderManager<{app:App,track:Track}>

  /**
   * Is the track monitored.
   * If a track is monitored, it play what is recorder on the track while it is recording.
   */
  public set monitored(value: boolean) {
    if(this.recorders){
      this.recorders.isMonitoring=value
      this.element.isMonitoring=value
    }
  }

  public get monitored() { return this.recorders.isMonitoring }

}



export class TrackGraphInstance implements AudioGraphInstance{

  constructor(
    public soundProvider: SoundProviderGraphInstance,
    public players: RegionPlayer[]
  ){}

  connect(destination: AudioNode) { this.soundProvider.connect(destination) }
  disconnect(destination?: AudioNode | undefined) { this.soundProvider.disconnect(destination) }
  connectEvents(destination: WamNode) { this.soundProvider.connectEvents(destination) }
  disconnectEvents(destination?: WamNode | undefined) { this.soundProvider.disconnectEvents(destination) }
  dispose(): void {
    this.soundProvider.dispose()
    for(const player of this.players)player.dispose()
  }

  set playhead(value: number){
    for(const player of this.players){ player.playhead=value }
  }

  set isPlaying(value: boolean){
    if(!value)return
    for(const player of this.players){ player.isPlaying=value }
  }

  playEfficiently(start: number, duration: number): Promise<void>{
    return Promise.all(this.players.map(player=>player.playEfficiently(start,duration))).then(()=>{})
  }

}