import {Container, Graphics} from "pixi.js";
import EditorView from "./EditorView";
import {RATIO_MILLS_BY_PX} from "../../Env";

/**
 * Class that represent the loop. It's a PIXI.JS Container that will contain the track, the handle and the line of the loop.
 */
export default class LoopView extends Container {

    public track: Container;
    public handle: Container;
    public leftHandle: Graphics;
    public rightHandle: Graphics;
    public background: Graphics;
    public active: boolean;

    private _window: Graphics;
    private _editor: EditorView;

    public static readonly HANDLE_WIDTH: number = 10;
    public static readonly BACKGROUND_WIDTH: number = 90;
    public static readonly WINDOW_WIDTH: number = 110;

    constructor(editor: EditorView) {
        super();

        this._editor = editor;
        this.sortableChildren = true;
        this.position.x = 0;
        this.position.y = 0;
        this.zIndex = 100;
        this.active = false;

        this.track = new Container();
        this.track.eventMode = "dynamic";
        this.track.zIndex = 99;

        this.handle = new Container();
        this.handle.eventMode = "dynamic";
        this.handle.zIndex = 100;
        this.handle.sortableChildren = true;

        this.drawTrack();
        this.initHandleSize();

        this._editor.viewport.addChild(this.track);
        this._editor.viewport.addChild(this);
    }

    /**
     * Updates the position of the handle and the background. The background is scaled to fit the handle.
     * The background is scaled only if the scale parameter is true.
     *
     * @param leftPosition - The position of the left handle in pixels.
     * @param rightPosition - The position of the right handle in pixels.
     * @param scale - If the background should be scaled or not.
     */
    public updateHandlePosition(leftPosition: number, rightPosition: number, scale:boolean): void {
        this.background.x = leftPosition + LoopView.HANDLE_WIDTH;
        this.rightHandle.x = rightPosition;
        this.leftHandle.x = leftPosition;
        if (scale) {
            const backgroundWidth = rightPosition + /* LoopView.HANDLE_WIDTH */ - leftPosition;
            this.background.scale.x = backgroundWidth / LoopView.BACKGROUND_WIDTH;
        }
        this.drawWindow();
    }

    /**
     * Updates the position of the handle and the background. The background is scaled to fit the handle.
     * The background is scaled only if the scale parameter is true.
     * The position is given in milliseconds. It's converted to pixels.
     *
     * @param leftTime - The left time of the loop in milliseconds.
     * @param rightTime - The right time of the loop in milliseconds.
     */
    public updatePositionFromTime(leftTime: number, rightTime: number): void {
        const leftPosition = leftTime / RATIO_MILLS_BY_PX;
        const rightPosition = rightTime / RATIO_MILLS_BY_PX;

        this.updateHandlePosition(leftPosition, rightPosition-LoopView.HANDLE_WIDTH, true);
    }

    /**
     * Resizes the playhead given the new sizes of the editor.
     */
    public resize(): void {
        this.drawTrack();
    }

    /**
     * Update the active state of the loop. If the loop is active, the background is colored.
     * And the window is drawn.
     *
     * @param looping
     */
    public updateActive(looping: boolean) {
        this.active = looping;
        const color = this.active ? 0x5C69CC : 0x333b77;
        this.background.tint = color;
        this.leftHandle.tint = color;
        this.rightHandle.tint = color;
        this.drawWindow();
    }

    /**
     * Only redraw the children of the track containers.
     */
    private drawTrack(): void {
        if (this.track.children.length > 0) this.track.removeChildren();
        let background = new Graphics();
        background.beginFill(0x2f3439);
        background.drawRect(0, 0, this._editor.worldWidth, EditorView.LOOP_HEIGHT);
        background.endFill();
        background.zIndex = 105;
        this.track.addChild(background);
    }

    private initHandleSize() {
        if (this.handle) this.handle.removeChildren();

        this.drawBackground();
        this.drawLeftHandle();
        this.drawRightHandle();
        this.drawWindow();

        this.addChild(this.handle);
    }

    private drawLeftHandle(): void {
        const color = this.active ? 0x5C69CC : 0x333b77;
        this.leftHandle = new Graphics();
        this.leftHandle.eventMode = "dynamic";

        this.leftHandle.beginFill(0xffffff);
        this.leftHandle.drawRect(0, 0, LoopView.HANDLE_WIDTH, EditorView.LOOP_HEIGHT+4);
        this.leftHandle.endFill();

        this.leftHandle.zIndex = 105;
        this.leftHandle.x = 0;
        this.handle.addChild(this.leftHandle);
        this.leftHandle.tint = color;
    }

    private drawRightHandle(): void {
        const color = this.active ? 0x5C69CC : 0x333b77;
        this.rightHandle = new Graphics();
        this.rightHandle.eventMode = "dynamic";

        this.rightHandle.beginFill(0xffffff);
        this.rightHandle.drawRect(0, 0, LoopView.HANDLE_WIDTH, EditorView.LOOP_HEIGHT+4);
        this.rightHandle.endFill();

        this.rightHandle.zIndex = 105;
        this.rightHandle.x = LoopView.HANDLE_WIDTH + LoopView.BACKGROUND_WIDTH;
        this.handle.addChild(this.rightHandle);
        this.rightHandle.tint = color;
    }

    private drawBackground(): void {
        const color = this.active ? 0x5C69CC : 0x333b77;
        this.background = new Graphics();
        this.background.eventMode = "dynamic";

        this.background.beginFill(0xffffff);
        this.background.drawRect(0, 0, LoopView.BACKGROUND_WIDTH, EditorView.LOOP_HEIGHT);
        this.background.endFill();

        this.background.zIndex = 100;
        this.background.x = LoopView.HANDLE_WIDTH;
        this.handle.addChild(this.background);
        this.background.tint = color;
    }

    private drawWindow(): void {
        if (this._window) this._window.destroy();
        const alpha = this.active ? 0.2 : 0;
        const width = this.rightHandle.x + LoopView.HANDLE_WIDTH - this.leftHandle.x;
        this._window = new Graphics();
        this._window.beginFill(0xffffff, alpha);
        this._window.drawRect(this.leftHandle.x, 0, width, 10000);
        this._window.endFill();
        this._window.eventMode = "none";
        this._window.zIndex = 105;
        this.handle.addChild(this._window);
    }

}