import CanvasView from "../Views/Canvas/CanvasView";
import App from "../App";
import Track from "../Models/Track";

/**
 * Controller for the canvas view. This controller is responsible for adding and removing waveforms from the canvas.
 */
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