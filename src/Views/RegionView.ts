import {Application, Container, Graphics} from "pixi.js";
import {HEIGHT_TRACK, RATIO_MILLS_BY_PX} from "../Utils";
import Region from "../Models/Region";

export default class RegionView extends Container {

    pixiApp: Application;
    wave: Graphics;
    background: Graphics;

    trackId: number;
    id: number;

    constructor(pixiApp: Application, trackId: number, region: Region) {
        super();
        this.interactive = true;

        this.pixiApp = pixiApp;
        this.trackId = trackId;
        this.id = region.id;

        this.background = new Graphics();
        this.wave = new Graphics();
        this.addChild(this.background);
        this.addChild(this.wave);
    }

    initRegion(color: string, region: Region) {
        this.position.x = region.start / RATIO_MILLS_BY_PX;
        this.drawWave(color, region);
        this.drawBackground();
    }

    /**
     * Draw the waveform of the track.
     * @param colorStr
     * @param region
     */
    drawWave(colorStr: string, region: Region) {
        let range = region.duration * 1000 / RATIO_MILLS_BY_PX;

        let color = +("0x" + colorStr.slice(1));
        this.wave.clear();
        this.wave.beginFill(color);

        let data = region.buffer.getChannelData(0);
        let step = Math.ceil(data.length / range);
        let amp = (HEIGHT_TRACK-1) / 2;
        for (let i = 0; i < range; i++) {
            let min = 1.0;
            let max = -1.0;
            for (let j = 0; j < step; j++) {
                let dataum = data[i * step + j];
                if (dataum < min) min = dataum;
                if (dataum > max) max = dataum;
            }
            this.wave.drawRect(i, (1+min) * amp, 1, Math.max(1, (max-min) * amp));
        }
    }

    drawBackground(color: number = 0x000000) {
        this.background.clear();
        this.background.beginFill(0xffffff, 0.2);
        this.background.lineStyle({width: 1, color: color});
        this.background.drawRect(0, 0, this.width, HEIGHT_TRACK-1);
    }

    select() {
        this.drawBackground(0xffffff);
    }

    deselect() {
        this.drawBackground();
    }
}