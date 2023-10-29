import App from "../../App";
import EditorView from "../../Views/Editor/EditorView";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import Region from "../../Models/Region";
import { RATIO_MILLS_BY_PX } from "../../Env";
import { FederatedPointerEvent, FilterState } from "pixi.js";
import WaveformView from "../../Views/Editor/WaveformView";
import RegionView from "../../Views/Editor/RegionView";
import { audioCtx } from "../../index";
import Track from "../../Models/Track";

/**
 * Class that control the regions of the editor.
 */
export default class RegionsController {
  /**
   * Number of region that is incremented for each time a region is created.
   */
  public regionIdCounter: number;

  /**
   * Route Application.
   */
  private _app: App;
  /**
   * Editor's Application of PIXI.JS.
   */
  private _editorView: EditorView;

  /**
   * Store if the movinf is currently moving or not.
   */
  private _isMovingRegion: boolean;
  /**
   * The current selected region view.
   */
  private _selectedRegionView: RegionView | undefined;
  /**
   * the current selected region.
   */
  private _selectedRegion: Region | undefined;

  /**
   * The offset on X axis when a region is moved.
   * Represents the position on the region view itself, where the user clicked.
   */
  private _offsetX: number;

  /* Clipboard for the pasted region, used for copy/cut/paste */
  private clipBoardRegion: Region;

  /* for disabling snapping is shift key is pressed and global snapping enabled */
  private snappingDisabled: boolean = false;

  constructor(app: App) {
    this._app = app;
    this._editorView = app.editorView;
    this.regionIdCounter = 0;
    this._isMovingRegion = false;

    this.bindEvents();
  }

  /**
   * Creates a region and the corresponding view in the track with the given buffer.
   * It will also bind the events to the new region view and updates the buffer of the track.
   *
   * @param track - The track where to create the new region.
   * @param buffer - The buffer that the new region will contain.
   * @param start - The time in milliseconds where the region should start.
   * @param waveformView - Optional - The waveform where the region should be added. If not given, the waveform
   * will be search using the ID of the track.
   */
  public createRegion(
    track: Track,
    buffer: OperableAudioBuffer,
    start: number,
    waveformView?: WaveformView
  ) {
    if (!waveformView)
      waveformView = this._editorView.getWaveFormViewById(track.id);
    let region = new Region(track.id, buffer, start, this.getNewId());
    let regionView = waveformView!.createRegionView(region);

    this._app.regionsController.bindRegionEvents(region, regionView);

    track.modified = true;
    track.addRegion(region);
  }

  /**
   * Creates a temporary region. The region is only visual, and has no event bound.
   * It will create a placeholder buffer.
   *
   * @param track - The track where to create the new region.
   * @param start - The time in milliseconds where the region should start.
   */
  public createTemporaryRegion(track: Track, start: number) {
    let buffer = new OperableAudioBuffer({
      length: 128,
      sampleRate: audioCtx.sampleRate,
      numberOfChannels: 2,
    });

    let waveformView = this._editorView.getWaveFormViewById(track.id);
    let region = new Region(track.id, buffer, start, this.getNewId());
    waveformView!.createRegionView(region);

    return region;
  }

  /**
   * Updates a temporary region with the new buffer.
   *
   * @param region - The temporary region tu update.
   * @param track - The track where the region is.
   * @param buffer - The new buffer for the region.
   */
  public updateTemporaryRegion(
    region: Region,
    track: Track,
    buffer: OperableAudioBuffer
  ) {
    const waveformView = this._editorView.getWaveFormViewById(track.id);
    if (waveformView === undefined) throw new Error("Waveform not found");

    const regionView = waveformView.getRegionViewById(region.id);
    if (regionView === undefined) throw new Error("RegionView not found");

    region.buffer = region.buffer.concat(buffer);
    region.duration = region.buffer.duration;

    waveformView.removeRegionView(regionView);
    return waveformView!.createRegionView(region);
  }

  /**
   * Updates the last piece of buffer in the region buffer and create the associated region view.
   * Then it binds the region view events and add the new region.
   *
   * @param region - The temporary region tu update.
   * @param track - The track where the region is.
   * @param buffer - The new buffer for the region.
   */
  public renderTemporaryRegion(
    region: Region,
    track: Track,
    buffer: OperableAudioBuffer
  ) {
    const latency = this._app.host.latency;
    if (region.start - latency < 0) {
      let diff = region.start - latency;
      if (diff >= 0) {
        region.start = 0;
      } else {
        diff = -diff;
        region.buffer = region.buffer.split(
          (diff * audioCtx.sampleRate) / 1000
        )[1]!;
        region.duration -= diff / 1000;
      }
    } else {
      region.start -= latency;
    }
    const newRegionView = this.updateTemporaryRegion(region, track, buffer);
    this._app.regionsController.bindRegionEvents(region, newRegionView);
    track.addRegion(region);
  }

  /**
   * Get the maximum duration of all the regions in the editor.
   *
   * @returns The maximum duration of all the regions in the editor.
   */
  public getMaxDurationRegions(): number {
    let maxTime = 0;
    for (let track of this._app.tracksController.trackList) {
      for (let region of track.regions) {
        let end = region.start * 1000 + region.duration;
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
   * @private
   */
  private bindRegionEvents(region: Region, regionView: RegionView): void {
    regionView.on("pointerdown", (_e) => {
      this.handlePointerDown(regionView);
      this._offsetX = _e.data.global.x - regionView.position.x;
      this._isMovingRegion = true;
      // select the track that corresponds to the clicked region
      let track = this._app.tracksController.getTrackById(region.trackId);
      if (track) this._app.pluginsController.selectTrack(track);
    });
    regionView.on("pointerup", () => {
      this.handlePointerUp();
    });
    regionView.on("pointerupoutside", () => {
      this.handlePointerUp();
    });
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
      // On escape key pressed, deselect the selected waveform.
      if (e.key === "Escape") {
        this.deselectRegion();
      }

      // On delete key pressed, delete the selected region.
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        this._selectedRegionView !== undefined
      ) {
        this.deleteSelectedRegion();
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
  private handlePointerDown(regionView: RegionView): void {
    if (this._selectedRegionView !== regionView) {
      this.deselectRegion();
      this._selectedRegionView = regionView;
      this._selectedRegionView.select();
      this._selectedRegion = this._app.tracksController
        .getTrackById(regionView.trackId)
        ?.getRegionById(regionView.id);
    }
  }

  /**
   * Deselects the current selected region view.
   *
   * @private
   */
  private deselectRegion(): void {
    if (this._selectedRegionView !== undefined) {
      this._selectedRegionView.deselect();
      this._selectedRegionView = undefined;
      this._selectedRegion = undefined;
    }
  }

  /**
   * Deletes the current selected region and the corresponding view.
   *
   * @private
   */
  private deleteSelectedRegion(): void {
    if (
      !this._selectedRegionView ||
      !this._selectedRegion ||
      this._isMovingRegion
    )
      return;

    let waveform = this._selectedRegionView.parent as WaveformView;
    let track = this._app.tracksController.getTrackById(
      this._selectedRegion.trackId
    );
    if (track === undefined) throw new Error("Track not found");

    track.removeRegionById(this._selectedRegion.id);
    waveform.removeRegionView(this._selectedRegionView);

    this._selectedRegionView = undefined;
    this._selectedRegion = undefined;

    track.modified = true;
    track.updateBuffer(audioCtx, this._app.host.playhead);
  }

  private cutSelectedRegion() {
    this.copySelectedRegion();
    this.deleteSelectedRegion();
  }

  private copySelectedRegion() {
    if (!this._selectedRegion) return;

    // Copy the buffer of the selected region
    const bufferCpy: OperableAudioBuffer = this._selectedRegion.buffer.clone();

    // make a new region from this buffer, with start at the playhead value
    // same duration, track will be the current selected track
    // trackId and region start properties will be updated when pasted
    const start = this._selectedRegion.start;
    const trackId = this._selectedRegion.trackId;
    const region = new Region(trackId, bufferCpy, start, this.getNewId());
    // put it into the clipBoard
    this.clipBoardRegion = region;
    console.log("Region copied in the clipboard !");
  }

  private pasteRegion() {
    if (!this.clipBoardRegion) return;
    // get the id of the selected track. This where we're going to paste the
    // region in the clipboard. We're using _selectedRegionView.trackId as the
    // current selected track might be different from the one we copied the region
    let track: Track | undefined = this._app.pluginsController.selectedTrack;
    if (!track) {
      // There is no selected track, consider that the track we're going to paste
      // the region in is the same track we pasted the region from
      track = this._app.tracksController.getTrackById(
        this.clipBoardRegion.trackId
      );
    }

    const trackId = track!.id;
    const startInMs = (this._app.host.playhead / audioCtx.sampleRate) * 1000;
    const id = this.clipBoardRegion.id;

    // make a new region from the clipboard region
    const newRegion = new Region(
      trackId,
      this.clipBoardRegion.buffer.clone(),
      startInMs,
      id
    );

    // create a view from the new region
    let waveformView = this._editorView.getWaveFormViewById(trackId);
    let regionView = waveformView!.createRegionView(newRegion);
    //waveformView!.addRegionView(regionView);

    this._app.regionsController.bindRegionEvents(newRegion, regionView);

    // Update the selected track
    track!.modified = true;
    track!.addRegion(newRegion);

    // move playhead at the end of the newly pasted region
    // jumps to new pos in pixels
    const regionWidth = (newRegion.duration * 1000) / RATIO_MILLS_BY_PX;
    // MB : maybe add region width into region model
    const newX = newRegion.pos + regionWidth;
    // maybe add new methods in playheadController moveTo(pixelPos) and moveTo(samplePos)
    this._app.host.playhead += newRegion.duration * audioCtx.sampleRate;
    this._app.editorView.playhead.moveToFromPlayhead(this._app.host.playhead);

    this._app.tracksController.jumpTo(newX);
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

    // get the split point (corresponding to the playhead position) in samples
    const startOfSelectedRegionInMs = this._selectedRegion.start;
    // same in samples
    const startOfSelectedRegionInSamples =
      (startOfSelectedRegionInMs / 1000) * audioCtx.sampleRate;
    const splitPoint = this._app.host.playhead - startOfSelectedRegionInSamples;

    // get the buffer from the selected region
    const buffer: OperableAudioBuffer = this._selectedRegion.buffer;
    // split it into two buffers. The calls returns two NEW buffers
    let firstBuffer: OperableAudioBuffer | null,
      secondBuffer: OperableAudioBuffer | null;

    [firstBuffer, secondBuffer] = buffer.split(splitPoint);

    // Makes two new regions

    // make a new region from the left part of the audio buffer (according to playhead position),
    // with start the same as selected region
    // duration/2, track will be the same track as original region
    let leftRegionStart = this._selectedRegion.start;
    let trackId = this._selectedRegion.trackId;
    const leftRegion = new Region(
      trackId,
      firstBuffer!,
      leftRegionStart,
      this.getNewId()
    );

    // make another region starting at mid point of the original selected region
    // start in ms and duration in ms
    const splitPointInMs = (splitPoint * 1000) / 44100;
    let rightRegionStart = this._selectedRegion.start + splitPointInMs;
    const rightRegion = new Region(
      trackId,
      secondBuffer!,
      rightRegionStart,
      this.getNewId()
    );

    // delete original region
    this.deleteSelectedRegion();
    // update track
    let track = this._app.tracksController.getTrackById(trackId);
    //track!.modified = true;
    //track?.updateBuffer(audioCtx, this._app.host.playhead);

    // create new views from the two new regions and add them to the waveformView of the track
    let waveformView = this._editorView.getWaveFormViewById(trackId);

    // create a view from the left region
    let leftRegionView = waveformView!.createRegionView(leftRegion);
    //waveformView!.addRegionView(leftRegionView);
    this._app.regionsController.bindRegionEvents(leftRegion, leftRegionView);

    // create a view from the right region
    let rightRegionView = waveformView!.createRegionView(rightRegion);
    //waveformView!.addRegionView(rightRegionView);
    this._app.regionsController.bindRegionEvents(rightRegion, rightRegionView);

    // Update the selected track
    track = this._app.tracksController.getTrackById(trackId);
    track!.addRegion(leftRegion);
    //track!.modified = true;
    //track?.updateBuffer(audioCtx, this._app.host.playhead);

    track!.addRegion(rightRegion);
    //track!.modified = true;
    //track?.updateBuffer(audioCtx, this._app.host.playhead);
    
    // select right region
    rightRegionView.select();

    //this.handlePointerDown(leftRegionView);
    //this.handlePointerUp();

  }

  isPlayheadOnSelectedRegion() {
    if (!this._selectedRegion) return;

    // check if playhead is on the selected region
    const playHeadPosX = this._app.editorView.playhead.position.x;
    const selectedRegionPosX = this._selectedRegionView!.position.x;
    const selectedRegionWidth =
      (this._selectedRegion.duration * 1000) / RATIO_MILLS_BY_PX;

    return (
      (playHeadPosX >= selectedRegionPosX) &&
      (playHeadPosX <= (selectedRegionPosX + selectedRegionWidth))
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

    let x = e.data.global.x;
    let y = e.data.global.y + this._editorView.viewport.top;

    let newX = x - this._offsetX;
    newX = Math.max(0, Math.min(newX, this._editorView.worldWidth));

    if (this._editorView.snapping && !this.snappingDisabled) {
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
    this._selectedRegion.pos = newX;
    console.log("Region Moved, new pos (pixels): " + this._selectedRegion.pos);
    this._selectedRegion.start = newX * RATIO_MILLS_BY_PX;
    console.log("Region Moved, new start (ms): " + this._selectedRegion.start);
  }

  /**
   * If the region was moving, it stops the move and update the track buffer. If the region is in a new tracks,
   * it will modify the old track and the new one.
   * @private
   */
  private handlePointerUp(): void {
    this._isMovingRegion = false;
    if (!this._selectedRegionView && !this._selectedRegion) return;

    if (this._selectedRegionView!.trackId !== this._selectedRegion!.trackId) {
      let oldTrack = this._app.tracksController.getTrackById(
        this._selectedRegion!.trackId
      );
      let newTrack = this._app.tracksController.getTrackById(
        this._selectedRegionView!.trackId
      );
      if (oldTrack == undefined || newTrack == undefined) {
        throw new Error("Track not found");
      }
      oldTrack.removeRegionById(this._selectedRegion!.id);
      newTrack.addRegion(this._selectedRegion!);

      oldTrack.modified = true;
      newTrack.modified = true;
      oldTrack.updateBuffer(audioCtx, this._app.host.playhead);
      newTrack.updateBuffer(audioCtx, this._app.host.playhead);

      this._selectedRegion!.trackId = this._selectedRegionView!.trackId;

      // select the new track (this will unselect automatically the previous selected track)
      this._app.pluginsController.selectTrack(newTrack);
    } else {
      let track = this._app.tracksController.getTrackById(
        this._selectedRegion!.trackId
      );
      if (track == undefined) throw new Error("Track not found");
      track.modified = true;
      track.updateBuffer(audioCtx, this._app.host.playhead);
    }
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
    newWaveForm.addRegionView(this._selectedRegionView!);
    oldWaveForm.removeRegionView(this._selectedRegionView!);
    this._selectedRegionView!.trackId = newWaveForm.trackId;
    this._selectedRegionView!.drawWave(
      newWaveForm.color,
      this._selectedRegion!
    );
  }
}
