import {Application, Graphics} from "pixi.js";
import {MAX_DURATION_SEC, RATIO_MILLS_BY_PX} from "../Utils";
import {audioCtx} from "../index";

/**
 * Class responsible for displaying the playhead. It is a line that moves on the canvas.
 */
export default class PlayheadView {

    pixiApp: Application

    playheadRange = document.getElementById("playhead-range") as HTMLInputElement;
    playhead = document.getElementById("playhead") as HTMLDivElement;
    trackContainer = document.getElementById("track-container") as HTMLDivElement;

    width = (MAX_DURATION_SEC * 1000) / RATIO_MILLS_BY_PX;
    height = this.trackContainer.scrollHeight - 35;

    playheadLine: Graphics | undefined

    constructor(pixiApp: Application) {
        this.pixiApp = pixiApp;
        this.initPlayhead();
    }

    /**
     * Initialize the playhead. Set the width of the playhead and the playhead range.
     */
    initPlayhead() {
        console.log(this.width);

        this.playheadRange.max = `${this.width}`;
        this.playheadRange.min = "0";
        this.playheadRange.step = "1";
        this.drawPlayhead();
        this.playhead.style.width = `${this.width}`;
        this.playheadRange.style.width = `${this.width}`;
    }

    /**
     * Draw the playhead line. Called once when the playhead is initialized.
     */
    drawPlayhead() {
        this.playheadLine = new Graphics()
            .lineStyle(1, 0xFFFFFF, 1)
            .moveTo(0, 0)
            .lineTo(0, this.height);
        this.playheadLine.zIndex = 20;
        this.pixiApp.stage.addChild(this.playheadLine);
    }

    /**
     * Move the playhead line to the given x position.
     * @param x
     */
    movePlayheadLine(x: number) {
        this.playheadLine!!.position.x = x;
    }

    /**
     * Move the playhead line to the given playhead position.
     * @param playhead
     */
    movePlayhead(playhead: number) {
        let x = this.getXfromPlayhead(playhead);
        this.playheadRange.value = `${x}`;
        this.movePlayheadLine(x);
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
}