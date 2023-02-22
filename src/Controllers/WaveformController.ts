import App from "../App";
import Track from "../Models/Track";

export default class WaveformController {

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Add the according waveform to the track in the canvas. It also resizes the canvas.
     * @param track
     */
    addWaveformToTrack(track: Track) {
        let waveformView = this.app.editorView.createWaveformView(track);
        if (track.audioBuffer == undefined) return;
        let region = this.app.regionsController.createRegion(track.id, track.audioBuffer!, 0);
        let regionView = waveformView.createRegionView(region);

        this.app.regionsController.defineRegionListeners(region, regionView, waveformView);

        track.addRegion(region);
    }

    /**
     * Remove the according waveform from the track in the canvas. It also resizes the canvas.
     * @param track
     */
    removeWaveformOfTrack(track: Track) {
        this.app.editorView.removeWaveForm(track);
        this.app.editorView.resizeCanvas();
    }
}