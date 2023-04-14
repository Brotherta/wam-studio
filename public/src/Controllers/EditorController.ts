import App from "../App";
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
     * Defines the drag and drop functionality for the editor.
     * It adds the dropped files to the track view.
     */
    defineDragAndDrop() {
        ["dragenter", "dragstart"].forEach(eventName => {
           this.editor.editor.addEventListener(eventName, () => {
               this.app.editorView.dragCover.hidden = false;
           });
        });


        this.app.editorView.dragCover.addEventListener("dragleave", () => {
            this.app.editorView.dragCover.hidden = true;
        });

        window.ondragend = () => {
            this.app.editorView.dragCover.hidden = true;
        }

        this.app.editorView.dragCover.addEventListener("drop", (e) => {
            let files = e.dataTransfer!.files;
            this.app.editorView.dragCover.hidden = true;
            console.table(files);
            ([...files]).forEach(file => {
                this.app.tracks.newTrackWithFile(file)
                    .then(track => {
                        if (track !== undefined) {
                            this.app.tracksController.initTrackComponents(track);

                        }
                    });
            });
        });
    }
}