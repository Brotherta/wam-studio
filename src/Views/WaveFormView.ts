import { Application, Container, Graphics } from "pixi.js";
import Track from "../Models/Track";
import { HEIGHT_TRACK, OFFSET_FIRST_TRACK, RATIO_MILLS_BY_PX } from "../Utils";

/**
 * Class that is responsible for the view of the waveforms.
 * It is responsible for drawing the waveforms and updating the position of the waveforms.
 */
export default class WaveFormView extends Container {
    pixiApp: Application;
    
    myWidth: number;
    myHeight: number;
    trackId: number;

    constructor(pixiApp: Application) {
        super();

        this.pixiApp = pixiApp;
        this.pixiApp.stage.addChild(this);

        this.myWidth = this.pixiApp.renderer.width;
        this.myHeight = this.pixiApp.renderer.height;
        this.zIndex = 0;

        this.trackId = -1
    }

    /**
     * Set the track id of the waveform according to the track id of the track.
     * Initialize the waveform.
     * According to the track id, the waveform is drawn at the correct position.
     * @param track
     */
    setTrack(track: Track) {
        let top = Math.round(track.element.getBoundingClientRect().top - OFFSET_FIRST_TRACK);
        let pos = top/HEIGHT_TRACK;

        this.position.x = 0;
        this.position.y = pos*HEIGHT_TRACK;

        this.trackId = track.id;
        this.setBackground()
        this.drawWave(track);
    }

    /**
     * Draw the background of the waveform.
     */
    setBackground() {
        let background = new Graphics();
        background.beginFill(0x2c2c2c);
        background.lineStyle({width: 1,color: 0x000000});
        background.drawRect(0, 0, this.myWidth, HEIGHT_TRACK-1);
        this.addChild(background);
        console.log(this.children);
    }

    /**
     * Draw the waveform of the track.
     * @param track
     */
    drawWave(track: Track) {
        let duration = track.audioBuffer!.duration * 1000; 
        let width = duration / RATIO_MILLS_BY_PX;

        let wave = new Graphics();
        let color = +("0x" + track.color.slice(1));

        wave.beginFill(color);

        let data = track.audioBuffer!.getChannelData(0);
        let step = Math.ceil(data.length / width);
        let amp = (HEIGHT_TRACK-1) / 2;
        for (let i = 0; i < width; i++) {
            let min = 1.0;
            let max = -1.0;
            for (let j = 0; j < step; j++) {
                let dataum = data[i * step + j];
                if (dataum < min) min = dataum;
                if (dataum > max) max = dataum;
            }
            wave.drawRect(i, (1+min) * amp, 1, Math.max(1, (max-min) * amp));
        }
        this.addChild(wave);
    }

}