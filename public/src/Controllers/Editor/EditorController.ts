import App from "../../App";
import EditorView from "../../Views/Editor/EditorView";


export default class EditorController {

    editor: EditorView;
    app: App;

    constructor(app: App) {
        this.editor = app.editorView;
        this.app = app;

        this.bindEvents();
    }

    /**
     * Defines the drag and drop functionality for the editor.
     * It adds the dropped files to the track view.
     */
    bindEvents() {
        ["dragenter", "dragstart"].forEach(eventName => {
            this.editor.canvasContainer.addEventListener(eventName, () => {
                this.editor.dragCover.hidden = false;
            });
        });

        window.addEventListener("resize", () => {
            this.editor.resizeCanvas();
        });

        this.editor.dragCover.addEventListener("dragleave", () => {
            this.editor.dragCover.hidden = true;
        });

        window.ondragend = () => {
            this.editor.dragCover.hidden = true;
        }

        this.editor.dragCover.addEventListener("drop", (e) => {
            let files = e.dataTransfer!.files;
            this.editor.dragCover.hidden = true;
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