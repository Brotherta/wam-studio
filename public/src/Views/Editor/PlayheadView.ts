import EditorView from "./EditorView";
import {Container, Graphics} from "pixi.js";
import {audioCtx} from "../../index";
import {RATIO_MILLS_BY_PX} from "../../Utils/Variables";

/**
 * Class that represent the playhed. It's a PIXI.JS Container that will contain the track, the handle and the line of
 * the playhead.
 */
export default class PlayheadView extends Container {

    /**
     * PIXI.Graphics that represent the line of the playhead.
     */
    public line: Graphics;
    /**
     * PIXI.Graphics that represent the handle of the playhead. This object has event activated.
     */
    public handle: Graphics;
    /**
     * PIXI.Container that conatains all the rendering object of the playhead.
     */
    public track: Container


    /**
     * Editor's Application of PIXI.JS.
     */
    private _editor: EditorView;
    /**
     * Duplicated size of the world width in pixels of the container size contained in the _editor view.
     * Must be updated by the EditorView
     */
    private _worldWidth: number;
    /**
     * Duplicated size of the world height in pixels of the container size contained in the _editor view.
     * Must be updated by the EditorView
     */
    private _worldHeight: number;

    constructor(editor: EditorView) {
        super();

        this._editor = editor;

        this.eventMode = "dynamic";
        this.sortableChildren = true;
        this.position.x = 0;
        this.position.y = 0;

        this._worldWidth = this._editor.worldWidth;
        this._worldHeight = this._editor.worldHeight;

        this.width = 1;
        this.height = this._worldHeight;

        this.track = new Container();
        this.track.eventMode = "dynamic";
        this.track.zIndex = 99;

        this.zIndex = 100;
        this.drawLine();
        this.drawHandle();
        this.drawTrack();
        this._editor.viewport.addChild(this.track);
        this._editor.viewport.addChild(this);
    }

    /**
     * Resizes the playhead given the new sizes in parameters.
     *
     * @param width - The new width.
     * @param height - The new height.
     */
    public resize(width: number, height: number) {
        this._worldWidth = width;
        this._worldHeight = height;
        this.height = this._worldHeight;
        this.drawLine();
        this.drawTrack();
    }

    /**
     * Moves the playhead to the given position in the _editor.
     *
     * @param x - The x position in pixels.
     */
    public moveTo(x: number): void {
        this.position.x = x;
    }

    /**
     * Moves the playhead to the given playhead value. Convert the playhead value in pixels.
     *
     * @param playhead - The value of the playhead in the host. It represents the position in the buffer.
     */
    public moveToFromPlayhead(playhead: number): void {
        this.moveTo(this.getPosFromPlayhead(playhead));
    }

    /**
     * Draws the line in the playhead, given the world size in pixels.
     */
    private drawLine(): void {
        if (this.line) this.removeChild(this.line);
        this.line = new Graphics();
        this.line.lineStyle(1, 0xffffff, 1);
        this.line.moveTo(0, 0);
        this.line.lineTo(0, this._worldHeight);
        this.line.zIndex = 1;
        this.addChild(this.line);
    }

    /**
     * Draws the handle of the playhead and activate the PIXI events.
     */
    private drawHandle(): void {
        if (this.handle) this.removeChild(this.handle);
        this.handle = new Graphics();
        this.handle.moveTo(-5, 0);
        this.handle.beginFill(0x5C69CC);
        this.handle.drawRect(-5, 0, 10, 24);
        this.handle.endFill();
        this.handle.zIndex = 2
        this.handle.eventMode = "dynamic";
        this.addChild(this.handle);
    }

    /**
     * Only redraw the children of the track containers.
     */
    private drawTrack(): void {
        if (this.track.children.length > 0) this.track.removeChildren();
        let background = new Graphics();
        background.beginFill(0x3b4046);
        background.drawRect(0, 0, this._worldWidth, 25);
        background.endFill();
        background.zIndex = 99;
        this.track.addChild(background);
        let border = new Graphics();
        border.lineStyle(1, 0xffffff, 1);
        border.drawRect(0, 0, this._worldWidth, 25);
        border.zIndex = 100;
    }

    /**
     * Gets the x position from the given playhead position.
     * Calculated with the ratio between the milliseconds and the pixels and the sample rate.
     *
     * @param playhead - The value of the playhead in the host. It represents the position in the buffer.
     */
    private getPosFromPlayhead(playhead: number): number {
        let millis = (playhead / audioCtx.sampleRate) * 1000;
        return millis / RATIO_MILLS_BY_PX;
    }

}