import App from "../../App";
import LoopView from "../../Views/Editor/LoopView";
import EditorView from "../../Views/Editor/EditorView";
import { FederatedPointerEvent, Graphics } from "pixi.js";
import { RATIO_MILLS_BY_PX } from "../../Env";
import { right } from "@popperjs/core";

enum MovingHandleEnum {
  LEFT,
  RIGHT,
  BACKGROUND,
  NONE,
}

/**
 * The class that control the events related to the loop.
 */
export default class LoopController {
  /**
   * Route Application.
   */
  private _app: App;
  /**
   * Loop view.
   */
  private _view: LoopView;

  private _editor: EditorView;

  private _MOVING_HANDLE: MovingHandleEnum;

  private _movingHandle: boolean;

  private offsetX: number;

  /* Used to mesure time of consecutive pointerdown events 
       We use it here for detecting doubleClick on the loop handle background */
  private lastPointerDown: number = 0;

  /* for disabling snapping is shift key is pressed and global snapping enabled */
  private snappingDisabled: boolean = false;

  /* for scrolling the viewport when moving the loop controller */
  private scrollingRight: boolean = false;
  private scrollingLeft: boolean = false;
  private incrementScrollSpeed: number = 0;
  private rightHandleEndPosOutsideViewport: boolean = false;
  private leftHandleStartPosOutsideViewport: boolean = false;
  private viewportAnimationLoopId: number = 0;

  constructor(app: App) {
    this._app = app;
    this._view = this._app.editorView.loop;
    this._editor = this._app.editorView;
    this._MOVING_HANDLE = MovingHandleEnum.NONE;
    this._movingHandle = false;
    this.offsetX = 0;

    this.updateLoopTime(this._view.leftHandle.x, this._view.rightHandle.x);
    this.bindEvents();
  }

  private bindEvents(): void {
    document.addEventListener("keyup", (e) => {
      this.snappingDisabled = e.shiftKey;
    });

    document.addEventListener("keydown", (e) => {
      // for "disabling temporarily the grid snapping if shift is pressed"
      if (e.shiftKey) {
        this.snappingDisabled = true;
      }
    });

    this._view.rightHandle.on("pointerdown", () => {
      this.handlePointerDown(MovingHandleEnum.RIGHT);
    });
    this._view.rightHandle.on("pointerup", () => {
      this.handlePointerUp();
    });
    this._view.rightHandle.on("pointerupoutside", () => {
      this.handlePointerUp();
    });
    this._view.rightHandle.on("pointerout", () => {
      this.handleHover(MovingHandleEnum.NONE);
    });
    this._view.rightHandle.on("pointerover", () => {
      this.handleHover(MovingHandleEnum.RIGHT);
    });

    this._view.leftHandle.on("pointerdown", () => {
      this.handlePointerDown(MovingHandleEnum.LEFT);
    });
    this._view.leftHandle.on("pointerup", () => {
      this.handlePointerUp();
    });
    this._view.leftHandle.on("pointerupoutside", () => {
      this.handlePointerUp();
    });
    this._view.leftHandle.on("pointerout", () => {
      this.handleHover(MovingHandleEnum.NONE);
    });
    this._view.leftHandle.on("pointerover", () => {
      this.handleHover(MovingHandleEnum.LEFT);
    });

    this._view.background.on("pointerdown", (e) => {
      this.offsetX = e.data.global.x - this._view.leftHandle.x;
      this.handlePointerDown(MovingHandleEnum.BACKGROUND);

      // Detect double click on the loop handle background
      // We measure the elapsed time during consecutive pointerdown events
      const now = Date.now();
      const lastPointerDown = this.lastPointerDown;
      if (now - lastPointerDown < 300) {
        this._app.hostController.loop();
      }
      this.lastPointerDown = now;
    });

    this._view.background.on("pointerup", (e) => {
      this.handlePointerUp();
    });

    this._view.background.on("pointerupoutside", () => {
      this.handlePointerUp();
    });
    this._view.background.on("pointerout", () => {
      this.handleHover(MovingHandleEnum.NONE);
    });
    this._view.background.on("pointerover", () => {
      this.handleHover(MovingHandleEnum.BACKGROUND);
    });

    this._view.track.on("globalpointermove", (e) => {
      if (this._movingHandle) {
        this.handlePointerMove(e);
      }
    });
  }

  private handlePointerDown(type: MovingHandleEnum): void {
    this.viewportAnimationLoopId = requestAnimationFrame(
      this.viewportAnimationLoop.bind(this)
    );

    // useful for avoiding scrolling with large regions
    this.rightHandleEndPosOutsideViewport =
      this._view.rightHandle.x + this._view.rightHandle.width >
      this._app.editorView.viewport.right;
    this.leftHandleStartPosOutsideViewport =
      this._view.leftHandle.x < this._app.editorView.viewport.left;

    this._movingHandle = true;
    this._MOVING_HANDLE = type;
  }

  private handlePointerUp(): void {
    // stop viewport animation
    cancelAnimationFrame(this.viewportAnimationLoopId);

    // update left and right handle positions, background position
    console.log("UP Position x = " + this._view.handle.position.x);
    this._view.handle.position.x = 0;
    this._view.updateHandlePosition(
      this._view.leftHandle.x + this._view.handle.position.x + this._app.editorView.viewport.left,
      this._view.rightHandle.x +   this._view.handle.position.x + this._app.editorView.viewport.left,
      true
    );

    this._movingHandle = false;
    this._MOVING_HANDLE = MovingHandleEnum.NONE;
    document.body.style.cursor = "default";

    this.updateLoopTime(this._view.leftHandle.x, this._view.rightHandle.x);
  }

  private handleHover(type: MovingHandleEnum): void {
    if (this._movingHandle) return;
    switch (type) {
      case MovingHandleEnum.BACKGROUND:
        document.body.style.cursor = "grab";
        break;
      case MovingHandleEnum.LEFT:
        document.body.style.cursor = "w-resize";
        break;
      case MovingHandleEnum.RIGHT:
        document.body.style.cursor = "e-resize";
        break;
      case MovingHandleEnum.NONE:
        document.body.style.cursor = "default";
        break;
    }
  }

  private handlePointerMove(e: FederatedPointerEvent): void {
    switch (this._MOVING_HANDLE) {
      case MovingHandleEnum.BACKGROUND:
        this.handleBackgroundMove(e);
        this.checkIfScrollingNeeded();
        break;
      case MovingHandleEnum.LEFT:
        this.handleLeftHandleMove(e);
        break;
      case MovingHandleEnum.RIGHT:
        this.handleRightHandleMove(e);
        break;
      case MovingHandleEnum.NONE:
        break;
    }
  }

  private handleBackgroundMove(e: FederatedPointerEvent): void {
    document.body.style.cursor = "grabbing";
    let pos = e.data.global.x - this.offsetX;

    this.moveBackground(pos);
  }

  // Move to pos (in pixels) the loop controller background and handles (left/right)
  moveBackground(pos: number) {
    console.log(
      "moveBackground pos = " + pos + " this.offsetX = " + this.offsetX
    );
    if (pos < 0) pos = 0;
    if (
      pos + this._view.rightHandle.x + this._view.rightHandle.width >
      this._editor.worldWidth
    ) {
      pos =
        this._view.track.width -
        this._view.rightHandle.x -
        this._view.rightHandle.width;
    }

      // adjust pos if snapping is enabled and if not scrolling
      pos = this.adjustPosIfSnapping(pos);


    const leftPos = pos;

    const rightPos = this._view.rightHandle.x + pos - this._view.leftHandle.x;
    this._view.updateHandlePosition(leftPos, rightPos, false);
    console.log(
      "moveBackground leftPos = " +
        leftPos +
        " rightPos = " +
        rightPos +
        " bgx = " +
        this._view.background.x
    );
  }

  /**
   * Check if scrolling is needed when moving the loop controller.
   * @private
   */
  checkIfScrollingNeeded() {
    //console.log("checkIfScrollingNeeded");
    // scroll viewport if the right end of the moving  loop controller is close
    // to the right or left edge of the viewport, or left edge of the loop controller close to left edge of viewxport
    // (and not 0 or end of viewport)
    // scroll smoothly the viewport if the loop controller is dragged to the right or left
    // when the loop controller is dragged to the right or to the left, we start scrolling
    // when the right end of the loop controller is close to the right edge of the viewport or
    // when the left end of the loop controller is close to the left edge of the viewport
    // "close" means at a distance of SCROLL_TRIGGER_ZONE_WIDTH pixels from the edge

    // scroll parameters
    const SCROLL_TRIGGER_ZONE_WIDTH = 50;
    const MIN_SCROLL_SPEED = 1;
    const MAX_SCROLL_SPEED = 10;

    // pos of extreme right of the right handle
    const rightHandleEndPos =
      this._view.rightHandle.x +
      this._view.rightHandle.width +
      this._editor.viewport.left;

    console.log("right handle end pos = " + rightHandleEndPos);

    let viewport = this._app.editorView.viewport;
    const viewportWidth = viewport.right - viewport.left;

    const distanceToRightEdge =
      viewportWidth - (rightHandleEndPos - viewport.left);

    console.log("distance to right edge = " + distanceToRightEdge);

    this.scrollingRight =
      !this.rightHandleEndPosOutsideViewport &&
      rightHandleEndPos - viewport.left >=
        viewportWidth - SCROLL_TRIGGER_ZONE_WIDTH;

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

    // pos of extreme left of the left handle
    const leftHandleStartPos =
      this._view.leftHandle.x + this._editor.viewport.left;

    const distanceToLeftEdge = viewport.left - leftHandleStartPos;
    //console.log("distanceToLeftEdge = " + distanceToLeftEdge);

    this.scrollingLeft =
      !this.leftHandleStartPosOutsideViewport &&
      leftHandleStartPos < viewport.left + SCROLL_TRIGGER_ZONE_WIDTH &&
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
    let viewScrollSpeed = 0;

    if (this.scrollingRight) {
      viewScrollSpeed = this.incrementScrollSpeed;
      //this.offsetX -= viewScrollSpeed;
    } else if (this.scrollingLeft) {
      viewScrollSpeed = -this.incrementScrollSpeed;
      //this.offsetX -= viewScrollSpeed;
    }

    // if needed scroll smoothly the viewport to left or right
    if (this.scrollingRight || this.scrollingLeft) {
      let viewport = this._app.editorView.viewport;

      viewport.left += viewScrollSpeed;

      // move also controller background and handles (left/right)
      //this._view.leftHandle.x += viewScrollSpeed;
      //this._view.rightHandle.x += viewScrollSpeed;
      //this._view.background.x += viewScrollSpeed;
      //this._view.position.x += viewScrollSpeed;
      //this.moveBackground(viewScrollSpeed);
      this._view.handle.position.x += viewScrollSpeed;
      //this.moveBackground(this._view.background.x + viewScrollSpeed);
      //this._view.shiftHandlePosition(viewScrollSpeed);

      /*this._view.updateHandlePosition(
        this._view.leftHandle.x,
        this._view.rightHandle.x,
        true
      );*/

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

  private handleLeftHandleMove(e: FederatedPointerEvent): void {
    let pos =
      e.data.global.x +
      this._editor.viewport.left -
      this._view.leftHandle.width / 2;
    if (pos < 0) pos = 0;
    else if (pos >= this._view.rightHandle.x - this._view.leftHandle.width) {
      pos = this._view.rightHandle.x - this._view.leftHandle.width;
    }

     // adjust pos if snapping is enabled and if not scrolling
     pos = this.adjustPosIfSnapping(pos);


    const leftPos = pos;
    const rightPos = this._view.rightHandle.x;
    this._view.updateHandlePosition(leftPos, rightPos, true);
  }

  /* adjust pos if snapping is enabled and if not scrolling */
  adjustPosIfSnapping(pos: number, specialRightHandleCase: boolean = false) {
    if (
      this._app.editorView.snapping &&
      !this.snappingDisabled &&
      !this.scrollingLeft &&
      !this.scrollingRight
    ) {
      // snapping, using cell-size
      let cellSize = this._app.editorView.cellSize;
      // for right handle

      pos = Math.round(pos / cellSize) * cellSize;
      // for right handle, we must adjust the right end of the handle to be
      // aligned on a grid line. Shift left the right handle x pos
      // with the right handle width.
      if(specialRightHandleCase) pos -= this._view.rightHandle.width;

    }
    return pos;
  }

  private handleRightHandleMove(e: FederatedPointerEvent): void {
    let pos =
      e.data.global.x +
      this._editor.viewport.left -
      this._view.rightHandle.width / 2;
    if (
      pos + this._view.rightHandle.x + this._view.rightHandle.width >
      this._editor.worldWidth
    ) {
      pos =
        this._view.track.width -
        this._view.rightHandle.x -
        this._view.rightHandle.width;
    } else if (pos <= this._view.leftHandle.x + this._view.leftHandle.width) {
      pos = this._view.leftHandle.x + this._view.leftHandle.width;
    }

    // adjust pos if snapping is enabled and if not scrolling
    // second parameter is for special case of right handle
    // that needs to be aligned on its end edge, not on its start edge
    // i.e x pos must be shifted left with the width of the right handle
    pos = this.adjustPosIfSnapping(pos, true);

    const leftPos = this._view.leftHandle.x;
    const rightPos = pos;
    this._view.updateHandlePosition(leftPos, rightPos, true);

    //this.checkIfScrollingNeeded();
  }

  /**
   * Updates the loop time in the host
   *
   * @param leftPos - left handle position in pixels.
   * @param rightPos - right handle position in pixels.
   * @private
   */
  private updateLoopTime(leftPos: number, rightPos: number): void {
    const leftTime = leftPos * RATIO_MILLS_BY_PX;
    const rightTime =
      (rightPos + this._view.rightHandle.width) * RATIO_MILLS_BY_PX;
    this._app.hostController.updateLoopValue(leftTime, rightTime);
  }
}
