import App from "../App";
import Track from "../Models/Track";
import EditorView from "../Views/EditorView";

/**
 * Controller for the canvas view. This controller is responsible for adding and removing waveforms from the canvas.
 */
export default class EditorController {

    editor: EditorView;
    app: App;

    constructor(app: App) {
        this.editor = app.editorView;
        this.app = app;
    }

    addWaveFormToTrack(track: Track) {
        this.editor.addWaveForm(track);
        this.editor.resizeCanvas();
    }

    removeWafeFormOfTrack(track: Track) {
        this.editor.removeWaveForm(track);
        this.editor.resizeCanvas();
    }
}