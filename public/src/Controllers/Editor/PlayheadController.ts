import { audioCtx } from "../..";
import App from "../../App";
import { RATIO_MILLS_BY_PX } from "../../Env";
import PlayheadView from "../../Views/Editor/PlayheadView";
import {FederatedPointerEvent} from "pixi.js";

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
            this.handlePointerDown(e);
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
            if (this._movingPlayhead) {
                document.body.style.cursor = "grabbing";
                let pos = e.data.global.x + this._app.editorView.viewport.left;
                if (pos < 0) pos = 0;
                this._view.moveTo(pos);
                this._app.hostView.updateTimerByPixelsPos(pos);
                // MB !
                this._app.host.playhead = pos*RATIO_MILLS_BY_PX*audioCtx.sampleRate/1000;
                //console.log("global pointermove playhead = " + this._app.host.playhead + " pos = " + pos)
            }
        });
    }

    /**
     * Handler for the pointer down event. It declares the start of the move.
     *
     * @param e - Event fired by PIXI.JS that contains all the information needed to handle the event
     */
    private handlePointerDown(e: FederatedPointerEvent) {
        let pos = e.data.global.x + this._app.editorView.viewport.left;
        this._app.hostController.pauseTimerInterval();
        this._movingPlayhead = true;
        this._view.moveTo(pos);
    }

    /**
     * Handler for the pointer up event. It declares when the user has stopped moving the playhead.
     * It will then jump to the current value of the playhead.
     *
     * @param e - Event fired by PIXI.JS that contains all the information needed to handle the event
     */
    private handlePointerUp(e: FederatedPointerEvent) {
        let pos = e.data.global.x + this._app.editorView.viewport.left;
        if (pos < 0) pos = 0;
        this._app.tracksController.jumpTo(pos);
        this._movingPlayhead = false;
        this._app.hostController.resumeTimerInteravel();
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
        this._app.editorView.viewport.moveCenter(this._view.position.x, this._app.editorView.viewport.center.y);
        console.log("this._app.editorView.viewport.center.x =" + this._app.editorView.viewport.center.x)
       
    }
}

