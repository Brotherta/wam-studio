import { FederatedPointerEvent } from "pixi.js";
import App, { crashOnDebug } from "../../../App";
import { MIDI } from "../../../Audio/MIDI/MIDI";
import { RATIO_MILLS_BY_PX } from "../../../Env";
import MIDIRegion from "../../../Models/Region/MIDIRegion";
import Region, { RegionOf, RegionType } from "../../../Models/Region/Region";
import SampleRegion from "../../../Models/Region/SampleRegion";
import Track from "../../../Models/Track/Track";
import { isKeyPressed, registerOnKeyDown, registerOnKeyUp } from "../../../Utils/keys";
import EditorView from "../../../Views/Editor/EditorView.js";
import MIDIRegionView from "../../../Views/Editor/Region/MIDIRegionView";
import RegionView from "../../../Views/Editor/Region/RegionView";
import SampleRegionView from "../../../Views/Editor/Region/SampleRegionView";
import WaveformView from "../../../Views/Editor/WaveformView.js";
import { SelectionManager } from "../Track/SelectionManager";


/**
 * Class that control the regions of the editor.
 */
export default class RegionController {

  /**
   * Factory functions to create a region view from a region.
   */
  private static regionViewFactories: { [key: RegionType<any>] : ((editor:EditorView,from:RegionOf<any>)=>RegionView<any>) }={
    [MIDIRegion.TYPE]: (editor,region)=>new MIDIRegionView(editor,region as MIDIRegion),
    [SampleRegion.TYPE]: (editor,region)=>new SampleRegionView(editor,region as SampleRegion)
  }

  /**
   * Number of region that is incremented for each time a region is created.
   */
  public regionIdCounter: number;

  /** Route Application. */
  protected _app: App;

  /** Editor's Application of PIXI.JS. */
  protected _editorView: EditorView;

  /**
   * The offset on X axis when a region is moved.
   * Represents the position on the region view itself, where the user clicked.
   */
  protected _offsetX: number;

  /* for disabling snapping is shift key is pressed and global snapping enabled */
  protected snappingDisabled: boolean = false;

  /* for computing delta between two pointermove events */
  protected previousMouseXPos: number = 0;

  /** The region that is currently dragged and its view */
  protected draggedRegionState: {region:RegionOf<any>, initialPos:number, initialTrackId:number}|undefined=undefined

  protected oldTrackWhenMoving!: Track;
  protected newTrackWhenMoving!: Track;

  /* For copy-paste region */
  private regionClipboard: {region: RegionOf<any>, track: Track}

  // scroll smoothly viewport left or right
  scrollingRight: boolean = false;
  scrollingLeft: boolean = false;
  incrementScrollSpeed: number = 0;
  viewportAnimationLoopId: number = 0;
  selectedRegionEndOutsideViewport: boolean = false;
  selectedRegionStartOutsideViewport: boolean = false;

  doIt

  constructor(app: App) {
    this._app = app
    this._editorView = app.editorView
    this.regionIdCounter = 0
    this.doIt=app.doIt.bind(app)

    this.bindEvents()
    this.initSelection()
  }



  //// UTILS ////
  public getView<T extends RegionOf<T>>(region: T, callback?: (view:RegionView<T>)=>void): RegionView<T>
  public getView<T extends RegionOf<T>>(region: T|undefined|null, callback?: (view:RegionView<T>)=>void): RegionView<T>|undefined
  public getView<T extends RegionOf<T>>(region: T|undefined|null, callback?: (view:RegionView<T>)=>void): RegionView<T>|undefined{
    if(!region)return undefined
    const waveform= this._editorView.getWaveFormViewById(region.trackId)
    const view= waveform?.getRegionViewById(region.id)
    if(view && callback)callback(view)
    return view
  }



  //// SELECTION ////

  /** The region selection manager */
  readonly selection= new SelectionManager<RegionOf<any>>()

  private initSelection(){
    this.selection.onPrimaryChange.add((previous,selected)=>{
      this.getView( previous, it=>it.isSelected=false )
      this.getView( selected, it=>it.isSelected=true )
    })

    this.selection.onSecondaryAdd.add(region=>{
      this.getView( region, it=>it.isSubSelected=true )
    })

    this.selection.onSecondaryRemove.add(region=>{
      this.getView( region, it=>it.isSubSelected=false )
    })
  }



  get tracks(){ return this._app.tracksController.tracks }

  /**
   * Adds a region to the track and the corresponding view in the waveform.
   * @param track - The track where to add the region.
   * @param region - The region to add.
   * @param waveform - The waveform where to add the region. If not given, the waveform will be search using the ID of the track.
   */
  public addRegion<T extends RegionOf<T>>(track: Track, region: RegionOf<T>, waveform?: WaveformView): RegionView<T>{
    if(track.regions.indexOf(region)>=0)crashOnDebug("Try to add a region already in the track")

    if(region.id===-1)region.id=this.getNewId()
    const factory=RegionController.regionViewFactories[region.regionType]!

    if(!factory){
      crashOnDebug("No factory for region type "+region.regionType)
      // TODO Try to add fallback if there is no region view, like a simple red cross invalid region view.
    }

    // Add to the track
    track.addRegion(region)
    track.modified=true

    // Create the view
    let regionView= factory(this._editorView,region)
    this.bindRegionEvents(region, regionView)
    regionView.initializeRegionView(track.color, region)

    waveform ??= this._editorView.getWaveFormViewById(track.id)!
    waveform.addChild(regionView)
    waveform.regionViews.push(regionView)

    return regionView
  }

  /**
   * Move a region to a track by removing it from the previous track and adding it to the new track.
   * @param region The region to move
   * @param newTrack The track where to move the region
   * @param newX An optional new position for the region
   * @returns 
   */
  public moveRegion(region: RegionOf<any>, newTrack: Track, newX?: number){
    // Move the region along its track
    if(newX!==undefined){
      region.start=newX * RATIO_MILLS_BY_PX
      const view=this._editorView.getWaveFormViewById(newTrack.id)!.getRegionViewById(region.id)
      if(view)view.position.x = newX;

      if(region.trackId===newTrack.id){
        newTrack.modified=true
      }
    }

    // Move the region from the old track to the new track
    if(region.trackId!==newTrack.id){
      // Keep selection
      const selected = this.selection.isSelected(region)

      // Remove the region view in the old track
      this.removeRegion(region);

      // Create a new region view of the same region in the new track
      const newview=this.addRegion(newTrack,region)

      if(selected)this.selection.add(region)
    }

  }

  /**
   * Updates a region with a new registered region.
   *
   * @param region - The temporary region tu update.
   * @param track - The track where the region is.
   * @param buffer - The new buffer for the region.
   */
  public updateTemporaryRegion(region: RegionOf<any>, track: Track, added: RegionOf<any>) {
    const waveformView = this._editorView.getWaveFormViewById(track.id)!;
    const regionView = waveformView.getRegionViewById(region.id)!;
    if(region.isCompatibleWith(added)){
      region.mergeWith(added)
      regionView.initializeRegionView(track.color, region)
      this._app.tracksController.getTrackById(track.id)!.modified=true
    }
    else crashOnDebug("Try to complete a temporary region with an incompatible region")
  }

  /**
   * Get the maximum duration of all the regions in the editor.
   *
   * @returns The maximum duration of all the regions in the editor in seconds.
   */
  public getMaxDurationRegions(): number {
    let maxTime = 0;
    for (let track of this.tracks) {
      for (let region of track.regions) {

        let end = region.start/1000 + region.duration/1000;
        if (end > maxTime) {
          maxTime = end;
        }
      }
    }

    return maxTime;
  }


  /**
   * Binds the event of a regionView. Used when a new regionView is created.
   *
   * @param region - The data object of the region.
   * @param regionView - The view representing the region.
   */
  bindRegionEvents(region: Region, regionView: RegionView<any>): void {
    regionView.on("pointerdown", (_e) => {
      this.handlePointerDown(regionView);
      this._offsetX = _e.data.global.x - regionView.position.x;
      // select the track that corresponds to the clicked region
      let track = this._app.tracksController.getTrackById(region.trackId);
      if (track) this._app.tracksController.select(track);
    });
    regionView.on("pointerup", () => this.handlePointerUp());
    regionView.on("pointerupoutside", () => this.handlePointerUp() );
  }


  /**
   * Binds on initialisation the events related to the playhead : pointerdown, pointerup, pointermove and so on...
   * @private
   */
  private bindEvents(): void {
    registerOnKeyUp( key => {
      if(key=="Shift") this.snappingDisabled=false
    });

    registerOnKeyDown(key => {
      switch(key){
        case "Escape":
          this.selection.set(null)
          break;

        case "Delete":
        case "Backspace":
          this.deleteSelectedRegion(true);
          break;

        case "Shift":
          this.snappingDisabled=true;
          break;
        
        case "S":
        case "s":
          this.splitSelectedRegion();
          break;

        case "x":
          if(isKeyPressed("Control"))this.cutSelectedRegion();
          break;

        case "c":
          if(isKeyPressed("Control"))this.copySelectedRegion();
          break;

        case "v":
          if(isKeyPressed("Control"))this.pasteRegion(true);
          break;

        case "m":
          const selected=this._app.tracksController.selectedTrack
          if(selected){
            const start=this._app.host.playhead
            const { DO,DO_,RE,RE_,MI,FA,FA_,SOL,SOL_,LA,LA_,SI, $, i, ii, iii, iiii }=MIDI
            const midi=MIDI.fromList([
              MI, null, MI, MI, null, DO, MI+i, null, SOL+ii, null, null, null, SOL-$+i, null, null, null,
              DO+i, null, null, SOL-$+i, null, null, MI-$, null, null, LA-$, null, SI-$, null, LA_-$, LA-$,
            ], 200)
            const region=new MIDIRegion(midi,start)
            this.addRegion(selected,region)
          }
          break;

        case "n":{
          const selected=this._app.tracksController.selectedTrack
          if(selected){
            const start=this._app.host.playhead
            const { DO,DO_,RE,RE_,MI,FA,FA_,SOL,SOL_,LA,LA_,SI, $, i, ii, iii, iiii }=MIDI
            const midi=MIDI.fromList([DO,MI,DO,MI,DO,MI,DO,MI,DO,MI,DO], 500)
            const region=new MIDIRegion(midi,start)
            this.addRegion(selected,region)
          }
          break;
        }

        case "k":{
          const selected=this._app.tracksController.selectedTrack
          if(selected){
            const start=this._app.host.playhead
            const { DO,DO_,RE,RE_,MI,FA,FA_,SOL,SOL_,LA,LA_,SI, $, i:I, ii:II, iii:III, iiii:IIII }=MIDI
            const _=null
            let input= prompt("Write MIDI Notes")?.toUpperCase()?.replace(/ /g,",")
            input="["+input+"]"
            console.log(input)
            const midi=MIDI.fromList(eval(input) as number[]  , 500)
            const region=new MIDIRegion(midi,start)
            this.addRegion(selected,region)
            this._app.host.playhead=region.end
          }
          break;
        }
      }
    });
    // handle moving a region on the PIXI Canvas.
    this._editorView.viewport.on("pointermove", (e) => {
      if (this.draggedRegionState) {
        this.handlePointerMove(e);
      }
    });
  }

  /**
   * Get a new region ID and increment the region ID counter.
   * @private
   * @return a new ID.
   */
  private getNewId(): number {
    return this.regionIdCounter++;
  }


  private _dragged_initial_state=undefined

  /**
   * Selects the region when the user click on the view.
   *
   * @param regionView - The clicked region view
   * @private
   */
  private handlePointerDown(regionView: RegionView<any>): void {
    this.viewportAnimationLoopId = requestAnimationFrame(
      this.viewportAnimationLoop.bind(this)
    );
    const region = this._app.tracksController.getTrackById(regionView.trackId)?.getRegionById(regionView.id) as RegionOf<any>
    if(region){
      if(isKeyPressed("Control")) this.selection.toggle(region,true)
      else this.selection.set(region)
    }

    const toMove= this.selection.primary
    const view= this.getView(this.selection.primary)
    if (view && toMove) {
      
      // useful for avoiding scrolling with large regions
      this.selectedRegionEndOutsideViewport =
        view.position.x + view.width > this._editorView.viewport.right

      this.selectedRegionStartOutsideViewport =
        view.position.x < this._editorView.viewport.left;

      // Useful for undo/redo
      this.draggedRegionState = {region:toMove, initialPos: toMove.pos, initialTrackId: toMove.trackId};
    }
  }


  public removeRegion(region: RegionOf<any>, undoable=false){
    const track=this._app.tracksController.getTrackById(region.trackId)!
    console.assert(track !== undefined)
    const waveform=this._editorView.getWaveFormViewById(track.id)!
    console.assert(waveform !== undefined)

    this.doIt(undoable,
      ()=>{
        track.removeRegionById(region.id)
        region.trackId=-1
        track.modified=true
        const view=waveform.getRegionViewById(region.id)!
        console.assert(view !== undefined)
        waveform.removeRegionView(view)
        this.selection.remove(region)
      },
      ()=>{
        this.addRegion(track,region)
      }
    )
  }


  /**
   * Deletes the current selected region and the corresponding view.
   * @private
   */
  private deleteSelectedRegion(undoable:boolean): void {
    if ( this.draggedRegionState )return;
    const toRemove= this.selection.selecteds.map(it=>({region:it, track:it.trackId}))
    this.doIt(undoable,
      ()=>{
        toRemove.forEach(it=>this.removeRegion(it.region))
      },
      ()=>{
        toRemove.forEach(it=>this.addRegion(this._app.tracksController.getTrackById(it.track)!,it.region))
      }
    )
  }

  /**
   * Save a region in the clipboard, the region have to be on a track
   * @param region the saved region
   */
  public copyRegion(region: RegionOf<any>, undoable=false){
    const oldClipboard=this.regionClipboard

    if(region.trackId==-1)return
    const track=this._app.tracksController.getTrackById(region.trackId)
    console.assert(track!=undefined)

    this.doIt(undoable,
      ()=>{
        this.regionClipboard={region: region.clone(), track: track!}
      },
      ()=>{
        this.regionClipboard=oldClipboard
      }
    )

  }

  public cutRegion(region: RegionOf<any>, undoable=false){
    const oldClipboard=this.regionClipboard
    const track=this._app.tracksController.getTrackById(region.trackId)!

    this.doIt(undoable,
      ()=>{
        this.copyRegion(region,false)
        this.removeRegion(region)
      },
      ()=>{
        this.regionClipboard=oldClipboard
        this.addRegion(track,region)
      }
    )
  }

  private cutSelectedRegion() {
    if (this.selection.primary) this.cutRegion(this.selection.primary, true);
  }

  private copySelectedRegion() {
    if (this.selection.primary) this.copyRegion(this.selection.primary, true);
  }

  private pasteRegion(undoable: boolean=false) {
    if (!this.regionClipboard) return;

    const {region}=this.regionClipboard

    // Try to get the selected track as pasting destination
    let track = this._app.tracksController.selectedTrack
    if(track?.deleted)track=null
    // If no track is selected, try to paste in the track from which the region has been copied
    if (!track) track = this.regionClipboard.track
    if(track.deleted)track=null
    // Else, the is nothing we can do
    if(!track)return

    // Paste destination in milliseconds and pixel
    const startinPx = this._app.editorView.playhead.position.x
    const startInMs = this._app.host.playhead;

    // Check if pasted region will be outside the world. If so, do nothing.
    if(startinPx + this.regionClipboard.region.width > this._editorView.worldWidth)return

    const newRegion=this.regionClipboard.region.clone() as RegionOf<any>
    newRegion.start=startInMs

    this.doIt(undoable,
      ()=>{
        this.addRegion(track!,newRegion)

        // move playhead at the end of the newly pasted region
        this._app.host.playhead=newRegion.end
      },
      ()=>{
        this.removeRegion(newRegion)
      }
    )
  }

  /**
   *
   * @returns Splits a region at playhead position, creating two new regions
   * the second is selected and the playhead does not move.
   */
  splitSelectedRegion() {
    if (!this.selection.primary) return
    if (!this.isPlayheadOnSelectedRegion()) return

    let originalRegion = this.selection.primary

    // Get the split position relative to the region start
    const splitPosition = this._app.editorView.playhead.position.x - originalRegion.pos

    // Get the split position in milliseconds
    const splitTime = splitPosition * RATIO_MILLS_BY_PX;

    // Split into two new regions
    let [firstRegion, secondRegion] = originalRegion.split(splitTime);

    let trackId = originalRegion.trackId
    let track = this._app.tracksController.getTrackById(trackId)!

    // Replace the original region by the two new regions
    const firstRegionView= this.addRegion(track,firstRegion)
    const secondRegionView= this.addRegion(track,secondRegion)
    this.removeRegion(originalRegion)
    this.selection.set(secondRegion);

    this._app.undoManager.add({
      undo: ()=> {
        this.removeRegion(firstRegion)
        this.removeRegion(secondRegion)
        this.addRegion(track,originalRegion)
      },
      redo: ()=> {
        this.removeRegion(originalRegion)
        this.addRegion(track,firstRegion)
        this.addRegion(track,secondRegion)
      }
    })
    
  }

  /**
   *
   * @returns Merge the selected region with the previous one if it exists, otherwise do nothing.
   * 
   */
  mergeSelectedRegion() {
    if (!this.selection.primary || this.selection.secondaryCount<=0) return;

    let mainRegion= this.selection.primary;
    let otherRegions= [...this.selection.secondaries]
    let track= this._app.tracksController.getTrackById(mainRegion.trackId)!

    // Merge the regions into a new region
    const newRegion= mainRegion.clone()
    otherRegions.forEach(it=>newRegion.mergeWith(it))

    this.doIt(true,
      ()=>{
        this.addRegion(track,newRegion)
        if(this.selection.primary===mainRegion)this.selection.set(newRegion)

        this.removeRegion(mainRegion)
        otherRegions.forEach(it=>this.removeRegion(it))
      },
      ()=>{
        const isSelected= this.selection.primary===newRegion
        if(isSelected) this.selection.set(null)
        otherRegions.forEach(it=>{
          this.addRegion(track,it)
          if(isSelected) this.selection.add(it)
        })
        this.addRegion(track,mainRegion)
        if(isSelected)this.selection.add(mainRegion)
        this.removeRegion(newRegion)
      }
    )

  }

  isPlayheadOnSelectedRegion() {
    if (!this.selection.primary) return;

    // check if playhead is on the selected region
    const view = this.getView(this.selection.primary)
    const playHeadPosX = this._app.editorView.playhead.position.x
    const selectedRegionPosX = view.position.x
    const selectedRegionWidth = this.selection.primary.width

    return (
      playHeadPosX >= selectedRegionPosX &&
      playHeadPosX <= selectedRegionPosX + selectedRegionWidth
    );
  }
  /**
   * Move the region in the current waveform. If the users move out of the current waveform, it will also
   * change the region to the new waveform.
   *
   * @param e - Pixi event that handle the events details.
   * @private
   */
  private handlePointerMove(e: FederatedPointerEvent): void {
    if (!this.selection.primary || !this._offsetX) return;

    // compute delta since last move. If delta is 0, do nothing
    const delta = e.data.global.x - this.previousMouseXPos;
    this.previousMouseXPos = e.data.global.x;
    if (delta === 0) return;

    let x = e.data.global.x;
    let y = e.data.global.y + this._editorView.viewport.top;

    let newX = x - this._offsetX;
    newX = Math.max(0, Math.min(newX, this._editorView.worldWidth));

    // If reaching end of world, do nothing
    const view = this.getView(this.selection.primary)
    const regionEndPos = newX + view.width;

    if (regionEndPos >= this._editorView.worldWidth || newX <= 0) {
      return;
    }

    // check if snapping is needed
    if (
      this._editorView.snapping &&
      !this.snappingDisabled &&
      !this.scrollingLeft &&
      !this.scrollingRight
    ) {
      // snapping, using cell-size
      const cellSize = this._editorView.cellSize;
      newX = Math.round(newX / cellSize) * cellSize;
    }

    let parentWaveform = view.parent as WaveformView;
    let parentTop = parentWaveform.y;
    let parentBottom = parentTop + parentWaveform.height;

    // Check if the region is moved out of its current track
    let targetTrackId= this.selection.primary.trackId
    if(y>parentBottom && !this._app.waveformController.isLast(parentWaveform)){
      targetTrackId = this._app.waveformController.getNextWaveform(parentWaveform)?.trackId ?? targetTrackId
    }
    else if(y<parentTop && !this._app.waveformController.isFirst(parentWaveform)){
      targetTrackId = this._app.waveformController.getPreviousWaveform(parentWaveform)?.trackId ?? targetTrackId
    }

    // Move the region
    const newTrack=this._app.tracksController.getTrackById(targetTrackId)!
    this.moveRegion(this.selection.primary, newTrack, newX)

    this.checkIfScrollingNeeded(e.data.global.x);
  }

  /**
   * Check if scrolling is needed when moving a region.
   * @private
   */
  checkIfScrollingNeeded(mousePosX: number) {
    if (!this.selection.primary || !this._offsetX) return

    const view= this.getView(this.selection.primary)

    // scroll viewport if the right end of the moving  region is close
    // to the right or left edge of the viewport, or left edge of the region close to left edge of viewxport
    // (and not 0 or end of viewport)
    // scroll smoothly the viewport if the region is dragged to the right or left
    // when a region is dragged to the right or to the left, we start scrolling
    // when the right end of the region is close to the right edge of the viewport or
    // when the left end of the region is close to the left edge of the viewport
    // "close" means at a distance of SCROLL_TRIGGER_ZONE_WIDTH pixels from the edge

    // scroll parameters
    const SCROLL_TRIGGER_ZONE_WIDTH = 50;
    const MIN_SCROLL_SPEED = 1;
    const MAX_SCROLL_SPEED = 10;

    const regionEndPos = this.selection.primary.pos + view.width;

    const regionStartPos = this.selection.primary.pos;
    let viewport = this._editorView.viewport;
    const viewportWidth = viewport.right - viewport.left;

    const distanceToRightEdge = viewportWidth - (regionEndPos - viewport.left);

    this.scrollingRight =
      mousePosX >= viewportWidth - SCROLL_TRIGGER_ZONE_WIDTH;

    if (this.scrollingRight && regionEndPos <= this._editorView.worldWidth) {
      // when scrolling right, distanceToRightEdge will be considered when in [50, -50] and will map to scroll speed
      // to the right between 1 and 10
      this.incrementScrollSpeed = this.map(
        distanceToRightEdge,
        SCROLL_TRIGGER_ZONE_WIDTH,
        -SCROLL_TRIGGER_ZONE_WIDTH,
        MIN_SCROLL_SPEED,
        MAX_SCROLL_SPEED
      );
    }

    const distanceToLeftEdge = viewport.left - regionStartPos;

    /*this.scrollingLeft =
      !this.selectedRegionStartOutsideViewport &&
      regionStartPos < viewport.left + SCROLL_TRIGGER_ZONE_WIDTH &&
      viewport.left > 0;
      */

    this.scrollingLeft =
      mousePosX <= SCROLL_TRIGGER_ZONE_WIDTH && regionStartPos > 0;

    if (this.scrollingLeft) {
      // when scrolling right, distanceToRightEdge will be considered when in [50, -50] and will map to scroll speed
      // to the right between 1 and 10
      // MB : need to adjust the mapping function here !
      this.incrementScrollSpeed = this.map(
        distanceToLeftEdge,
        -SCROLL_TRIGGER_ZONE_WIDTH,
        SCROLL_TRIGGER_ZONE_WIDTH,
        MIN_SCROLL_SPEED,
        MAX_SCROLL_SPEED
      );
    }
  }

  // maps a value from [istart, istop] into [ostart, ostop]
  map(
    value: number,
    istart: number,
    istop: number,
    ostart: number,
    ostop: number
  ) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  }

  viewportAnimationLoop() {
    if (!this.selection.primary || !this._offsetX) return

    const view= this.getView(this.selection.primary)

    let viewScrollSpeed = 0;
    if (this.scrollingRight) {
      viewScrollSpeed = this.incrementScrollSpeed;
      this._offsetX -= viewScrollSpeed;
    } else if (this.scrollingLeft) {
      viewScrollSpeed = -this.incrementScrollSpeed;
      this._offsetX -= viewScrollSpeed;
    }

    // if needed scroll smoothly the viewport to left or right
    if (this.scrollingRight || this.scrollingLeft) {
      let viewport = this._editorView.viewport;

      viewport.left += viewScrollSpeed;
      // move also region and region view
      if (view.position.x + viewScrollSpeed < 0) return;

      // adjust region start
      this.selection.primary.start += viewScrollSpeed * RATIO_MILLS_BY_PX;
      view.position.x += viewScrollSpeed;;

      // adjust horizontal scrollbar so that it corresponds to the current viewport position
      // scrollbar pos depends on the left position of the viewport.
      const horizontalScrollbar = this._editorView.horizontalScrollbar;
      horizontalScrollbar.moveTo(viewport.left);

      // if scrolling left and viewport.left < 0, stop scrolling an put viewport.left to 0
      if (this.scrollingLeft && viewport.left < 0) {
        viewport.left = 0;
        this.scrollingLeft = false;
      }
      // if scrolling right and viewport.right > worldWidth, stop scrolling and put viewport.right to worldWidth
      if (this.scrollingRight && viewport.right > this._editorView.worldWidth) {
        viewport.right = this._editorView.worldWidth;
        this.scrollingRight = false;
      }
    }
    requestAnimationFrame(this.viewportAnimationLoop.bind(this));
  }

  /**
   * If the region was moving, it stops the move and update the track buffer. If the region is in a new tracks,
   * it will modify the old track and the new one.
   * @private
   */
  private handlePointerUp(): void {
    cancelAnimationFrame(this.viewportAnimationLoopId);
    if(!this.draggedRegionState)return


    this.scrollingLeft = false;
    this.scrollingRight = false;

    let oldTrack = this._app.tracksController.getTrackById(this.draggedRegionState!.initialTrackId)!
    let newTrack = this._app.tracksController.getTrackById(this.draggedRegionState.region!.trackId)!

    const oldX = this.draggedRegionState.initialPos
    const newX = this.draggedRegionState.region.pos
    const region = this.draggedRegionState.region

    if(oldTrack.id!=newTrack.id || oldX!=newX){
      this.doIt(true,
        ()=> this.moveRegion(region, newTrack, newX),
        ()=> this.moveRegion(region, oldTrack, oldX),
      )
    }

    this.draggedRegionState = undefined;
  }

}
