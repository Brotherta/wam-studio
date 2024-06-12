import TrackElement from "../../Components/TrackElement.js";
import Region, { RegionOf, RegionType } from "../Region/Region";
import Track from "./Track";

export default class RegionTrack extends Track {


  /** The audio context. */
  private audioCtx: AudioContext

  /** The group id of the track. */
  private groupId: string
  
  /** The junction node to which all region type output are connected. */
  private junctionNode: GainNode

  /* -~- REGIONS -~- */
  /** The regions associated to the track. */
  public regions: Region[] = []

  /** The merger regions, for each type of region there is big merger region. */
  public merged_regions = new Map<RegionType<any>, [RegionOf<any>,RegionPlayer]>()

  /** Merge all regions into big merged regions. */
  private updateMergedRegions(){
    // Sort all regions
    const regionMap= new Map<RegionType<any>,RegionOf<any>[]>()
    for(const region of this.regions as RegionOf<any>[]){
      const list=regionMap.get(region.regionType) ?? []
      regionMap.set(region.regionType, list)
      list.push(region)
    }

    // Collect all player THEN clear and replace them (Probable race condition)
    // TODO Make sure there is no race condition
    (async()=>{

      // Merge regions
      const new_merged_regions = new Map<RegionType<any>, [RegionOf<any>,RegionPlayer]>()
      for(const [type, regions] of regionMap){
        const merged=Region.mergeAll(regions,true)
        const player=await merged.createPlayer(this.groupId, this.audioCtx)
        player.connect(this.junctionNode)
        new_merged_regions.set(type, [merged,player])
      }

      // Clear regions
      const old_merged_regions=this.merged_regions
      this.merged_regions=new_merged_regions
      for(const [type,[region,player]] of old_merged_regions){
        player.disconnect(this.junctionNode)
        player.clear()
      }

      this.updatePlayState()
      
    })()

  }
  

  constructor(element: TrackElement, audioCtx: AudioContext, groupId: string) {
    super(element)
    this.junctionNode=audioCtx.createGain()
    this.audioCtx=audioCtx
    this.groupId=groupId
    this.postInit()
  }

  /**
   * Adds a region to the regions list.
   *
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
    this.updateMergedRegions()
  }


  /* PLAY */
  private updatePlayState(){
    console.log("UPDATE PLAY STATE")
    for(const [_,[__,player]] of this.merged_regions){
      if(this._playing)player.play()
      else player.pause()
      if(!this._doLoop)player.setLoop(false)
      else player.setLoop(this.loopStart, this.loopEnd)
      player.playhead=this._playhead
    }
  }

  private _playing=false
  public override play(): void{
    this._playing=true
    this.updatePlayState()
  }

  public override pause(): void{
    this._playing=false
    this.updatePlayState()
  }

  private _doLoop=false
  public override loop(value:boolean): void{
    this.updatePlayState()
  }

  public override _connect(node: AudioNode): void {
    this.junctionNode.connect(node)
  }

  public override _disconnect(node: AudioNode): void {
    this.junctionNode.disconnect(node)
  }

  private _playhead=0
  public override set playhead(value: number){
    console.log("SET PLAYHEAD", value)
    this._playhead=value
    this.updatePlayState()
  }
  public override get playhead(): number{
    return this._playhead
  }


  /* LIFTIME */

  /** Is the track deleted */
  public deleted=false;
  
  /** Should be called when the track is deleted and no more used. */
  public close(){
    for(const [_,[__,player]] of this.merged_regions){
      player.disconnect(this.junctionNode)
      player.clear()
    }
    this.deleted=true
  }

}
