import App from "../App";
import {audioCtx} from "../index";

/**
 * Controller for the playhead. This controller is responsible for updating the playhead position and jumping to a specific position.
 */
export default class PlayheadController {

    app: App;

    constructor(app: App) {
        this.app = app;

        this.app.hostView.playbackSlider.onmousedown = () => {
            this.app.hostController.pauseUpdateInterval();
        }

        this.app.hostView.playbackSlider.onchange = () => {
            console.log(this.app.hostView.playbackSlider.value);
            let value = this.app.hostView.playbackSlider.valueAsNumber;
            let newValueMs = this.app.hostController.maxTime * value / 100;

            let playhead = Math.round(newValueMs / 1000 * audioCtx.sampleRate);

            this.app.tracks.trackList.forEach((track) => {
                track.node!.port.postMessage({playhead: playhead+1})
            });
            this.app.host.hostNode?.port.postMessage({playhead: playhead+1});
            this.app.hostView.updateTimer(playhead);
            this.app.hostController.resumeUpdateInteravel();
        }

        this.app.hostView.playbackSlider.oninput = () => {
            let value = this.app.hostView.playbackSlider.valueAsNumber;
            let newValueMs = this.app.hostController.maxTime * value / 100;

            let playhead = Math.round(newValueMs / 1000 * audioCtx.sampleRate);
            this.app.hostView.updateTimer(playhead);
        }
    }
}