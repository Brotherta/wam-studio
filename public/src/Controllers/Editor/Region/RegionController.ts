import { FederatedPointerEvent } from "pixi.js";
import App from "../../../App.js";
import { RATIO_MILLS_BY_PX } from "../../../Env";
import RegionOf from "../../../Models/Region/Region";
import SampleTrack from "../../../Models/Track/SampleTrack.js";
import Track from "../../../Models/Track/Track.js";
import EditorView from "../../../Views/Editor/EditorView.js";
import RegionView from "../../../Views/Editor/Region/RegionView";
import WaveformView from "../../../Views/Editor/WaveformView.js";
import { audioCtx } from "../../../index";
import { TrackList } from "../Track/TracksController.js";

/**
 * Class that control the regions of the editor.
 */
export default abstract class RegionController<REGION extends RegionOf<REGION>, VIEW extends RegionView<REGION>> {

  /**
   * Number of region that is incremented for each time a region is created.
   */
  public regionIdCounter: number;

  /** Route Application. */
  protected _app: App;

  /** Editor's Application of PIXI.JS. */
  protected _editorView: EditorView;

  /** The selected region and its view */
  protected _selectedRegion: {region:REGION,view:VIEW}|undefined=undefined

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
  protected draggedRegionState: {region:REGION, initialPos:number, initialTrackId:number}|undefined=undefined

  protected oldTrackWhenMoving!: SampleTrack;
  protected newTrackWhenMoving!: SampleTrack;

  /* For copy-paste region */
  private regionClipboard: {region: REGION, track: Track<REGION>}

  // scroll smoothly viewport left or right
  scrollingRight: boolean = false;
  scrollingLeft: boolean = false;
  incrementScrollSpeed: number = 0;
  viewportAnimationLoopId: number = 0;
  selectedRegionEndOutsideViewport: boolean = false;
  selectedRegionStartOutsideViewport: boolean = false;

  constructor(app: App) {
    this._app = app;
    this._editorView = app.editorView;
    this.regionIdCounter = 0;

    this.bindEvents();
  }

  protected abstract _regionViewFactory(region: REGION, waveform: WaveformView): VIEW

  protected abstract _dummyRegion(track: Track<REGION>, start: number, id: number, duration?: number): REGION

  protected abstract _tracks(): TrackList<REGION,Track<REGION>>

  /**
   * Adds a region to the track and the corresponding view in the waveform.
   * @param track - The track where to add the region.
   * @param region - The region to add.
   * @param waveform - The waveform where to add the region. If not given, the waveform will be search using the ID of the track.
   */
  public createRegion(track: Track<REGION>, region_factory: (id:number)=>REGION, waveform?: WaveformView): [REGION,VIEW]{
    let region=region_factory(this.getNewId())
    return [region,this.addRegion(track,region,waveform)]
  }

  /**
   * Adds a region to the track and the corresponding view in the waveform.
   * @param track - The track where to add the region.
   * @param region - The region to add.
   * @param waveform - The waveform where to add the region. If not given, the waveform will be search using the ID of the track.
   */
  public addRegion(track: Track<REGION>, region: REGION, waveform?: WaveformView): VIEW{
    waveform ??= this._editorView.getWaveFormViewById(track.id)!
    region.trackId=track.id
    let regionView = this._regionViewFactory(region,waveform)
    this.bindRegionEvents(region, regionView)
    track.addRegion(region)
    regionView.initializeRegionView(track.color, region)
    waveform.addChild(regionView)
    waveform.regionViews.push(regionView)
    return regionView
  }

  /**
   * Creates a temporary region. The region is only visual, and has no event bound.
   * It will create a placeholder buffer.
   *
   * @param track - The track where to create the new region.
   * @param start - The time in milliseconds where the region should start.
   */
  public createTemporaryRegion(track: Track<REGION>, start: number): REGION {
    const region=this._dummyRegion(track,start,this.getNewId(),)
    this.addRegion(track,region)

    //let waveformView = this._editorView.getWaveFormViewById(track.id)!
    //const view=this._regionViewFactory(region,waveformView)
    //track.addRegion(region)

    return region;
  }

  /**
   * Move a region to a track by removing it from the previous track and adding it to the new track.
   * @param region The region to move
   * @param newTrack The track where to move the region
   * @param newX An optional new position for the region
   * @returns 
   */
  public moveRegion(region: REGION, newTrack: Track<REGION>, newX?: number){
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
      const selected = this._selectedRegion?.region===region

      // Remove the region view in the old track
      this.removeRegion(region);

      // Create a new region view of the same region in the new track
      const newview=this.addRegion(newTrack,region)

      if(selected)this.selectRegion(newview)
    }

  }

  /**
   * Updates a temporary region with the new buffer.
   *
   * @param region - The temporary region tu update.
   * @param track - The track where the region is.
   * @param buffer - The new buffer for the region.
   */
  public updateTemporaryRegion(region: REGION, track: Track<REGION>, added: REGION) {
    const waveformView = this._editorView.getWaveFormViewById(track.id)!;
    const regionView = waveformView.getRegionViewById(region.id)!;
    region.mergeWith(added)
    regionView.initializeRegionView(track.color, region)
    this._tracks().getById(track.id)!.modified=true
  }

  /**
   * Updates the last piece of buffer in the region buffer and create the associated region view.
   * Then it binds the region view events and add the new region.
   *
   * @param region - The temporary region tu update.
   * @param track - The track where the region is.
   * @param buffer - The new buffer for the region.
   */
  public renderTemporaryRegion(region: REGION, track: Track<REGION>, buffer: REGION) {
    const latency = this._app.host.latency;
    if (region.start - latency < 0) {
      let diff = region.start - latency;
      if (diff >= 0) {
        region.start = 0;
      }
      else {
        diff = -diff;
        region = region.split(diff, this.getNewId(), this.getNewId())[1]
      }
    } else {
      region.start -= latency;
    }
    this.updateTemporaryRegion(region, track, buffer);
    //track.addRegion(region);
  }

  /**
   * Get the maximum duration of all the regions in the editor.
   *
   * @returns The maximum duration of all the regions in the editor in seconds.
   */
  public getMaxDurationRegions(): number {
    let maxTime = 0;
    for (let track of this._tracks()) {
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
  bindRegionEvents(region: REGION, regionView: VIEW): void {
    regionView.on("pointerdown", (_e) => {
      this.handlePointerDown(regionView);
      this._offsetX = _e.data.global.x - regionView.position.x;
      // select the track that corresponds to the clicked region
      let track = this._tracks().getById(region.trackId);
      if (track) this._app.pluginsController.selectTrack(track);
    });
    regionView.on("pointerup", () => this.handlePointerUp());
    regionView.on("pointerupoutside", () => this.handlePointerUp() );
  }


  /**
   * Binds on initialisation the events related to the playhead : pointerdown, pointerup, pointermove and so on...
   * @private
   */
  private bindEvents(): void {
    document.addEventListener("keyup", (e) => {
      this.snappingDisabled = e.shiftKey;
    });

    document.addEventListener("keydown", (e) => {
      // If the user is typing in an input, we don't want to trigger the keyboard shortcuts
      if (e.target != document.body) return;

      // On escape key pressed, deselect the selected waveform.
      if (e.key === "Escape") {
        this.selectRegion(null);
      }

      // On delete key pressed, delete the selected region.
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        this._selectedRegion !== undefined
      ) {
        this.deleteSelectedRegion(true);
      }

      // for "disabling temporarily the grid snapping if shift is pressed"
      if (e.shiftKey) {
        this.snappingDisabled = true;
      }

      // split a region at playhead position
      if (
        (e.key === "S" || e.key === "s") &&
        this._selectedRegion !== undefined
      ) {
        this.splitSelectedRegion();
      }

      // MB: not sure that this is the proper way do handle
      // keyboard shortcuts for copy/cut/paste
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "x":
            this.cutSelectedRegion();
            break;
          case "c":
            this.copySelectedRegion();
            break;
          case "v":
            this.pasteRegion(true);
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
  private handlePointerDown(regionView: VIEW): void {
    this.viewportAnimationLoopId = requestAnimationFrame(
      this.viewportAnimationLoop.bind(this)
    );
    this.selectRegion(regionView);
    if (this._selectedRegion) {
      // useful for avoiding scrolling with large regions
      this.selectedRegionEndOutsideViewport =
        this._selectedRegion.view.position.x + this._selectedRegion.view.width > this._editorView.viewport.right

      this.selectedRegionStartOutsideViewport =
        this._selectedRegion.view.position.x < this._editorView.viewport.left;

      // Useful for undo/redo
      this.draggedRegionState = {...this._selectedRegion, initialPos: this._selectedRegion.region.pos, initialTrackId: this._selectedRegion.region.trackId};
    }
  }

  /**
   * Select a region view or nothing and unselect the previous one if there is one.
   * @param region - The region to select or null to just unselect the current one.
   * @private
   */
  private selectRegion(view: VIEW|null){
    if (this._selectedRegion !== undefined) {
      this._selectedRegion.view.deselect();
      this._selectedRegion = undefined;
    }
    if (view) {
      const region=this._tracks().getById(view.trackId) ?.getRegionById(view.id)!
      console.assert(region!==undefined)
      this._selectedRegion = {view, region};
      this._selectedRegion.view.select();
    }
  }


  public removeRegion(region: REGION, undoable=false){
    const track=this._tracks().getById(region.trackId)!
    console.assert(track !== undefined)
    const waveform=this._editorView.getWaveFormViewById(track.id)!
    console.assert(waveform !== undefined)
    const view=waveform.getRegionViewById(region.id)! as VIEW
    console.assert(view !== undefined)

    this.doIt(undoable,
      ()=>{
        track.removeRegionById(region.id)
        region.trackId=-1
        track.modified=true
        waveform.removeRegionView(view)
        if(this._selectedRegion?.region===region)this.selectRegion(null)
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
    if ( !this._selectedRegion || this.draggedRegionState )return;
    this.removeRegion(this._selectedRegion.region,undoable)
  }

  /**
   * Save a region in the clipboard, the region have to be on a track
   * @param region the saved region
   */
  public copyRegion(region: REGION, undoable=false){
    const oldClipboard=this.regionClipboard

    if(region.trackId==-1)return
    const track=this._tracks().getById(region.trackId)
    console.assert(track!=undefined)

    this.doIt(undoable,
      ()=>{
        this.regionClipboard={region: region.clone(this.getNewId()), track: track!}
      },
      ()=>{
        this.regionClipboard=oldClipboard
      }
    )

  }

  public cutRegion(region: REGION, undoable=false){
    const oldClipboard=this.regionClipboard
    const track=this._tracks().getById(region.trackId)!

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
    if (this._selectedRegion) this.cutRegion(this._selectedRegion.region, true);
  }

  private copySelectedRegion() {
    if (this._selectedRegion) this.copyRegion(this._selectedRegion.region, true);
  }

  private pasteRegion(undoable: boolean=false) {
    if (!this.regionClipboard) return;

    const {region}=this.regionClipboard

    // Try to get the selected track as pasting destination
    let track: Track<REGION> | undefined = this._app.tracksController.selectedTrack
    if(track?.deleted)track=undefined
    // If no track is selected, try to paste in the track from which the region has been copied
    if (!track) track = this.regionClipboard.track
    if(track.deleted)track=undefined
    // Else, the is nothing we can do
    if(!track)return

    // Paste destination in milliseconds and pixel
    const startinPx = this._app.editorView.playhead.position.x
    const startInMs = this._app.host.playhead * 1000 / audioCtx.sampleRate;

    // Check if pasted region will be outside the world. If so, do nothing.
    if(startinPx + this.regionClipboard.region.width > this._editorView.worldWidth)return

    const newRegion=this.regionClipboard.region.clone(this.getNewId())
    newRegion.start=startInMs

    this.doIt(undoable,
      ()=>{
        this.addRegion(track!,newRegion)

        // move playhead at the end of the newly pasted region
        this._app.tracksController.jumpTo(newRegion.endpos);
        this._app.editorView.playhead.moveToFromPlayhead(this._app.host.playhead);
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
    if (!this._selectedRegion) return;
    if (!this.isPlayheadOnSelectedRegion()) return

    let originalRegion = this._selectedRegion.region;

    // Get the split position relative to the region start
    const splitPosition = this._app.editorView.playhead.position.x - originalRegion.pos

    // Get the split position in milliseconds
    const splitTime = splitPosition * RATIO_MILLS_BY_PX;

    // Split into two new regions
    let [firstRegion, secondRegion] = originalRegion.split(splitTime, this.getNewId(), this.getNewId());

    let trackId = originalRegion.trackId
    let track = this._tracks().getById(trackId)!

    // Replace the original region by the two new regions
    const firstRegionView= this.addRegion(track,firstRegion)
    const secondRegionView= this.addRegion(track,secondRegion)
    this.removeRegion(originalRegion)
    this.selectRegion(secondRegionView);

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
    if (!this._selectedRegion) return;

    let rightRegion = this._selectedRegion.region;
    let track=this._tracks().getById(rightRegion.trackId)!

    // Find the previous region
    let leftRegion = null
    let leftRegionEnd = -1
    for(const candidate of track.regions){
      if(candidate.end<=rightRegion.start && candidate.end>leftRegionEnd){
        leftRegion=candidate
        leftRegionEnd=candidate.end
      }
    }
    console.log(leftRegion)
    if(!leftRegion)return
    let leftRegionView=this._editorView.getWaveFormViewById(track.id)?.getRegionViewById(leftRegion.id)! as VIEW
    console.assert(leftRegionView!==undefined)

    // Create a padding region
    const padding_length=rightRegion.start-leftRegion.end
    let padding
    if(padding_length>1)padding=this._dummyRegion(track,leftRegion.end,this.getNewId(),padding_length)
    else padding=null

    // Merge the two regions
    if(padding)leftRegion.mergeWith(padding)
    leftRegion.mergeWith(rightRegion)

    leftRegionView.initializeRegionView(track.color, leftRegion)
    this._tracks().getById(track.id)!.modified=true

    if(this._selectedRegion?.region===rightRegion)this.selectRegion(leftRegionView)

    this.removeRegion(rightRegion)
  }

  isPlayheadOnSelectedRegion() {
    if (!this._selectedRegion) return;

    // check if playhead is on the selected region
    const playHeadPosX = this._app.editorView.playhead.position.x;
    const selectedRegionPosX = this._selectedRegion.view!.position.x;
    const selectedRegionWidth = this._selectedRegion.region.width

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
    if (!this._selectedRegion || !this._offsetX)
      return;

    // compute delta since last move. If delta is 0, do nothing
    const delta = e.data.global.x - this.previousMouseXPos;
    this.previousMouseXPos = e.data.global.x;
    if (delta === 0) return;

    let x = e.data.global.x;
    let y = e.data.global.y + this._editorView.viewport.top;

    let newX = x - this._offsetX;
    newX = Math.max(0, Math.min(newX, this._editorView.worldWidth));
    console.log(newX)

    // If reaching end of world, do nothing
    const regionEndPos = newX + this._selectedRegion.view.width;

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

    let parentWaveform = this._selectedRegion.view.parent as WaveformView;
    let parentTop = parentWaveform.y;
    let parentBottom = parentTop + parentWaveform.height;

    // Check if the region is moved out of its current track
    let targetTrackId=this._selectedRegion.region.trackId
    if(y>parentBottom && !this._app.waveformController.isLast(parentWaveform)){
      targetTrackId = this._app.waveformController.getNextWaveform(parentWaveform)?.trackId ?? targetTrackId
    }
    else if(y<parentTop && !this._app.waveformController.isFirst(parentWaveform)){
      targetTrackId = this._app.waveformController.getPreviousWaveform(parentWaveform)?.trackId ?? targetTrackId
    }

    // Move the region
    const newTrack=this._tracks().getById(targetTrackId)!
    this.moveRegion(this._selectedRegion.region,newTrack,newX)

    this.checkIfScrollingNeeded(e.data.global.x);
  }

  /**
   * Check if scrolling is needed when moving a region.
   * @private
   */
  checkIfScrollingNeeded(mousePosX: number) {
    if (!this._selectedRegion || !this._offsetX)
      return;
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

    const regionEndPos =
      this._selectedRegion.region.pos + this._selectedRegion.view.width;

    const regionStartPos = this._selectedRegion.region.pos;
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
    if (!this._selectedRegion || !this._offsetX)
      return;

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
      if (this._selectedRegion.view.position.x + viewScrollSpeed < 0) return;

      // adjust region start
      this._selectedRegion.region.start += viewScrollSpeed * RATIO_MILLS_BY_PX;
      this._selectedRegion.view.position.x += viewScrollSpeed;;

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

    let oldTrack = this._tracks().getById(this.draggedRegionState!.initialTrackId)!
    let newTrack = this._tracks().getById(this.draggedRegionState.region!.trackId)!

    const oldX = this.draggedRegionState.initialPos
    const newX = this.draggedRegionState.region.pos
    const region = this.draggedRegionState.region

    this.moveRegion(region, newTrack, newX);

    this._app.undoManager.add({
      undo: ()=> this.moveRegion(region, oldTrack, oldX),
      redo: ()=> this.moveRegion(region, newTrack, newX)
    })

    this.draggedRegionState = undefined;
  }

  /**
   * Do something once, and if undoable is true, save the do and undo functions in the undo manager.
   * todo is called, and if undoable id true, todo and undo are added to the undoManager respectively as redo and undo
   * @param undoable Is the action saved in the undo manager
   * @param todo The todo and redo function, called once and then saved as a redo function if undoable is true
   * @param undo The undo function, it should cancel what do did, it is save in the undo manager if undoable is true
   */
  doIt(undoable: boolean, todo: ()=>void, undo: ()=>void){
    todo()
    if(undoable){

      // to disable/enable undo/redo buttons if undo/redo is available
      const refreshButtons= ()=>{
        this._app.hostView.setUndoButtonState(this._app.undoManager.hasUndo())
        this._app.hostView.setRedoButtonState(this._app.undoManager.hasRedo())
      }

      this._app.undoManager.add({
        undo: ()=>{
          undo()
          refreshButtons()
        },
        redo: ()=>{
          todo()
          refreshButtons()
        }
      })
      refreshButtons()
    }

    
  }

}
