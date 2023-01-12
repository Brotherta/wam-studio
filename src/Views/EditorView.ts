import {Application} from "pixi.js";
import WaveFormView from "./WaveFormView";
import {HEIGHT_TRACK, MAX_DURATION_SEC, RATIO_MILLS_BY_PX} from "../Utils";
import PlayheadView from "./PlayheadView";
import Track from "../Models/Track";


export default class EditorView {

    pixiApp: Application
    editor = document.getElementById("editor") as HTMLDivElement;
    trackContainer = document.getElementById("track-container") as HTMLDivElement;

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
    }

    addWaveForm(track: Track) {
        let wave = new WaveFormView(this.pixiApp);

        wave.setTrack(track);
        this.waveforms.push(wave);
    }

    removeWaveForm(track: Track) {
        let wave = this.waveforms.find(wave => wave.trackId === track.id);
        let index = this.waveforms.indexOf(wave!);

        wave!.destroy();
        this.waveforms.splice(index, 1);
        for (let i = index; i < this.waveforms.length; i++) {
            this.waveforms[i].position.y -= HEIGHT_TRACK;
        }
    }

    resizeCanvas() {
        this.pixiApp.renderer.resize(this.pixiApp.renderer.width, this.trackContainer.scrollHeight - 35)
    }
}