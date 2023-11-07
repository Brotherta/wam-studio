import EditorView from "./EditorView";
import {Container, Graphics} from "pixi.js";
import Region from "../../Models/Region";
import {HEIGHT_TRACK, DEFAULT_RATIO_MILLS_BY_PX_FOR_120_BPM, RATIO_MILLS_BY_PX, TEMPO_RATIO} from "../../Env";

/**
 * Class that extends PIXI.Container.
 * It will contain the PIXI.Graphics that represents the waveform of the current region.
 */
export default class RegionView extends Container {

    /**
     * The unique ID of the track that contains the region.
     */
    public trackId: number;
    /**
     * The unique ID of the region.
     */
    public id: number;

    /**
     * The main editor of the application.
     */
    private _editorView: EditorView;
    /**
     * The PIXI.Graphics that represent the waveform.
     */
    private _wave: Graphics;
    /**
     * The background of the region, borders included.
     */
    private _background: Graphics;
    /**
     * Boolean to know if the region is selected or not. Use to draw the current border of the background.
     */
    private _selected: boolean;

    constructor(editor: EditorView, trackId: number, region: Region) {
        super();
        this.eventMode = "dynamic";

        this._editorView = editor;
        this.trackId = trackId;
        this.id = region.id;
        this._selected = false;

        this._background = new Graphics();
        this._wave = new Graphics();
        this.addChild(this._background);
        this.addChild(this._wave);
        // TODO CLIP WAVE
    }

    /**
     * Initializes the region view given the region and the color.
     * It will set the position of the region depending on the ratio of pixels by milliseconds.
     * It will also draw the wave and the background.
     *
     * @param color - The color in HEX format (#FF00FF).
     * @param region - The region that will contain the buffer to draw.
     */
    public initializeRegionView(color: string, region: Region): void {
        region.pos = region.start / RATIO_MILLS_BY_PX;
        this.position.x = region.pos;
        this.drawWave(color, region);
        this.drawBackground();
    }
  

    /**
     * Draws the waveform of the track.
     *
     * @param color - The color in HEX format (#FF00FF).
     * @param region - The region that will contain the buffer to draw.
     */
    public drawWave(color: string, region: Region): void {
        let range = (region.duration * 1000 / RATIO_MILLS_BY_PX)  ;
        this.scale.x = 1;

        let colorHex = +("0x" + color.slice(1));
        this._wave.clear();
        // use some color transparency as regions can overlap
        this._wave.beginFill(colorHex, 0.8);

        let amp = (HEIGHT_TRACK-1) / 2;
        for (let channel = 0; channel < region.buffer.numberOfChannels; channel++) {
            let data = region.buffer.getChannelData(channel);
            let step = Math.round(data.length / range);

            for (let i = 0; i < range; i++) {
                let min = 1.0;
                let max = -1.0;
                for (let j = 0; j < step; j++) {
                    let dataum = data[i * step + j];
                    if (dataum < min) min = dataum;
                    if (dataum > max) max = dataum;
                }
                const rectWidth = 1;
                let rectHeight = Math.max(1, (max-min) * amp);

                // MB: we need to clip the rectangle so that if does not go over track dimensions
                if(rectHeight < HEIGHT_TRACK) {
                    this._wave.drawRect(i, (1+min) * amp, rectWidth, rectHeight);
                } else {
                    rectHeight = HEIGHT_TRACK;
                    this._wave.drawRect(i, 0 * amp, rectWidth, rectHeight);
                }
            }
        }
    }

    /**
     * Draws the background of the region to be selected. (White border)
     */
    public select(): void {
        this._selected = true;
        this.drawBackground();
    }

    /**
     * Draws the background of the region to be deselected. (No border)
     */
    public deselect():void {
        this._selected = false;
        this.drawBackground();
    }

    /**
     * Scales the region given the new duration and the current ratio of pixels by milliseconds.
     *
     * @param duration - The duration in seconds of the region.
     * @param start - The start of the region in milliseconds.
     */
    public stretch(duration: number, start: number): void {
        this.scale.x = 1;
        const newWidth = (duration * 1000) / RATIO_MILLS_BY_PX;
        const scaleFactor = newWidth / this.width
        this.scale.x *= scaleFactor;
        this.position.x = start / RATIO_MILLS_BY_PX;
    }

    /**
     * Draws the background of the region. It will check if the region is selected or not to draw the border.
     * @private
     */
    private drawBackground(): void {
        let color = this._selected ? 0xffffff : 0x000000
        this._background.clear();
        this._background.beginFill(0xffffff, 0.3);
        this._background.lineStyle({width: 1, color: color});
        this._background.drawRect(0, 0, this.width, HEIGHT_TRACK-1);
    }

}