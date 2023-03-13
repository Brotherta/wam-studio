import App from "../App";
import Track from "../Models/Track";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import Region from "../Models/Region";
import {audioCtx} from "../index";

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

    createWaveform(track: Track, buffer: OperableAudioBuffer, start: number) {
        let waveformView = this.app.editorView.getWaveFormViewById(track.id);
        let region = this.app.regionsController.createRegion(track.id, buffer, start);
        let regionView = waveformView!.createRegionView(region);

        this.app.regionsController.defineRegionListeners(region, regionView, waveformView!);

        track.addRegion(region);
    }

    createTemporaryRegion(track: Track, start: number) {
        let buffer = new OperableAudioBuffer({
            length: 128,
            sampleRate: audioCtx.sampleRate,
            numberOfChannels: 2
        })

        let waveformView = this.app.editorView.getWaveFormViewById(track.id);
        let region = this.app.regionsController.createRegion(track.id, buffer, start);
        waveformView!.createRegionView(region);

        return region;
    }

    updateTemporaryRegion(region: Region, track: Track, buffer: OperableAudioBuffer) {
        let waveformView = this.app.editorView.getWaveFormViewById(track.id);
        if (waveformView === undefined) throw new Error("Waveform not found");

        let regionView = waveformView.getRegionView(region.id);
        if (regionView === undefined) throw new Error("RegionView not found");

        region.buffer = region.buffer.concat(buffer);

        region.duration = region.buffer.duration;
        waveformView.removeRegionView(regionView);
        waveformView!.createRegionView(region);

        return region;
    }

    renderTemporaryRegion(region: Region, track: Track, buffer: OperableAudioBuffer) {
        let waveformView = this.app.editorView.getWaveFormViewById(track.id);
        if (waveformView === undefined) throw new Error("Waveform not found");

        let regionView = waveformView.getRegionView(region.id);
        if (regionView === undefined) throw new Error("RegionView not found");

        region.buffer = region.buffer.concat(buffer);

        region.duration = region.buffer.duration;
        waveformView.removeRegionView(regionView);

        let newRegionView = waveformView!.createRegionView(region);
        this.app.regionsController.defineRegionListeners(region, newRegionView, waveformView!);

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