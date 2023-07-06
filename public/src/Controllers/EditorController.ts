import App from "../App";
import EditorViewOld from "../Views/EditorViewOld";


/**
 * Controller for the canvas view. This controller is responsible for adding and removing waveforms from the canvas.
 */
export default class EditorController {

    editorView: EditorViewOld;
    app: App;

    constructor(app: App) {
        this.editorView = app.editorView;
        this.app = app;
        this.defineDragAndDrop();
    }

    /**
     * Defines the drag and drop functionality for the editor.
     * It adds the dropped files to the track view.
     */
    defineDragAndDrop() {
        ["dragenter", "dragstart"].forEach(eventName => {
           this.editorView.editor.addEventListener(eventName, () => {
               this.editorView.dragCover.hidden = false;
           });
        });


        this.editorView.dragCover.addEventListener("dragleave", () => {
            this.editorView.dragCover.hidden = true;
        });

        window.ondragend = () => {
            this.editorView.dragCover.hidden = true;
        }

        this.editorView.dragCover.addEventListener("drop", (e) => {
            let files = e.dataTransfer!.files;
            this.editorView.dragCover.hidden = true;
            console.table(files);
            ([...files]).forEach(file => {
                if (file.type == "application/zip") {
                    generateSHAHash(file);
                    this.app.loader.loadProject(file);
                }
                else {
                    this.app.tracksController.newTrackWithFile(file)
                        .then(track => {
                            if (track !== undefined) {
                                this.app.tracksController.initTrackComponents(track);
                                track.element.progressDone();
                            }
                        });
                }
            });
        });
    }



}