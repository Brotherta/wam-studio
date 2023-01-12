import App from "../App";
import {RATIO_MILLS_BY_PX, SAMPLE_RATE} from "../Utils";

/**
 * Controller for the playhead. This controller is responsible for updating the playhead position and jumping to a specific position.
 */
export default class PlayheadController {

    app: App;

    movingPlayhead: boolean;

    constructor(app: App) {
        this.app = app;

        this.app.editorView.playhead.playheadRange.value = "0";
        this.defineControllers();
        this.movingPlayhead = false;
    }

    defineControllers() {
        
        this.app.editorView.playhead.playheadRange.onmousedown = () => {
            this.app.hostController.pauseUpdateInterval();
            this.movingPlayhead = true;
        }

        this.app.editorView.playhead.playheadRange.onmouseup = (e: MouseEvent) => {
            // @ts-ignore
            let left = e.target!.getBoundingClientRect().left;
            let x = e.clientX - left
            
            if (x < 0) x = 0;
            
            this.app.tracks.jumpTo(x);
            this.app.hostController.resumeUpdateInteravel();
            this.movingPlayhead = false;
        }

        this.app.editorView.playhead.playheadRange.onmousemove = (e) => {
            if (this.movingPlayhead) {
                // @ts-ignore
                let left = e.target!.getBoundingClientRect().left;
                let x = e.clientX - left

                if (x < 0) x = 0;
                let pos = (x * RATIO_MILLS_BY_PX) /1000 * SAMPLE_RATE
                this.app.editorView.playhead.movePlayheadLine(x);
                this.app.hostView.updateTimer(pos);
            }
        }
    }
}