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
        if (track.audioBuffer == undefined) return;
        let region = this.app.regionsController.createRegion(track.id, track.audioBuffer!, 0);
        let waveformView = this.app.editorView.createWaveformView(track);
        let regionView = waveformView.createRegionView(region);

        let region2 = this.app.regionsController.createRegion(track.id, track.audioBuffer!.clone(), track.audioBuffer!.duration*1000 + 100);
        let regionView2 = waveformView.createRegionView(region2);

        this.app.regionsController.defineRegionListeners(region, regionView, waveformView);
        this.app.regionsController.defineRegionListeners(region2, regionView2, waveformView);

        track.addRegion(region);
        track.addRegion(region2);
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