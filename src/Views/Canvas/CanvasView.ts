import { Application, Graphics } from "pixi.js"
import Track from "../../Models/Track";
import { MAX_DURATION_SEC, RATIO_MILLS_BY_PX, SAMPLE_RATE } from "../../Utils";
import WaveFormView from "./WaveFormView";

export default class CanvasView {

    pixiApp: Application
    editor = document.getElementById("editor") as HTMLDivElement;
    playheadRange = document.getElementById("playhead-range") as HTMLInputElement;
    playhead = document.getElementById("playhead") as HTMLDivElement;
    trackContainer = document.getElementById("track-container") as HTMLDivElement;

    waveforms: WaveFormView[];

    width = (MAX_DURATION_SEC * 1000) / RATIO_MILLS_BY_PX;
    height = this.trackContainer.scrollHeight - 35;

    playheadLine: Graphics | undefined

    constructor(){
        this.pixiApp = new Application({width: this.width, height: this.height, backgroundColor: 0x121213})
        this.editor.appendChild(this.pixiApp.view);
        this.waveforms = [];

        this.pixiApp.stage.sortableChildren = true;

        this.initPlayhead();
    }

    initPlayhead() {
        console.log(this.width);
        
        this.playheadRange.max = `${this.width}`;
        this.playheadRange.min = "0";
        this.playheadRange.step = "1";
        this.drawPlayhead();
        this.playhead.style.width = `${this.width}`;
        this.playheadRange.style.width = `${this.width}`; 
    }

    drawPlayhead() {
        this.playheadLine = new Graphics()
            .lineStyle(1, 0xFFFFFF, 1)
            .moveTo(0, 0)
            .lineTo(0, this.height);
        this.playheadLine.zIndex = 20;
        this.pixiApp.stage.addChild(this.playheadLine);
    }

    
    movePlayheadLine(x: number) {
        this.playheadLine!!.position.x = x;
    }

    movePlayhead(playhead: number) {
        let x = this.getXfromPlayhead(playhead);
        this.playheadRange.value = `${x}`;
        this.movePlayheadLine(x);

    }

    getXfromPlayhead(playhead: number) {
        let millis = (playhead / SAMPLE_RATE) * 1000;
        return millis / RATIO_MILLS_BY_PX;
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
    }

    resizeCanvas() {
        this.pixiApp.renderer.resize(this.pixiApp.renderer.width, this.trackContainer.scrollHeight - 35)
    }
}