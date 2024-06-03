import App from "../../App";
import EditorView from "../../Views/Editor/EditorView";
import SampleTrack from "../../Models/Track/SampleTrack";
import WaveformView from "../../Views/Editor/WaveformView";
import RegionOf from "../../Models/Region/Region";
import SampleRegion from "../../Models/Region/SampleRegion";

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
    public initializeWaveform(track: SampleTrack): void {
        let waveformView = this._editorView.createWaveformView(track);
        const audioBuffer=track.audioBuffer
        if (audioBuffer !== undefined) {
            if(track instanceof SampleTrack)this._app.regionsController.createRegion( track, id=>new SampleRegion(track.id,audioBuffer,0,id), waveformView);
        }
    }

    public recreateRegionsAndRegionViews(track: SampleTrack, regions: SampleRegion[]): WaveformView {
        let waveformView = this._editorView.createWaveformView(track);
        // for all regions in the oldTrack, create a region view in the waveform of newTrack
        for (let region of regions) {
            this._app.regionsController.createRegion(track, id=>region.clone(id), waveformView);
        }
        // return the waveformView
        return waveformView;
    }

    /**
     * Remove the according waveform from the track in the canvas. It also resizes the canvas.
     * @param track - The track that will be removed.
     */
    public removeWaveformOfTrack(track: SampleTrack): void {
        this._editorView.removeWaveForm(track);
    }

    /**
     * Get if the waveform is the last one in the editor view.
     * It will check if the waveform is the last one by checking the position of the other waveforms.
     *
     * @param waveformView - The waveform that must be checked.
     * @return {boolean} - True if the waveform is the last one, false otherwise.
     */
    public isLast(waveformView: WaveformView): boolean {
        for (let waveform of this._editorView.waveforms) {
            if (waveform.position.y > waveformView.position.y) return false;
        }
        return true;
    }

    /**
     * Get if the waveform is the first one in the editor view.
     * It will check if the waveform is the first one by checking the position of the other waveforms.
     *
     * @param waveformView - The waveform that must be checked.
     * @return {boolean} - True if the waveform is the first one, false otherwise.
     */
    public isFirst(waveformView: WaveformView): boolean {
        return (waveformView.position.y >= 0 && waveformView.position.y <= waveformView.height);
    }

    /**
     * Get the next waveform in the editor view.
     * It will check if the waveform is the next one by checking the position of the other waveforms.
     *
     * @param waveformView - The waveform that must be checked.
     * @return {WaveformView} - The next waveform if it exists, undefined otherwise.
     */
    public getNextWaveform(waveformView: WaveformView): WaveformView | undefined {
        for (let waveform of this._editorView.waveforms) {
            if (waveform.position.y > waveformView.position.y
                && waveform.position.y <= waveformView.position.y + waveformView.height) return waveform;
        }
        return undefined;
    }

    /**
     * Get the previous waveform in the editor view.
     * It will check if the waveform is the previous one by checking the position of the other waveforms.
     *
     * @param waveformView - The waveform that must be checked.
     * @return {WaveformView} - The previous waveform if it exists, undefined otherwise.
     */
    public getPreviousWaveform(waveformView: WaveformView): WaveformView | undefined {
        for (let waveform of this._editorView.waveforms) {
            if (waveform.position.y < waveformView.position.y
                && waveform.position.y >= waveformView.position.y - waveformView.height) return waveform;
        }
        return undefined;
    }
}