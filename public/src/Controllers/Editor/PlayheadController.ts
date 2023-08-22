import App from "../../App";
import PlayheadView from "../../Views/Editor/PlayheadView";
import {FederatedPointerEvent} from "pixi.js";


export default class PlayheadController {

    app: App;
    view: PlayheadView;
    movingPlayhead: boolean;

    constructor(app: App) {
        this.app = app;
        this.view = app.editorView.playhead;
        this.movingPlayhead = false;
        this.bindEvents();
    }

    bindEvents() {
        this.view.track.on("pointerup", (e) => {
            this.pointerUp(e);
        });
        this.view.track.on("pointerupoutside", (e) => {
            this.pointerUp(e);
        });
        this.view.track.on("pointerdown", (e) => {
            this.pointerDown(e);
        });

        this.view.handle.on("pointerup", (e) => {
           this.pointerUp(e);
        });
        this.view.handle.on("pointerdown", (e) => {
            this.pointerDown(e);
        });

        this.view.track.on("globalpointermove", (e) => {
            if (this.movingPlayhead) {
                let pos = e.data.global.x + this.app.editorView.viewport.left;
                if (pos < 0) pos = 0;
                this.view.movePlayheadFromPosition(pos);
                this.app.hostView.updateTimerFromXPos(pos);
            }
        });
    }

    pointerDown(e: FederatedPointerEvent) {
        let pos = e.data.global.x + this.app.editorView.viewport.left;
        this.app.hostController.pauseUpdateInterval();
        this.movingPlayhead = true;
        this.view.movePlayheadFromPosition(pos);
    }

    pointerUp(e: FederatedPointerEvent) {
        let pos = e.data.global.x + this.app.editorView.viewport.left;
        if (pos < 0) pos = 0;
        this.app.tracksController.jumpTo(pos);
        this.movingPlayhead = false;
        this.app.hostController.resumeUpdateInteravel();
        if (this.app.hostController.playing){
            this.app.automationController.applyAllAutomations();
        }
    }
}

