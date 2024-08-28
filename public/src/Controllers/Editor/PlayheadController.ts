import { FederatedPointerEvent } from "pixi.js";
import App from "../../App";
import { RATIO_MILLS_BY_PX } from "../../Env";
import { keptOnInterval } from "../../Utils/gui_callback";
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

  constructor(app: App) {
    this._app = app;
    this._view = app.editorView.playhead;
    this._movingPlayhead = false;

    this.bindEvents();
    this._app.host.onPlayHeadMove.add((pos,movedByPlayer) => {
      this._app.editorView.playhead.moveTo(pos/RATIO_MILLS_BY_PX)
      this.moveAccordingToPlayhead(pos,movedByPlayer)
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
    if (this._app.editorView.snapping && !this.snappingDisabled) {
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

    if(this._app.editorView.snapping && doSnap && !this.snappingDisabled){
      pixelPos = this.getSnappedPosition(pixelPos)
    }
    if(pixelPos<0)pixelPos=0

    this._app.tracksController.jumpTo(pixelPos)
    this._view.moveTo(pixelPos)
    this._app.hostView.updateTimerByPixelsPos(pixelPos)
    this._app.hostView.metronome.playhead= pos
  }

  private handlePointerMove(e: FederatedPointerEvent) {
    if (this._movingPlayhead) {
      document.body.style.cursor = "grabbing";
      let pos = e.data.global.x + this._app.editorView.viewport.left;

      this.moveTo(pos*RATIO_MILLS_BY_PX, true)
      this.moveAccordingToPlayhead(pos*RATIO_MILLS_BY_PX,false)
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

  

  /**
   * Move the view according to a a new playhead position.
   * @param newPlayhead The new playhead position in milliseconds.
   */
  public moveAccordingToPlayhead(newPlayhead: number, movedByPlayer:boolean){
    // Get playhead position informations
    const playheadX= newPlayhead / RATIO_MILLS_BY_PX
    const previousPlayheadX= (newPlayhead-500) / RATIO_MILLS_BY_PX

    // Get viewport informations
    const viewport= this._app.editorView.viewport
    const viewportWidth= viewport.right - viewport.left
    const viewportCenter= (viewport.right + viewport.left) / 2

    // When playing
    if(movedByPlayer){
      // If it has just overpassed the center of the viewport, move the viewport
      if(previousPlayheadX <= viewportCenter && playheadX >= viewportCenter){
        this._view.viewportLeft= Math.max(0, playheadX-viewportWidth/2)
      }

      // If it has just overpassed the right of the viewport, move the viewport
      if(playheadX>viewport.right){
        this._view.viewportLeft= Math.max(0, playheadX-viewportWidth/2)
      }
    }
    // When hand moved
    else{
      // If it has just overpassed the right of the viewport, move the viewport
      if(playheadX>viewport.right) this.scrollRight()
      if(playheadX<viewport.left) this.scrollLeft()
    }

  }

  readonly scrollRight= keptOnInterval(25, 300, ()=>{
    const viewport= this._app.editorView.viewport
    this._view.viewportLeft+= (viewport.right - viewport.left)/50
  })

  readonly scrollLeft= keptOnInterval(25, 300, ()=>{
      const viewport= this._app.editorView.viewport
      this._view.viewportLeft-= (viewport.right - viewport.left)/50
  })

}
