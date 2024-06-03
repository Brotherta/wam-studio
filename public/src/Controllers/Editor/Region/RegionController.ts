import { FederatedPointerEvent } from "pixi.js";
import App from "../../../App.js";
import { RATIO_MILLS_BY_PX } from "../../../Env";
import SampleTrack from "../../../Models/Track/SampleTrack.js";
import EditorView from "../../../Views/Editor/EditorView.js";
import RegionView from "../../../Views/Editor/Region/RegionView";
import WaveformView from "../../../Views/Editor/WaveformView.js";
import { audioCtx } from "../../../index";
import SampleRegion from "../../../Models/Region/SampleRegion";
import Track from "../../../Models/Track/Track.js";
import { TrackList } from "../Track/TracksController.js";
import RegionOf, { Region } from "../../../Models/Region/Region.js";
import { trimCache } from "puppeteer";
import TrackOf from "../../../Models/Track/Track.js";

/**
 * Class that control the regions of the editor.
 */
export default abstract class RegionController<REGION extends Region, VIEW extends RegionView<REGION>> {

  /**
   * Number of region that is incremented for each time a region is created.
   */
  public regionIdCounter: number;

  /** Route Application. */
  protected _app: App;

  /** Editor's Application of PIXI.JS. */
  protected _editorView: EditorView;

  /** Is if the selected region is being moved? */
  protected _isMovingRegion: boolean;

  /** The region view of the selected region */
  protected _selectedRegionView: VIEW | undefined;

  /** The selected region */
  protected _selectedRegion: REGION | undefined;

  /**
   * The offset on X axis when a region is moved.
   * Represents the position on the region view itself, where the user clicked.
   */
  protected _offsetX: number;

  /* Clipboard for the pasted region, used for copy/cut/paste */
  protected clipBoardRegion: REGION;

  /* for disabling snapping is shift key is pressed and global snapping enabled */
  protected snappingDisabled: boolean = false;

  /* for computing delta between two pointermove events */
  protected previousMouseXPos: number = 0;

  /* For undo/redo when moving a region */
  protected dragRegionStartX: number = 0;

  /** The region view of the dragged region */
  protected draggedRegionView!: VIEW;

  /** The region that is currently dragged */
  protected draggedRegion!: REGION;

  protected oldTrackWhenMoving!: SampleTrack;
  protected newTrackWhenMoving!: SampleTrack;

  /* For undo/redo when cutting a region */
  private regionStack: {
    region: REGION;
    regionView: VIEW;
    track: Track<REGION>;
  }[] = [];

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
    this._isMovingRegion = false;

    this.bindEvents();
  }

  protected abstract _regionViewFactory(region: REGION, waveform: WaveformView): VIEW

  protected abstract _dummyRegion(track: Track<REGION>, start: number, id: number): REGION

  protected abstract _tracks(): TrackList<REGION,any>

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
    console.log("waveform",waveform.getRegionViewById(region.id))
    waveform.addChild(regionView)
    waveform.regionViews.push(regionView)
    console.log("waveform",waveform.getRegionViewById(region.id))
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
    const region=this._dummyRegion(track,start,this.getNewId())
    this.addRegion(track,region)

    //let waveformView = this._editorView.getWaveFormViewById(track.id)!
    //const view=this._regionViewFactory(region,waveformView)
    //track.addRegion(region)

    return region;
  }

  /**
   * Updates a temporary region with the new buffer.
   *
   * @param region - The temporary region tu update.
   * @param track - The track where the region is.
   * @param buffer - The new buffer for the region.
   */
  public updateTemporaryRegion(region: REGION, track: Track<REGION>, added: REGION) {
    if(this._selectedRegion){
      added=this._selectedRegion
    }

    const waveformView = this._editorView.getWaveFormViewById(track.id)!;
    const regionView = waveformView.getRegionViewById(region.id)!;
    region.mergeWith(added)
    regionView.initializeRegionView(track.color, region)
    this._app.tracksController.getTrackById(track.id)!.update(audioCtx, this._app.host.playhead);
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

        let end = region.start / 1000 + region.duration;
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
      this._isMovingRegion = true;
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
        this._selectedRegionView !== undefined
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
        this._selectedRegionView !== undefined
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
            this.pasteRegion();
            break;
        }
      }
    });
    // handle moving a region on the PIXI Canvas.
    this._editorView.viewport.on("pointermove", (e) => {
      if (this._isMovingRegion) {
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
    if (this._selectedRegionView) {
      // useful for avoiding scrolling with large regions
      this.selectedRegionEndOutsideViewport =
        this._selectedRegionView.position.x + this._selectedRegionView.width >
        this._editorView.viewport.right;
      this.selectedRegionStartOutsideViewport =
        this._selectedRegionView.position.x < this._editorView.viewport.left;

      // Useful for undo/redo
      this.dragRegionStartX = this._selectedRegionView.position.x;
      this.draggedRegion = this._selectedRegion!;
      this.draggedRegionView = this._selectedRegionView;
    }
  }

  /**
   * Select a region view or nothing and unselect the previous one if there is one.
   * @param region - The region to select or null to just unselect the current one.
   * @private
   */
  private selectRegion(region: VIEW|null){
    if (this._selectedRegionView !== undefined) {
      this._selectedRegionView.deselect();
      this._selectedRegionView = undefined;
      this._selectedRegion = undefined;
    }
    if (region) {
      this._selectedRegionView = region;
      this._selectedRegionView.select();
      this._selectedRegion = this._app.tracksController .getTrackById(region.trackId) ?.getRegionById(region.id)!;
    }
  }

  /**
   * Deletes the current selected region and the corresponding view.
   *
   * @private
   */
  private deleteSelectedRegion(undoable:boolean): void {
    if ( !this._selectedRegionView || !this._selectedRegion || this._isMovingRegion )return;

    let waveform = this._selectedRegionView.parent as WaveformView;
    let track = this._app.tracksController.getTrackById(this._selectedRegion.trackId);
    if (track === undefined) throw new Error("Track not found");

    if (undoable) {
      // for undo/redo
      this.addLastDeleteToUndoManager(
        this._selectedRegion!,
        this._selectedRegionView!,
        track
      );
    }

    track.removeRegionById(this._selectedRegion.id);
    waveform.removeRegionView(this._selectedRegionView);
    this.selectRegion(null);

    track.modified = true;
    track.update(audioCtx, this._app.host.playhead);
  }

  private cutSelectedRegion() {
    if (!this._selectedRegionView || !this._selectedRegion) return;

    // for undo/redo
    this.addLastCutToUndoManager(
      this._selectedRegion!,
      this._selectedRegionView!,
      this._app.tracksController.getTrackById(this._selectedRegion!.trackId)!
    );

    // do the cut
    this.copySelectedRegion();
    this.deleteSelectedRegion(true);
  }

  private copySelectedRegion() {
    if (!this._selectedRegion) return;
    this.clipBoardRegion = this._selectedRegion.clone(this.getNewId());
    console.log("Region copied in the clipboard !");
  }

  private pasteRegion() {
    if (!this.clipBoardRegion) return;
    // get the id of the selected track. This where we're going to paste the
    // region in the clipboard. We're using _selectedRegionView.trackId as the
    // current selected track might be different from the one we copied the region
    let track: Track<REGION> | undefined = this._app.tracksController.selectedTrack;
    if (!track) {
      // There is no selected track, consider that the track we're going to paste
      // the region in is the same track we copied the region from
      track = this._app.tracksController.getTrackById(this.clipBoardRegion.trackId);
    }

    const trackId = track!.id;
    const startInMs = (this._app.host.playhead / audioCtx.sampleRate) * 1000;

    // if startInMs + region width > worldWidth do nothing
    // (region will be outside viewport)
    const rWidth = (this.clipBoardRegion.duration * 1000) / RATIO_MILLS_BY_PX;
    // pos of playhead in pixels
    const playheadPos = this._app.editorView.playhead.position.x;

    const regionEndPos = playheadPos + rWidth;
    if (regionEndPos >= this._editorView.worldWidth) return;

    const id = this.clipBoardRegion.id;

    const [newRegion,newRegionView]=this.createRegion(track!,id=>this.clipBoardRegion!.cloneWith(id, {start:startInMs}))

    // move playhead at the end of the newly pasted region
    this._app.host.playhead += newRegion.duration * audioCtx.sampleRate;
    this._app.editorView.playhead.moveToFromPlayhead(this._app.host.playhead);
    this._app.tracksController.jumpTo(newRegion.end);

    // for undo/redo
    this.addLastPasteToUndoManager(newRegion, newRegionView, track!);
  }

  /**
   *
   * @returns Splits a region at playhead position, creating two new regions
   * the second is selected and the playhead does not move.
   */
  splitSelectedRegion() {
    if (!this._selectedRegion) return;

    // if playhead not "on" the selected region, do nothing
    if (!this.isPlayheadOnSelectedRegion()) return;

    // Store original region and original region view
    let originalRegion = this._selectedRegion;
    let originalRegionView = this._selectedRegionView;

    // select nb pixels from start of region to playhead
    const playHeadPosX = this._app.editorView.playhead.position.x;
    const startOfRegionX = this._selectedRegionView?.position.x;
    const nbPixels = playHeadPosX - startOfRegionX!;

    // convert it in samples
    const splitPoint = nbPixels * RATIO_MILLS_BY_PX;

    let [firstRegion, secondRegion] = originalRegion.split(splitPoint, this.getNewId(), this.getNewId());
    console.log("firstRegion",firstRegion.start, firstRegion.duration)
    console.log("secondRegion",secondRegion.start, secondRegion.duration)
    // Makes two new regions

    // make a new region from the left part of the audio buffer (according to playhead position),
    // with start the same as selected region
    // duration/2, track will be the same track as original region
    let leftRegionStart = this._selectedRegion.start;
    let trackId = this._selectedRegion.trackId;
    let track = this._app.tracksController.getTrackById(trackId)!;

    const firstView=this.addRegion(track,firstRegion)
    const secondView=this.addRegion(track,secondRegion)
    
    // delete original region
    this.deleteSelectedRegion(false);
    
    // create new views from the two new regions and add them to the waveformView of the track
    let waveformView = this._editorView.getWaveFormViewById(trackId);

    // select right region
    this.selectRegion(secondView);

    // update the track buffer, as the regions have been modified
    track?.update(audioCtx, this._app.host.playhead);

    // for undo/redo
    
    this.addSplitToUndoManager(
      originalRegion,
      originalRegionView!,
      firstRegion,
      firstView,
      secondRegion,
      secondView,
      track!,
    );
    
  }

  isPlayheadOnSelectedRegion() {
    if (!this._selectedRegion) return;

    // check if playhead is on the selected region
    const playHeadPosX = this._app.editorView.playhead.position.x;
    const selectedRegionPosX = this._selectedRegionView!.position.x;
    const selectedRegionWidth =
      (this._selectedRegion.duration * 1000) / RATIO_MILLS_BY_PX;

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
    if (!this._selectedRegionView || !this._selectedRegion || !this._offsetX)
      return;

    // compute delta since last move. If delta is 0, do nothing
    const delta = e.data.global.x - this.previousMouseXPos;
    this.previousMouseXPos = e.data.global.x;
    if (delta === 0) return;

    let x = e.data.global.x;
    let y = e.data.global.y + this._editorView.viewport.top;

    let newX = x - this._offsetX;
    newX = Math.max(0, Math.min(newX, this._editorView.worldWidth));

    // If reaching end of world, do nothing
    const regionEndPos = newX + this._selectedRegionView.width;

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

    let parentWaveform = this._selectedRegionView.parent as WaveformView;
    let parentTop = parentWaveform.y;
    let parentBottom = parentTop + parentWaveform.height;

    if (
      y > parentBottom &&
      !this._app.waveformController.isLast(parentWaveform)
    ) {
      // if the waveform is dragged to the bottom of the screen
      let nextWaveform =
        this._app.waveformController.getNextWaveform(parentWaveform);
      if (nextWaveform) {
        this.updateRegionWaveform(parentWaveform, nextWaveform);
      }
    } else if (
      y < parentTop &&
      !this._app.waveformController.isFirst(parentWaveform)
    ) {
      // if the waveform is dragged to the top of the screen
      let previousWaveform =
        this._app.waveformController.getPreviousWaveform(parentWaveform);
      if (previousWaveform) {
        this.updateRegionWaveform(parentWaveform, previousWaveform);
      }
    }
    this._selectedRegionView.position.x = newX;
    // in ms
    this._selectedRegion.start = newX * RATIO_MILLS_BY_PX;

    this.checkIfScrollingNeeded(e.data.global.x);
  }

  /**
   * Check if scrolling is needed when moving a region.
   * @private
   */
  checkIfScrollingNeeded(mousePosX: number) {
    console.log("mousePosX = " + mousePosX);
    if (!this._selectedRegionView || !this._selectedRegion || !this._offsetX)
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
      this._selectedRegion.pos + this._selectedRegionView.width;

    //if (regionEndPos >= this._editorView.viewport.right) return;

    const regionStartPos = this._selectedRegion.pos;
    let viewport = this._editorView.viewport;
    const viewportWidth = viewport.right - viewport.left;

    const distanceToRightEdge = viewportWidth - (regionEndPos - viewport.left);

    /*
    this.scrollingRight =
      !this.selectedRegionEndOutsideViewport &&
      regionEndPos - viewport.left >= viewportWidth - SCROLL_TRIGGER_ZONE_WIDTH;
*/
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

    //console.log("distanceToRightEdge = " + distanceToRightEdge);
    const distanceToLeftEdge = viewport.left - regionStartPos;
    //console.log("distanceToLeftEdge = " + distanceToLeftEdge);

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
    if (!this._selectedRegionView || !this._selectedRegion || !this._offsetX)
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
      if (this._selectedRegionView.position.x + viewScrollSpeed < 0) return;

      // adjust region start
      this._selectedRegion.start += viewScrollSpeed * RATIO_MILLS_BY_PX;
      this._selectedRegionView.position.x += viewScrollSpeed;;

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
    this.scrollingLeft = false;
    this.scrollingRight = false;

    this._isMovingRegion = false;
    if (!this._selectedRegionView || !this._selectedRegion) return;

    let oldTrack = this._app.tracksController.getTrackById(this._selectedRegion!.trackId)!;
    let newTrack = this._app.tracksController.getTrackById(this._selectedRegionView!.trackId)!;

    const oldX = this._selectedRegion!.pos
    const newX = this._selectedRegion!.pos;

    this.moveRegion(this._selectedRegion, this._selectedRegionView, newX, newTrack);

    this.addLastMoveToUndoManager(
      this._selectedRegion,
      this._selectedRegionView,
      oldX,
      newX,
      oldTrack,
      newTrack
    );
  }

  /**
   * Updates the current selected region that is moving to a new waveform view.
   * It updates the old and the new waveform.
   *
   * @param oldWaveForm - The waveform whom the selected region view will be removed.
   * @param newWaveForm - the new waveform of the selected region view
   * @private
   */
  private updateRegionWaveform(
    oldWaveForm: WaveformView,
    newWaveForm: WaveformView
  ): void {
    newWaveForm.addRegionView(this._selectedRegion!, this._selectedRegionView!);
    oldWaveForm.removeRegionView(this._selectedRegionView!);
    this._selectedRegionView!.trackId = newWaveForm.trackId;
  }

  /* ------------------------- */
  /* UNDO / REDO METHODS BELOW */
  /* ------------------------- */
  updateUndoButtons() {
    // to disable/enable undo/redo buttons if undo/redo is available
    this._app.hostView.setUndoButtonState(this._app.undoManager.hasUndo());
    this._app.hostView.setRedoButtonState(this._app.undoManager.hasRedo());
  }
  /* ---- REGION MOVE ---- */
  /**
   *
   * @param region : the region that was moved
   * @param regionView : the view of the region
   * @param oldX : previous position of the region
   * @param newX : new position of the region
   * @param oldTrack : track where the region was before moving
   * @param newTrack : track where the region is after moving
   * @returns
   */
  addLastMoveToUndoManager(
    region: REGION, regionView: VIEW,
    oldX: number, newX: number,
    oldTrack: Track<REGION>, newTrack: Track<REGION>
  ) {
    if (oldX === newX && oldTrack === newTrack) return;

    this._app.undoManager.add({
      undo: () => this.moveRegion(region, regionView, oldX, oldTrack),
      redo: () => this.moveRegion(region, regionView, newX, newTrack),
    });

    this.updateUndoButtons();
  }

  moveRegion(region: REGION, view: VIEW, newX: number, newTrack?: Track<REGION>){
    newTrack ??= this._app.tracksController.getTrackById(region.trackId)!

    const oldTrackId=region.trackId

    // Move
    view.position.x = newX
    view.trackId = newTrack.id

    region.start = newX * RATIO_MILLS_BY_PX
    region.trackId=newTrack.id

    newTrack.modified=true
        
    // If different track
    if(view.trackId!=newTrack.id){
      const oldTrack=this._app.tracksController.getTrackById(oldTrackId)!
      oldTrack.removeRegionById(region.id);
      newTrack.addRegion(region)

      let oldTrackWaveformView = this._editorView.getWaveFormViewById(oldTrack.id)!
      let newTrackWaveformView = this._editorView.getWaveFormViewById(newTrack.id)!
      oldTrackWaveformView.removeRegionView(view)
      newTrackWaveformView.addRegionView(region,view)
      
      this.bindRegionEvents(region, view);

      oldTrack.modified=true
      oldTrack.update(audioCtx, this._app.host.playhead)
    }

    newTrack.update(audioCtx, this._app.host.playhead)
  }

  // TODO : implement all these for region operations...
  /* ---- REGION CUT ---------------- */
  addLastCutToUndoManager(
    region: REGION, regionView: VIEW,
    track: Track<REGION>
  ) {
    // add to the undo/redo stack

    this.regionStack.push({
      region: region,
      regionView: regionView,
      track: track,
    });

    this._app.undoManager.add({
      undo: () => {
        this.undoCutRegion();
      },
      redo: () => {
        this.redoCutRegion(region, regionView, track);
      },
    });
    this.updateUndoButtons();
  }

  undoCutRegion() {
    // let's get the last region that was cut
    let last = this.regionStack.pop();

    if (!last) return;

    let region = last!.region;
    let regionView = last!.regionView;
    let track = last!.track;
    const trackId = track!.id;

    // add regionView to track waveform
    let waveformView = this._editorView.getWaveFormViewById(trackId);
    waveformView!.addRegionView(region, regionView);

    // certainly unecessary... ?
    //this._app.regionsController.bindRegionEvents(region, regionView);

    // Update the selected track, add the region to the track
    track!.modified = true;
    track!.addRegion(region);

    // the region that has been restored is not selected, otherwise doing ctrl-z multiple
    // times would add multiple regions that are all selected
    regionView.deselect();
  }

  redoCutRegion(region: REGION, regionView: VIEW, track: Track<REGION>) {
    this.regionStack.push({
      region: region,
      regionView: regionView,
      track: track,
    });

    // remove regionView from track waveform
    let waveformView = this._editorView.getWaveFormViewById(track.id);
    waveformView!.removeRegionView(regionView);

    // remove region from track
    track.removeRegionById(region.id);
    track.modified = true;
    track.update(audioCtx, this._app.host.playhead);
  }

  /* ---- REGION DELETE ------------- */
  addLastDeleteToUndoManager(
    region: REGION, regionView: VIEW,
    track: Track<REGION>
  ) {
    this.regionStack.push({
      region: region,
      regionView: regionView,
      track: track,
    });

    this._app.undoManager.add({
      undo: () => {
        this.undoCutRegion();
      },
      redo: () => {
        this.redoCutRegion(region, regionView, track);
      },
    });
    this.updateUndoButtons();
  }

  /* ---- REGION SELECT (needed ?)--- */
  /* ---- REGION PASTE -------------- */
  addLastPasteToUndoManager(
    region: REGION, regionView: VIEW,
    track: Track<REGION>
  ) {
    // add to the undo/redo stack

    //this.regionStack.pop();

    this._app.undoManager.add({
      undo: () => {
        this.redoCutRegion(region, regionView, track);
      },
      redo: () => {
        this.undoCutRegion();
      },
    });
    this.updateUndoButtons();
  }
  /* ---- REGION COPY (needed ?) ---- */
  /* ---- REGION SPLIT -------------- */
  addSplitToUndoManager(
    originalRegion:REGION, originalRegionView:VIEW,
    regionleft: REGION, regionleftView: VIEW,
    regionright: REGION, regionrightView: VIEW,
    track: Track<REGION>
  ) {
    this._app.undoManager.add({
      undo: () => {
        this.undoSplitRegion(originalRegion,
          originalRegionView,
          regionleft,
          regionleftView,
          regionright,
          regionrightView,
          track);
      },
      redo: () => {
        this.redoSplitRegion(originalRegion,
          originalRegionView,
          regionleft,
          regionleftView,
          regionright,
          regionrightView,
          track);
      },
    });
    this.updateUndoButtons();
  }

  undoSplitRegion(
    originalRegion:REGION, originalRegionView:VIEW,
    regionleft: REGION, regionleftView: VIEW,
    regionright: REGION, regionrightView: VIEW,
    track: Track<REGION>
  ) {
    
    const trackId = track!.id;

    // let's remove the left and right regions + region views and put back the previous region
    // regions
    // remove regions from track
    track.removeRegionById(regionleft.id);
    track.removeRegionById(regionright.id);
    
    // remove region views
    let waveformView = this._editorView.getWaveFormViewById(trackId);
    waveformView!.removeRegionView(regionrightView);
    waveformView!.removeRegionView(regionleftView);

    // put back old region
    waveformView!.addRegionView(originalRegion, originalRegionView);

    // bind events to the new region view
    this.bindRegionEvents(originalRegion, originalRegionView);

    // Update the selected track, add the region to the track
    track!.modified = true;
    track!.addRegion(originalRegion);
    track.update(audioCtx, this._app.host.playhead);
    originalRegionView.deselect();
  }

  redoSplitRegion(
    originalRegion:REGION, originalRegionView: VIEW,
    regionleft: REGION, regionleftView: VIEW,
    regionright: REGION, regionrightView: VIEW,
    track: Track<REGION>
  ) {

    // remove the original region and region view, and add the left and right regions/regionViews
    const trackId = track!.id;

    // let's remove the left and right regions + region views and put back the previous region
    // regions
    // remove region from track
    track.removeRegionById(originalRegion.id);
    // remove region views
    let waveformView = this._editorView.getWaveFormViewById(trackId);
    waveformView!.removeRegionView(originalRegionView);

    // add left and right regions to the track
    waveformView!.addRegionView(regionleft, regionleftView);
    waveformView!.addRegionView(regionright, regionrightView);
    // bind events to the new region view * CHECK IF THIS IS NECESSARY */
    this.bindRegionEvents(regionleft, regionleftView);
    this.bindRegionEvents(regionright, regionrightView);

    // add left and right region to track
    track!.modified = true;
    track!.addRegion(regionleft);
    track!.addRegion(regionright);
    track.update(audioCtx, this._app.host.playhead);
  }
}
