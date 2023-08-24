import EditorView from "./EditorView";
import {Container, Graphics} from "pixi.js";
import {audioCtx} from "../../index";
import {RATIO_MILLS_BY_PX} from "../../Utils/Variables";


export default class PlayheadView extends Container {

    editor: EditorView;

    line: Graphics;
    handle: Graphics;
    track: Container;


    worldWidth: number;
    worldHeight: number;

    constructor(editor: EditorView) {
        super();

        this.editor = editor;

        this.eventMode = "dynamic";
        this.sortableChildren = true;
        this.position.x = 0;
        this.position.y = 0;

        this.worldWidth = this.editor.worldWidth;
        this.worldHeight = this.editor.worldHeight;

        this.width = 1;
        this.height = this.worldHeight;

        this.track = new Container();
        this.track.eventMode = "dynamic";
        this.track.zIndex = 99;

        this.zIndex = 100;
        this.drawLine();
        this.drawHandle();
        this.drawTrack();
        this.editor.viewport.addChild(this.track);
        this.editor.viewport.addChild(this);
    }

    drawLine() {
        if (this.line) this.removeChild(this.line);
        this.line = new Graphics();
        this.line.lineStyle(1, 0xffffff, 1);
        this.line.moveTo(0, 0);
        this.line.lineTo(0, this.worldHeight);
        this.line.zIndex = 1;
        this.addChild(this.line);
    }

    drawHandle() {
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

    drawTrack() {
        if (this.track.children.length > 0) this.track.removeChildren();
        let background = new Graphics();
        background.beginFill(0x3b4046);
        background.drawRect(0, 0, this.worldWidth, 25);
        background.endFill();
        background.zIndex = 99;
        this.track.addChild(background);
        let border = new Graphics();
        border.lineStyle(1, 0xffffff, 1);
        border.drawRect(0, 0, this.worldWidth, 25);
        border.zIndex = 100;
    }

    movePlayheadFromPosition(x: number) {
        this.position.x = x;
    }

    movePlayhead(x: number) {
        this.position.x = this.getXfromPlayhead(x);
    }

    /**
     * Get the x position from the given playhead position.
     * Calculated with the ratio between the milliseconds and the pixels and the sample rate.
     *
     * @param playhead
     */
    getXfromPlayhead(playhead: number) {
        let millis = (playhead / audioCtx.sampleRate) * 1000;
        return millis / RATIO_MILLS_BY_PX;
    }

    resize(width: number, height: number) {
        this.worldWidth = width;
        this.worldHeight = height;
        this.height = this.worldHeight;
        this.drawLine();
        // this.drawHandle();
        this.drawTrack();
    }
}