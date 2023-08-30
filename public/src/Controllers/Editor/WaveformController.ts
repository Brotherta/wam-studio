import App from "../../App";
import EditorView from "../../Views/Editor/EditorView";
import Track from "../../Models/Track";
import WaveformView from "../../Views/Editor/WaveformView";

/**
 * Class that control the waveforms of the editor.
 */
export default class WaveformController {

    /**
     * Route Application.
     */
    private _app: App;
    /**
     * Editor's Application of PIXI.JS.
     */
    private _editorView: EditorView;

    constructor(app: App) {
        this._app = app;
        this._editorView = this._app.editorView;
    }

    /**
     * Add the according waveform to the track in the canvas. It also resizes the canvas.
     * @param track
     */
    public addWaveformToTrack(track: Track) {
        let waveformView = this._editorView.createWaveformView(track);
        if (track.audioBuffer !== undefined) {
            this._app.regionsController.createRegion(track, track.audioBuffer, 0, waveformView);
        }
    }

    /**
     * Remove the according waveform from the track in the canvas. It also resizes the canvas.
     * @param track
     */
    public removeWaveformOfTrack(track: Track) {
        this._editorView.removeWaveForm(track);
    }

    public isLast(waveformView: WaveformView) {
        for (let waveform of this._editorView.waveforms) {
            if (waveform.position.y > waveformView.position.y) return false;
        }
        return true;
    }

    public isFirst(waveformView: WaveformView) {
        return (waveformView.position.y >= 0 && waveformView.position.y <= waveformView.height);
    }

    public getNextWaveform(waveformView: WaveformView) {
        for (let waveform of this._editorView.waveforms) {
            if (waveform.position.y > waveformView.position.y
                && waveform.position.y <= waveformView.position.y + waveformView.height) return waveform;
        }
        return undefined;
    }

    public getPreviousWaveform(waveformView: WaveformView) {
        for (let waveform of this._editorView.waveforms) {
            if (waveform.position.y < waveformView.position.y
                && waveform.position.y >= waveformView.position.y - waveformView.height) return waveform;
        }
        return undefined;
    }
}