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
        this.defineDragAndDrop();
    }

    /**
     * Add the according waveform to the track in the canvas. It also resizes the canvas.
     * @param track
     */
    addWaveFormToTrack(track: Track) {
        this.editor.addWaveForm(track);
        this.editor.resizeCanvas();
    }

    /**
     * Remove the according waveform from the track in the canvas. It also resizes the canvas.
     * @param track
     */
    removeWafeFormOfTrack(track: Track) {
        this.editor.removeWaveForm(track);
        this.editor.resizeCanvas();
    }

    /**
     * Defines the drag and drop functionality for the editor.
     * It adds the dropped files to the track view.
     */
    defineDragAndDrop() {
        ["dragenter", "dragover"].forEach(eventName => {
           window.addEventListener(eventName, () => {
               this.app.editorView.dragCover.hidden = false;
           });
        });

        ["drop", "dragleave"].forEach(eventName => {
            this.app.editorView.dragCover.addEventListener(eventName, () => {
                this.app.editorView.dragCover.hidden = true;
            });
        });

        window.addEventListener("drop", (e) => {
            let files = e.dataTransfer!.files;
            console.table(files);
            ([...files]).forEach(file => {
                this.app.tracks.newTrackWithFile(file)
                    .then(track => {
                        if (track !== undefined) {
                            this.app.tracksController.addNewTrackInit(track);
                            this.app.editorController.addWaveFormToTrack(track);
                            this.app.specialsController.addSpecialControlToTrack(track);
                        }
                    });
            });
        });
    }
}