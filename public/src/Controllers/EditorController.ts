import App from "../App";
import EditorView from "../Views/EditorView";


/**
 * Controller for the canvas view. This controller is responsible for adding and removing waveforms from the canvas.
 */
export default class EditorController {

    editorView: EditorView;
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
                    this.generateSHAHash(file);
                    this.app.loader.loadProject(file);
                }
                else {
                    this.app.tracksController.newTrackWithFile(file)
                        .then(track => {
                            if (track !== undefined) {
                                this.app.tracksController.initTrackComponents(track);

                            }
                        });
                }
            });
        });
    }

    async generateSHAHash(file: File) {
        if (!file) {
            console.error('No file selected');
            return;
        }

        try {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            // @ts-ignore
            const md5Hash = await this.generateSHA(arrayBuffer);
            console.log(`SHA Hash: ${md5Hash}`);
        } catch (error) {
            console.error('Error generating SHA hash', error);
        }
    }

    readFileAsArrayBuffer(file: File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                // @ts-ignore
                resolve(event.target.result);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    }

    async generateSHA(arrayBuffer: ArrayBuffer) {
        console.log('Generating SHA hash...');
        const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
        return this.bufferToHex(digest);
    }

    bufferToHex(buffer: ArrayBuffer) {
        const view = new DataView(buffer);
        let hexString = '';

        for (let i = 0; i < view.byteLength; i += 4) {
            const uint32 = view.getUint32(i);
            hexString += uint32.toString(16).padStart(8, '0');
        }

        return hexString;
    }

}