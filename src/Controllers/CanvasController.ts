import CanvasView from "../Views/Canvas/CanvasView";
import App from "../App";
import Track from "../Models/Track";

export default class CanvasController {

    canvas: CanvasView;
    app: App;

    constructor(app: App) {
        this.canvas = app.canvasView;
        this.app = app;
    }

    addWaveFormToTrack(track: Track) {
        this.canvas.addWaveForm(track);
        this.canvas.resizeCanvas();
    }

    removeWafeFormOfTrack(track: Track) {
        this.canvas.removeWaveForm(track);
        this.canvas.resizeCanvas();
    }
}