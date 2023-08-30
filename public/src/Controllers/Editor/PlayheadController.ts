import App from "../../App";
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

        this._view.handle.on("pointerup", (e) => {
            this.handlePointerUp(e);
        });
        this._view.handle.on("pointerdown", (e) => {
            this.handlePointerDown(e);
        });

        this._view.track.on("globalpointermove", (e) => {
            if (this._movingPlayhead) {
                let pos = e.data.global.x + this._app.editorView.viewport.left;
                if (pos < 0) pos = 0;
                this._view.moveTo(pos);
                this._app.hostView.updateTimerFromXPos(pos);
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
        this._app.hostController.pauseUpdateInterval();
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
        this._app.hostController.resumeUpdateInteravel();
        if (this._app.hostController.playing) {
            this._app.automationController.applyAllAutomations();
        }
    }
}

