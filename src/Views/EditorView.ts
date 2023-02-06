import {Application} from "pixi.js";
import WaveFormView from "./WaveFormView";
import {HEIGHT_TRACK, MAX_DURATION_SEC, RATIO_MILLS_BY_PX} from "../Utils";
import PlayheadView from "./PlayheadView";
import Track from "../Models/Track";


/**
 * The editor view is responsible for displaying the waveforms and the playhead.
 */
export default class EditorView {

    pixiApp: Application
    editor = document.getElementById("editor") as HTMLDivElement;
    trackContainer = document.getElementById("track-container") as HTMLDivElement;
    dragCover = document.getElementById("drag-cover") as HTMLDivElement;

    waveforms: WaveFormView[];
    playhead: PlayheadView;

    width = (MAX_DURATION_SEC * 1000) / RATIO_MILLS_BY_PX;
    height = this.trackContainer.scrollHeight - 35;

    constructor() {
        this.pixiApp = new Application({width: this.width, height: this.height, backgroundColor: 0x121213})
        this.editor.appendChild(this.pixiApp.view);
        this.waveforms = [];
        this.playhead = new PlayheadView(this.pixiApp);

        this.pixiApp.stage.sortableChildren = true;
        this.defineDragNDrop();
    }

    defineDragNDrop() {
        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
            window.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
    }

    /**
     * Add a waveform into the canvas fot the given track and update the position of the other waveforms.
     * @param track
     */
    addWaveForm(track: Track) {
        let wave = new WaveFormView(this.pixiApp);

        wave.setTrack(track);
        this.waveforms.push(wave);
    }

    /**
     * Remove the waveform from the canvas for the given track and update the position of the other waveforms.
     * @param track
     */
    removeWaveForm(track: Track) {
        let wave = this.waveforms.find(wave => wave.trackId === track.id);
        let index = this.waveforms.indexOf(wave!);

        wave!.destroy();
        this.waveforms.splice(index, 1);
        for (let i = index; i < this.waveforms.length; i++) {
            this.waveforms[i].position.y -= HEIGHT_TRACK;
        }
    }

    /**
     * Resize the canvas when the window is resized.
     */
    resizeCanvas() {
        this.pixiApp.renderer.resize(this.pixiApp.renderer.width, this.trackContainer.scrollHeight - 35)
    }

    /**
     * Change the color of the waveform for the given track.
     * @param track
     */
    changeWaveFormColor(track: Track) {
        let wave = this.waveforms.find(wave => wave.trackId === track.id);

        wave?.drawWave(track);
    }
}