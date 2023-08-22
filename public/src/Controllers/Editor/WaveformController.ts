import App from "../../App";
import EditorView from "../../Views/Editor/EditorView";
import Track from "../../Models/Track";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import {audioCtx} from "../../index";
import Region from "../../Models/Region";
import WaveformView from "../../Views/Editor/WaveformView";


export default class WaveformController {

    app: App;
    editor: EditorView;

    constructor(app: App) {
        this.app = app;
        this.editor = this.app.editorView;
    }

    /**
     * Add the according waveform to the track in the canvas. It also resizes the canvas.
     * @param track
     */
    addWaveformToTrack(track: Track) {
        let waveformView = this.editor.createWaveformView(track);
        if (track.audioBuffer == undefined) return;

        let region = this.app.regionsController.createRegion(track.id, track.audioBuffer!, 0);
        let regionView = waveformView.createRegionView(region);

        this.app.regionsController.defineRegionListeners(region, regionView, waveformView);

        track.addRegion(region);
    }

    createRegion(track: Track, buffer: OperableAudioBuffer, start: number) {
        let waveformView = this.editor.getWaveFormViewById(track.id);
        let region = this.app.regionsController.createRegion(track.id, buffer, start);
        let regionView = waveformView!.createRegionView(region);

        this.app.regionsController.defineRegionListeners(region, regionView, waveformView!);

        track.modified = true;
        track.addRegion(region);
    }

    createTemporaryRegion(track: Track, start: number) {
        let buffer = new OperableAudioBuffer({
            length: 128,
            sampleRate: audioCtx.sampleRate,
            numberOfChannels: 2
        })

        let waveformView = this.editor.getWaveFormViewById(track.id);
        let region = this.app.regionsController.createRegion(track.id, buffer, start);
        waveformView!.createRegionView(region);

        return region;
    }

    updateTemporaryRegion(region: Region, track: Track, buffer: OperableAudioBuffer) {
        let waveformView = this.editor.getWaveFormViewById(track.id);
        if (waveformView === undefined) throw new Error("Waveform not found");

        let regionView = waveformView.getRegionView(region.id);
        if (regionView === undefined) throw new Error("RegionView not found");

        region.buffer = region.buffer.concat(buffer);

        region.duration = region.buffer.duration;
        waveformView.removeRegionView(regionView);
        waveformView!.createRegionView(region);

        return region;
    }

    renderTemporaryRegion(region: Region, track: Track, buffer: OperableAudioBuffer, latency: number) {
        let waveformView = this.editor.getWaveFormViewById(track.id);
        if (waveformView === undefined) throw new Error("Waveform not found");

        let regionView = waveformView.getRegionView(region.id);
        if (regionView === undefined) throw new Error("RegionView not found");

        region.buffer = region.buffer.concat(buffer);
        region.duration = region.buffer.duration;

        if (region.start - latency < 0) {
            let diff = region.start - latency;
            if (diff >= 0) {
                region.start = 0;
            }
            else {
                diff = -diff;
                region.buffer = region.buffer.split(diff * audioCtx.sampleRate / 1000)[1]!;
                region.duration -= diff / 1000;
            }
        }
        else {
            region.start -= latency;
        }

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
        this.editor.removeWaveForm(track);
    }

    isLast(waveformView: WaveformView) {
        for (let waveform of this.editor.waveforms) {
            if (waveform.position.y > waveformView.position.y) return false;
        }
        return true;
    }

    isFirst(waveformView: WaveformView) {
        return (waveformView.position.y >= 0 && waveformView.position.y <= waveformView.height);
    }

    getNextWaveform(waveformView: WaveformView) {
        for (let waveform of this.editor.waveforms) {
            if (waveform.position.y > waveformView.position.y
                && waveform.position.y <= waveformView.position.y + waveformView.height) return waveform;
        }
        return undefined;
    }

    getPreviousWaveform(waveformView: WaveformView) {
        for (let waveform of this.editor.waveforms) {
            if (waveform.position.y < waveformView.position.y
                && waveform.position.y >= waveformView.position.y - waveformView.height) return waveform;
        }
        return undefined;
    }

}