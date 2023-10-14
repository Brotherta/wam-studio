import { Container, Graphics, Text } from "pixi.js";
import EditorView from "./EditorView";
import { RATIO_MILLS_BY_PX, MAX_DURATION_SEC } from "../../Env";

export default class GridView extends Container {
  /**
   * The main editor of the application.
   */
  private _editorView: EditorView;
  /**
   * PIXI.Graphics that represent the grid of bars.
   */
  public grid: Graphics;
  private listOfTextElements: Text[] = [];
  private nbStepsPerBar: number = 4;
  private nbStepsPerBeat: number = 4;
  private bpm:number = 120;

  constructor(editor: EditorView) {
    super();
    this._editorView = editor;

    this._editorView.viewport.addChild(this);

    this.zIndex = 99;

    this.draw();
  }

  updateTimeSignature(nbStepsPerBar:number, nbStepsPerBeat:number) {
    this.nbStepsPerBar = nbStepsPerBar;
    this.nbStepsPerBeat = nbStepsPerBeat;
    this.updateGrid();
  }

  updateTempo(bpm:number) {
    console.log("gridView update tempo to " + bpm);
    console.log("for the moment, we're not changing the grid.");
    console.log("See comments in GridView/updateTempo method!");

    //this.bpm = bpm;
    //this.updateGrid();
    
    // MB : the grid view should not be affected if we change the tempo, only
    // the speed of play and current time display, and speed of playhead.
    // so far with the current code, it changes the grid !!!

    // current grid suppose a bpm of 120. If tempo changes, only impact playhed, time display,
    // waveform lengths, not the grid !!!!!
  }

  private draw(): void {
    // get width of editorView

    const width = (MAX_DURATION_SEC * 1000) / RATIO_MILLS_BY_PX; //this._editorView.viewport.width;
    const height = this._editorView.viewport.height;

    this.grid = new Graphics();

    // using a for loop, draw vertical lines, from x = 0 to x=width, step = 100 pixels
    this.grid.lineStyle(1, "red", 0.2);
    
    // number of steps in bar
    // Should be taken from the rythm key signature element when it will be available
    let nbSteps = this.nbStepsPerBar;

    // duration of 1 step in ms
    const stepInMs = ((this.bpm / 60) * 1000)/4; // 120bpm = 2 beats per second = 2*1000ms per second = 2*1000/4 = 500ms per step
    const barInMS = stepInMs * nbSteps; // 4 steps per bar = 4*500ms = 2000ms per bar at 120bpm 
    const stepWidth = stepInMs / RATIO_MILLS_BY_PX;
    const barWidth = barInMS / RATIO_MILLS_BY_PX;

    let displaySteps = true;
    if (stepWidth < 6) displaySteps = false;

    // number of pixels per bar
    //const barWidth = nbSteps * stepWidth;
    //console.log("stepWidth=" + stepWidth + " barWidth=" + barWidth);
    let displayBarsEvery = 1;
    if (barWidth < 20) {
      // display only one bar out of 2
      displayBarsEvery = 2;
    }
    if (barWidth < 10) {
      // display only one bar out of 4
      displayBarsEvery = 4;
    }
    if (barWidth < 6) {
      // display only one bar out of 4
      displayBarsEvery = 8;
    }

    // number of bars
    let nbBars = Math.floor(width / barWidth);
    // draw bars
    for (
      let currentBarNumberXpos = 0;
      currentBarNumberXpos < nbBars;
      currentBarNumberXpos++
    ) {
      if (displaySteps) {
        // draw vertical lines for steps, less visible
        this.grid.lineStyle(0.5, "#858181", 0.1);
        for (let y = 0; y < nbSteps; y++) {
          this.grid.beginFill("#858181", 0.5);
          // Grid should be as high as the canvas
          this.grid.drawRect(
            currentBarNumberXpos * barWidth + y * stepWidth,
            17,
            1,
            height
          );
        }
      }

      const barNumber = currentBarNumberXpos;
      //console.log("barNumber=" + barNumber + " displayBarsEvery=" + displayBarsEvery)
      //console.log("barNumber % (displayBarsEvery) = " + (barNumber % (displayBarsEvery)));
      if (displayBarsEvery === 1 || barNumber % displayBarsEvery === 0) {
        //console.log("DRAW BAR NUMBER" + barNumber+1)
        // draw bar separator
        this.grid.lineStyle(1, "#858181", 0.5);
        // draw vertical line for bar separator
        this.grid.beginFill("#858181", 0.5);
        // Grid should be as high as the canvas
        this.grid.drawRect(currentBarNumberXpos * barWidth, 7, 1, height);

        // using pixi draw text just after bar separator
        const text = this.addChild(
          new Text(barNumber + 1, {
            fontSize: 10,
            fill: 0x858181,
            align: "left",
          })
        );
        text.anchor.set(0.5);
        text.resolution = 1;
        text.x = currentBarNumberXpos * barWidth + 8;
        text.y = 12;

        this.listOfTextElements.push(text);
      } else {
        // do not display the bar number
      }
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

  clearGrid() {
    this.grid.clear();
    this.listOfTextElements.forEach((element) => {
      this.removeChild(element);
    });

    this.listOfTextElements = [];
  }

  updateGrid() {
    this.clearGrid()
    this.draw();
  }

  resize() {
      this.updateGrid();
  }
}
