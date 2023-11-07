import { audioCtx } from "../..";
import App from "../../App";
import { RATIO_MILLS_BY_PX } from "../../Env";
import EditorView from "../../Views/Editor/EditorView";
import PlayheadView from "../../Views/Editor/PlayheadView";
import { FederatedPointerEvent } from "pixi.js";

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
  }

  /**
   * Bind on initialisation the events related to the playhead : pointerdown, pointerup, pointermove and so on...
   * @private
   */
  private bindEvents() {
    document.addEventListener("keyup", (e) => {
      this.snappingDisabled = e.shiftKey;
    });

    document.addEventListener("keydown", (e) => {
      // for "disabling temporarily the grid snapping if shift is pressed"
      if (e.shiftKey) {
        this.snappingDisabled = true;
      }
    });

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


  /* adjust pos if snapping is enabled and if not scrolling */
  adjustPosIfSnapping(pos: number) {
    if (
      this._app.editorView.snapping &&
      !this.snappingDisabled &&
      !this.scrollingLeft &&
      !this.scrollingRight
    ) {
      // snapping, using cell-size
      const cellSize = this._app.editorView.cellSize;
      pos = Math.round(pos / cellSize) * cellSize;
    }
    return pos;
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

    // if needed scroll smoothly the viewport to left or right
    if (this.scrollingRight || this.scrollingLeft) {
      let viewport = this._app.editorView.viewport;

      viewport.left += viewScrollSpeed;
      // move also playhead pos according to scrolling (in pixels)
      this._view.position.x += viewScrollSpeed;

      // update also the playhead value (in samples)
      this._app.host.playhead =
        (this._view.position.x * RATIO_MILLS_BY_PX * audioCtx.sampleRate) /
        1000;

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

      // adjust pos if grid snapping is enabled and if not scrolling
      pos = this.adjustPosIfSnapping(pos);
      
      if (pos < 0) pos = 0;
      this._view.moveTo(pos);
      this._app.hostView.updateTimerByPixelsPos(pos);
      // MB !
      this._app.host.playhead =
        (pos * RATIO_MILLS_BY_PX * audioCtx.sampleRate) / 1000;
      //console.log("global pointermove playhead = " + this._app.host.playhead + " pos = " + pos)
      this.checkIfScrollingNeeded(pos);
    }
  }
  
  /**
   * Handler for the pointer down event. It declares the start of the move.
   *
   * @param e - Event fired by PIXI.JS that contains all the information needed to handle the event
   */
  private handlePointerDown(e: FederatedPointerEvent) {
    this.viewportAnimationLoopId = requestAnimationFrame(
      this.viewportAnimationLoop.bind(this)
    );

    let pos = e.data.global.x + this._app.editorView.viewport.left;
    // adjust pos if grid snapping is enabled and if not scrolling
    pos = this.adjustPosIfSnapping(pos);

    this._app.hostController.pauseTimerInterval();
    this._movingPlayhead = true;
    this._view.moveTo(pos);

     // update timer display
     this._app.hostView.updateTimer(this._app.host.playhead)

  }

  /**
   * Handler for the pointer up event. It declares when the user has stopped moving the playhead.
   * It will then jump to the current value of the playhead.
   *
   * @param e - Event fired by PIXI.JS that contains all the information needed to handle the event
   */
  private handlePointerUp(e: FederatedPointerEvent) {
    // stop viewport animation
    cancelAnimationFrame(this.viewportAnimationLoopId);

    let pos = e.data.global.x + this._app.editorView.viewport.left;
    if (pos < 0) pos = 0;
    this._app.tracksController.jumpTo(pos);
    this._movingPlayhead = false;
    this._app.hostController.resumeTimerInterval();
    if (this._app.host.playing) {
      this._app.automationController.applyAllAutomations();
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
