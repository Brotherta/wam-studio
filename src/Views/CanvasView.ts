import { Application, Graphics } from "pixi.js"
import { MAX_DURATION_SEC, RATIO_MILLS_BY_PX, SAMPLE_RATE } from "../Utils";

export default class CanvasView {

    canvas: Application
    editor = document.getElementById("editor") as HTMLDivElement;
    playheadRange = document.getElementById("playhead-range") as HTMLInputElement;
    playhead = document.getElementById("playhead") as HTMLDivElement;

    width = (MAX_DURATION_SEC * 1000) / RATIO_MILLS_BY_PX;
    height = 1000;

    playheadLine: Graphics | undefined

    constructor(){
        this.canvas = new Application({width: this.width, height: this.height, backgroundColor: 0x121213})
        this.editor.appendChild(this.canvas.view);
        
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
        this.canvas.stage.addChild(this.playheadLine);
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
}