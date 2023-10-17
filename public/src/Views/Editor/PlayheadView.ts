import EditorView from "./EditorView";
import {Container, Graphics} from "pixi.js";
import {audioCtx} from "../../index";
import {RATIO_MILLS_BY_PX} from "../../Env";

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

    constructor(editor: EditorView) {
        super();

        this._editor = editor;

        this.eventMode = "dynamic";
        this.sortableChildren = true;
        this.position.x = 0;
        this.position.y = 0;
        this.zIndex = 101;

        this.track = new Container();
        this.track.eventMode = "dynamic";
        this.track.zIndex = 99;

        this.drawHandle();
        this.drawTrack();
        this._editor.viewport.addChild(this.track);
        this._editor.viewport.addChild(this);
    }

    /**
     * Resizes the playhead given the new sizes of the editor.
     */
    public resize() {
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
        const pixelPos = this.getPosFromPlayhead(playhead);
        this.moveTo(pixelPos);
        // check if pixelPos is visible in the viewport
        /*
        if (pixelPos < this._editor.viewport.left || pixelPos > this._editor.viewport.right) {
            this._editor.viewport.moveCenter(pixelPos, this._editor.viewport.center.y);
        }
        */
       // scroll smoothly the viewport when playhead reaches the center of the viewport
         if (pixelPos >= this._editor.viewport.center.x && pixelPos < this._editor.viewport.center.x + 25) {
              this._editor.viewport.moveCenter(pixelPos, this._editor.viewport.center.y);
         } else {
            // if the payhead is after center +5, and goes after the right border, center the viewport
            if (pixelPos > this._editor.viewport.center.x + 5 && pixelPos > this._editor.viewport.right) {
                this._editor.viewport.moveCenter(pixelPos, this._editor.viewport.center.y);
            } 
         }
         // adjust horizontal scrollbar so that it corresponds to the current viewport position
         // scrollbar pos depends on the left position of the viewport.
         this._editor.horizontalScrollbar.moveTo(this._editor.viewport.left);

    }

    public centerViewportAround() {
        // MB : for debugging viewport centering
        this._editor.viewport.moveCenter(this.position.x, this._editor.viewport.center.y);
        console.log("this._editor.viewport.center.x =" + this._editor.viewport.center.y)

    }
    /**
     * Draws the handle of the playhead and activate the PIXI events.
     */
    private drawHandle(): void {
        const width = EditorView.PLAYHEAD_WIDTH
        const height = EditorView.PLAYHEAD_HEIGHT
        if (this.handle) this.removeChild(this.handle);
        this.handle = new Graphics();

        this.handle.moveTo(0, 0);
        this.handle.lineStyle(1, 0xd3d3d3, 1);
        this.handle.beginFill(0xd3d3d3);
        this.handle.lineTo(0, 2/3*height);
        this.handle.lineTo(width/2, height);
        this.handle.lineTo(width/2, 10000);
        this.handle.lineTo(width/2, height)
        this.handle.lineTo(width, 2/3*height);
        this.handle.lineTo(width, 0);
        this.handle.endFill();

        this.addChild(this.handle);

        this.handle.zIndex = 2
        this.handle.eventMode = "dynamic";
        this.handle.x = -EditorView.PLAYHEAD_WIDTH/2;
        this.handle.y = EditorView.LOOP_HEIGHT;
    }

    /**
     * Only redraw the children of the track containers.
     */
    private drawTrack(): void {
        if (this.track.children.length > 0) this.track.removeChildren();
        let background = new Graphics();
        background.beginFill(0x3b4046);
        background.drawRect(0, 7, this._editor.worldWidth, EditorView.PLAYHEAD_HEIGHT);
        background.endFill();
        background.zIndex = 99;
        this.track.addChild(background);
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