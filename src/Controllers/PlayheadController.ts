import App from "../App";

/**
 * Controller for the playhead. This controller is responsible for updating the playhead position and jumping to a specific position.
 */
export default class PlayheadController {

    app: App

    constructor(app: App) {
        this.app = app;

        this.app.canvasView.playheadRange.value = "0";
        this.defineControllers();
    }

    defineControllers() {
        
        this.app.canvasView.playheadRange.onmousedown = () => {
            this.app.audioController.pauseUpdateInterval();
        }

        this.app.canvasView.playheadRange.onmouseup = (e: MouseEvent) => {
            // @ts-ignore
            let left = e.target!.getBoundingClientRect().left;
            let x = e.clientX - left
            
            if (x < 0) x = 0;
            
            this.app.audios.jumpTo(x);
            this.app.audioController.resumeUpdateInteravel();
        }
    }
}