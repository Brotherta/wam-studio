import {Container, Graphics, Text} from "pixi.js";
import EditorView from "./EditorView";
import {RATIO_MILLS_BY_PX, MAX_DURATION_SEC} from "../../Env";

export default class GridView extends Container {
    /**
     * The main editor of the application.
     */
    private _editorView: EditorView;
    /**
     * PIXI.Graphics that represent the grid of bars.
     */
    public grid: Graphics;
    private listOfTextElements:Text[] = [];

    constructor(editor: EditorView) {
        super();
        this._editorView = editor;
       
        this._editorView.viewport.addChild(this);

        this.zIndex = 1000;

        this.draw();
    }

    private draw(): void {
        // get width of editorView

        const width = MAX_DURATION_SEC * 1000 / RATIO_MILLS_BY_PX;//this._editorView.viewport.width;
        const height = this._editorView.canvasContainer.clientHeight;
        
        this.grid = new Graphics();

        // using a for loop, draw vertical lines, from x = 0 to x=width, step = 100 pixels
        this.grid.lineStyle(1, "red", 0.2);
        // Bar being drawn
        let barNumber=0;
        // current step in bar
        let step=0;
        // number of steps in bar
        // Should be taken from the rythm key signature element when it will be available
        let nbSteps = 4;
        // number of pixels per step
        // Grid corresponds by default to a tempo of 120bpm and 4 steps per bar
        let bpm=120;
        let stepInMs = bpm/60*1000/nbSteps;   // 120bpm = 2 beats per second = 2*1000ms per second = 2*1000/4 = 500ms per step
        let stepWidth = stepInMs/RATIO_MILLS_BY_PX;  
        // number of pixels per bar
        let barWidth = nbSteps * stepWidth;
        // number of bars
        let nbBars = Math.floor(width/barWidth);
        // draw bars
        for (let currentBarNumberXpos = 0; currentBarNumberXpos < nbBars; currentBarNumberXpos++) {
            // draw vertical lines for steps, less visible
            this.grid.lineStyle(0.5, "#858181", 0.1);
            for (let y = 0; y < nbSteps; y++) {
                this.grid.beginFill("#858181", 1);
                // Grid should be as high as the canvas
                this.grid.drawRect(currentBarNumberXpos*barWidth+y*stepWidth, 17, 1, height); 
            }

            // draw bar separator
            this.grid.lineStyle(1, "#858181", 1);
            // draw vertical line for bar separator
            this.grid.beginFill("#858181", 1);
            // Grid should be as high as the canvas
            this.grid.drawRect(currentBarNumberXpos*barWidth, 7, 1, height); 

            // using pixi draw text just after bar separator
            const text = this.addChild(
                new Text(currentBarNumberXpos, {
                  fontSize: 10,
                  fill: 0x858181,
                  align: "left"
                })
              );
              text.anchor.set(0.5);
              text.resolution = 1;
              text.x = currentBarNumberXpos*barWidth + 8;
              text.y = 12;

            this.listOfTextElements.push(text);
        }
        /*
        for (let x = 0; x < width; x += 100) {
            this.grid.beginFill("red", 1);
            // Grid should be as high as the canvas
            this.grid.drawRect(x, 0, 1, height); 
            //this.grid.drawRect(x, EditorView.LOOP_HEIGHT, 1, height);
        }
*/
        this.addChild(this.grid);
    }

    resize() {
        this.grid.clear();
        this.listOfTextElements.forEach(element => {
            this.removeChild(element);
        });
        
        this.listOfTextElements = []

        this.draw();
    }
}