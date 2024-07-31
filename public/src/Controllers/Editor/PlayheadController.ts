import { FederatedPointerEvent } from "pixi.js";
import App from "../../App";
import { RATIO_MILLS_BY_PX } from "../../Env";
import { registerOnKeyDown, registerOnKeyUp } from "../../Utils/keys";
import EditorView from "../../Views/Editor/EditorView";
import PlayheadView from "../../Views/Editor/PlayheadView";

/**
 * The class that control the events related to the playhead.
 */
export default class PlayheadController {
  /**
   * Route Application.
   */
  private _app: App;
  /**
   * View of the playhead.
   */
  private _view: PlayheadView;
  /**
   * Boolean that is set true when the user is currently moving the playhead.
   */
  private _movingPlayhead: boolean;

  /**
   * Check if the pointer is down in the playhead track.
   */
  private _pointerIsDown: boolean = false;

  /* for disabling snapping is shift key is pressed and global snapping enabled */
  private snappingDisabled: boolean = false;


  /* for scrolling the viewport when moving the playhead */
  private scrollingLeft: boolean = false;
  private scrollingRight: boolean = false;
  private incrementScrollSpeed: number = 0;
  private viewportAnimationLoopId: number = 0;

  constructor(app: App) {
    this._app = app;
    this._view = app.editorView.playhead;
    this._movingPlayhead = false;

    this.bindEvents();
    this._app.host.onPlayHeadMove.add((pos) => {
      this._app.editorView.playhead.moveTo(pos/RATIO_MILLS_BY_PX)
      this._app
    })
  }

  /**
   * Bind on initialisation the events related to the playhead : pointerdown, pointerup, pointermove and so on...
   * @private
   */
  private bindEvents() {
    registerOnKeyUp((key) => {
      if (key === "Shift") this.snappingDisabled = false
    })

    registerOnKeyDown((key) => {
      if (key === "Shift") this.snappingDisabled = true
    })

    this._view.track.on("pointerup", (e) => {
      this.handlePointerUp(e);
    });
    this._view.track.on("pointerupoutside", (e) => {      
      this.handlePointerUp(e);
    });
    this._view.track.on("pointerdown", (e) => {
      this.handlePointerDown(e);
    });
    this._app.editorView.grid.on("pointerdown", (e) => {
      // to handle cliks on bar numbers, step lines etc.
      // that prevented the playhead to move
      // call handlePointerDown only if the click occured on the top line of the grid
      // otherwise, let the click be handled by the grid clicking on a line in the middle of screen
      // would move the playhead...
      //console.log("e.data.global.y = " + e.data.global.y + "PLAYHEAD_HEIGHT = " + EditorView.PLAYHEAD_HEIGHT);
      if (e.data.global.y < EditorView.PLAYHEAD_HEIGHT + 10)
        this.handlePointerDown(e);
    });
    this._app.editorView.grid.on("pointerup", (e) => {
      // to handle cliks on bar numbers, step lines etc.
      // that prevented the playhead to move
      // call handlePointerUp only if the click occured on the top line of the grid
      if (e.data.global.y < EditorView.PLAYHEAD_HEIGHT + 10)
        this.handlePointerUp(e);
    });
    this._app.editorView.grid.on("globalpointermove", (e) => {
      // to handle cliks on bar numbers, step lines etc.
      // that prevented the playhead to move
      // call handlePointerUp only if the click occured on the top line of the grid
      if (e.data.global.y < EditorView.PLAYHEAD_HEIGHT + 10)
        this.handlePointerMove(e);
    });

    this._view.handle.on("pointerup", (e) => {
      this.handlePointerUp(e);
    });
    this._view.handle.on("pointerupoutside", (e) => {
      this.handlePointerUp(e);
    });
    this._view.handle.on("pointerdown", (e) => {
      this.handlePointerDown(e);
    });
    this._view.handle.on("pointerout", () => {
      document.body.style.cursor = "default";
    });
    this._view.handle.on("pointerover", () => {
      document.body.style.cursor = "grab";
    });

    this._view.track.on("globalpointermove", (e) => {
      this.handlePointerMove(e);
    });
  }

  /** 
   * Get a snapped position of the playhead from a free position of the playhead.
   * @param pos - The free position of the playhead in pixels.
   * */
  getSnappedPosition(pos: number) {
    if (this._app.editorView.snapping && !this.snappingDisabled && !this.scrollingLeft && !this.scrollingRight) {
      const cellSize = this._app.editorView.cellSize
      return Math.round(pos / cellSize) * cellSize
    }
    return pos
  }
  /**
   * Move the playhead to a specific position in milliseconds.
   * @param pos - The new position of the playhead in milliseconds.
   * @param doSnap - If true, the playhead will snap according to the grid settings.
   */
  moveTo(pos: number, doSnap:boolean=false){
    let pixelPos= pos / RATIO_MILLS_BY_PX

    if(this._app.editorView.snapping && doSnap && !this.snappingDisabled && !this.scrollingLeft && !this.scrollingRight){
      pixelPos = this.getSnappedPosition(pixelPos)
    }
    if(pixelPos<0)pixelPos=0

    this._app.tracksController.jumpTo(pixelPos)
    this._view.moveTo(pixelPos)
    this._app.hostView.updateTimerByPixelsPos(pixelPos)
    this._app.hostView.MetronomeElement.playhead= pos
  }

  /**
   * Check if scrolling is needed when moving a region.
   * @private
   */
  checkIfScrollingNeeded(playHeadPos: number) {
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

    let viewport = this._app.editorView.viewport;
    const viewportWidth = viewport.right - viewport.left;

    const distanceToRightEdge = viewportWidth - (playHeadPos - viewport.left);
    this.scrollingRight =
      playHeadPos - viewport.left >= viewportWidth - SCROLL_TRIGGER_ZONE_WIDTH;

    if (this.scrollingRight) {
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
    const distanceToLeftEdge = viewport.left - playHeadPos;
    //console.log("distanceToLeftEdge = " + distanceToLeftEdge);

    this.scrollingLeft =
      playHeadPos < viewport.left + SCROLL_TRIGGER_ZONE_WIDTH &&
      viewport.left > 0;

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
    // scroll the viewport smoothly if needed
    let viewScrollSpeed = 0;
    if (this.scrollingRight) {
      viewScrollSpeed = this.incrementScrollSpeed;
    } else if (this.scrollingLeft) {
      viewScrollSpeed = -this.incrementScrollSpeed;
    }

    console.log("viewScrollSpeed = " + viewScrollSpeed)

    // if needed scroll smoothly the viewport to left or right
    if (this.scrollingRight || this.scrollingLeft) {
      let viewport = this._app.editorView.viewport;

      viewport.left += viewScrollSpeed;
      // move also playhead pos according to scrolling (in pixels)
      this._view.position.x += viewScrollSpeed;

      // adjust horizontal scrollbar so that it corresponds to the current viewport position
      // scrollbar pos depends on the left position of the viewport.
      const horizontalScrollbar = this._app.editorView.horizontalScrollbar;
      horizontalScrollbar.moveTo(viewport.left);

      // if scrolling left and viewport.left < 0, stop scrolling an put viewport.left to 0
      if (this.scrollingLeft && viewport.left < 0) {
        viewport.left = 0;
        this.scrollingLeft = false;
      }
      // if scrolling right and viewport.right > worldWidth, stop scrolling and put viewport.right to worldWidth
      if (
        this.scrollingRight &&
        viewport.right > this._app.editorView.worldWidth
      ) {
        viewport.right = this._app.editorView.worldWidth;
        this.scrollingRight = false;
      }
    }
    requestAnimationFrame(this.viewportAnimationLoop.bind(this));
  }

  private handlePointerMove(e: FederatedPointerEvent) {
    if (this._movingPlayhead) {
      document.body.style.cursor = "grabbing";
      let pos = e.data.global.x + this._app.editorView.viewport.left;

      this.moveTo(pos*RATIO_MILLS_BY_PX, true)
      this.checkIfScrollingNeeded(pos);
    }
  }
  
  /**
   * Handler for the pointer down event. It declares the start of the move.
   *
   * @param e - Event fired by PIXI.JS that contains all the information needed to handle the event
   */
  private handlePointerDown(e: FederatedPointerEvent) {
    this._pointerIsDown = true;

    let pos = e.data.global.x + this._app.editorView.viewport.left;
    // adjust pos if grid snapping is enabled and if not scrolling
    this._app.hostController.pauseTimerInterval();
    this._movingPlayhead = true;
    this.moveTo(pos*RATIO_MILLS_BY_PX, true);
  }

  /**
   * Handler for the pointer up event. It declares when the user has stopped moving the playhead.
   * It will then jump to the current value of the playhead.
   *
   * @param e - Event fired by PIXI.JS that contains all the information needed to handle the event
   */
  private handlePointerUp(e: FederatedPointerEvent) {
    if (this._pointerIsDown) {

      // stop viewport animation
      cancelAnimationFrame(this.viewportAnimationLoopId);
      this.scrollingLeft = false;
      this.scrollingRight = false;
  
      let pos = e.data.global.x + this._app.editorView.viewport.left;
      if (pos < 0){
        pos = 0;
      }
      
      document.body.style.cursor = "grab";

      this.moveTo(pos*RATIO_MILLS_BY_PX, true);
      this._movingPlayhead = false;
      this._app.hostController.resumeTimerInterval();
      if (this._app.host.isPlaying) {
        this._app.automationController.applyAllAutomations();
      }
      this._pointerIsDown = false;
    }


    // MB : for debugging viewport centering
    //this._app.editorView.viewport.moveCenter(this._view.x, this._app.editorView.viewport.center.y);
    //console.log("this._app.editorView.viewport.center.x =" + this._app.editorView.viewport.center.x)
  }

  public centerViewportAround() {
    // Center the viewport around playhead pos in pixels
    console.log("playhead pos x = " + this._view.position.x);
    this._app.editorView.viewport.moveCenter(
      this._view.position.x,
      this._app.editorView.viewport.center.y
    );
    console.log(
      "this._app.editorView.viewport.center.x =" +
        this._app.editorView.viewport.center.x
    );
  }
}
