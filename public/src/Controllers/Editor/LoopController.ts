import App from "../../App";
import LoopView from "../../Views/Editor/LoopView";
import EditorView from "../../Views/Editor/EditorView";
import {FederatedPointerEvent, Graphics} from "pixi.js";
import {RATIO_MILLS_BY_PX} from "../../Utils/Variables";

enum MovingHandleEnum {
    LEFT,
    RIGHT,
    BACKGROUND,
    NONE
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
        this._view.rightHandle.on("pointerdown", () => {
            this.handlePointerDown(MovingHandleEnum.RIGHT)
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
            this.handlePointerDown(MovingHandleEnum.LEFT)
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
            this.handlePointerDown(MovingHandleEnum.BACKGROUND)
        });
        this._view.background.on("pointerup", () => {
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
        this._movingHandle = true;
        this._MOVING_HANDLE = type;
    }

    private handlePointerUp(): void {
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
        switch(this._MOVING_HANDLE) {
            case MovingHandleEnum.BACKGROUND:
                this.handleBackgroundMove(e);
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
        if (pos < 0) pos = 0;
        if (pos + this._view.rightHandle.x + this._view.rightHandle.width > this._editor.worldWidth) {
            pos = this._view.track.width - this._view.rightHandle.x - this._view.rightHandle.width;
        }

        const leftPos = pos;
        const rightPos = pos + this._view.leftHandle.width + this._view.background.width;
        this._view.updateHandlePosition(leftPos, rightPos, false);

    }

    private handleLeftHandleMove(e: FederatedPointerEvent): void {
        let pos = e.data.global.x + this._editor.viewport.left - this._view.leftHandle.width /2;
        if (pos < 0) pos = 0;
        else if (pos >= this._view.rightHandle.x - this._view.leftHandle.width) {
            pos = this._view.rightHandle.x - this._view.leftHandle.width;
        }

        const leftPos = pos;
        const rightPos = this._view.rightHandle.x;
        this._view.updateHandlePosition(leftPos, rightPos, true);
    }

    private handleRightHandleMove(e: FederatedPointerEvent): void {
        let pos = e.data.global.x + this._editor.viewport.left - this._view.rightHandle.width /2;
        if (pos + this._view.rightHandle.x + this._view.rightHandle.width > this._editor.worldWidth) {
            pos = this._view.track.width - this._view.rightHandle.x - this._view.rightHandle.width;
        }
        else if (pos <= this._view.leftHandle.x + this._view.leftHandle.width) {
            pos = this._view.leftHandle.x + this._view.leftHandle.width;
        }
        const leftPos = this._view.leftHandle.x;
        const rightPos = pos;
        this._view.updateHandlePosition(leftPos, rightPos, true);
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
        const rightTime = (rightPos + this._view.rightHandle.width) * RATIO_MILLS_BY_PX;
        this._app.hostController.updateLoopValue(leftTime, rightTime);
    }
}