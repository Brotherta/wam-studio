import { Container, Graphics } from "pixi.js";
import { HEIGHT_TRACK, RATIO_MILLS_BY_PX } from "../../../Env";
import { RegionOf } from "../../../Models/Region/Region";
import { debounce } from "../../../Utils/gui_callback";
import EditorView from "../EditorView";

/**
 * Class that extends PIXI.Container.
 * It will contain the PIXI.Graphics that represents the waveform of the current region.
 */
export default abstract class RegionView<REGION extends RegionOf<REGION>> extends Container {

    /** The unique ID of the track that contains the region. */
    public trackId: number;

    /** The unique ID of the region. */
    public id: number;

    /** The main editor of the application. */
    private _editorView: EditorView;

    /** The PIXI.Graphics that represent the waveform. */
    private _wave: Graphics;

    /** The background of the region, borders included. */
    private _background: Graphics;

    /** The contained region  */
    private region_width: number;
    


    constructor(editor: EditorView, region: REGION) {
        super();
        this.eventMode = "dynamic";

        this._editorView = editor;
        this.trackId = region.trackId;
        this.id = region.id;

        this._background = new Graphics();
        this._wave = new Graphics();
        this.addChild(this._background);
        this.addChild(this._wave);
    }

    /**
     * Initializes the region view given the region and the color.
     * It will set the position of the region depending on the ratio of pixels by milliseconds.
     * It will also draw the wave and the background.
     *
     * @param color - The color in HEX format (#FF00FF).
     * @param region - The region that will contain the buffer to draw.
     */
    public initializeRegionView(color: string, region: REGION): void {
        this.position.x = region.pos
        this.region_width = region.width

        this.drawContent(this._wave, color, region, 0, region.duration)
        this.drawBackground()
    }

    /**
     * Redraw the full content of the region.
     * @param target 
     * @param color 
     * @param region 
     * @param start 
     */
    protected abstract drawContent(target: Graphics, color: string, region: REGION, from: number, to :number): void

    public redraw(color: string, region: REGION){
        this.region_width = region.width
        this.drawBackground()
        this._wave.clear()
        this.drawContent(this._wave, color, region, 0, region.duration)
    }

    /**
     * Draw the region on the given target, in the given color, in the given region, from the given start to the given end (in milliseconds).
     * @param color 
     * @param region 
     * @param start 
     * @param from 
     */
    public draw(color: string, region: REGION, start: number=0, from: number=region.duration){
        this.region_width = region.width
        this.drawBackground()
        this.drawContent(this._wave, color, region, start, from)
    }

    redrawSoon = debounce(this.redraw.bind(this), 1000)


    /** Is the region selected or not. Use to draw the current border of the background. */
    public set isSelected(value: boolean) {
        this._isSelected = value
        if(value)this._isSubSelected = false
        this.drawBackground();
    }

    public get isSelected(){ return this._isSelected }

    private _isSelected=false


    /** Is the region secondary selected or not. Use to draw the current border of the background. */
    public set isSubSelected(value: boolean) {
        this._isSubSelected = value
        if(value)this._isSelected = false
        this.drawBackground()
    }

    public get isSubSelected(){ return this._isSubSelected }

    private _isSubSelected=false
    

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

    /** Draws the background of the region. It will check if the region is selected or not to draw the border. */
    private drawBackground(): void {
        let color
        if(this.isSelected) color = 0xffffff
        else if(this.isSubSelected) color = 0xffaa00
        else color = 0x000000
        this._background.clear();
        this._background.beginFill(0xffffff, 0.3);
        this._background.lineStyle({width: 1, color: color});
        this._background.drawRect(0, 0, this.region_width, HEIGHT_TRACK-1);
    }

}