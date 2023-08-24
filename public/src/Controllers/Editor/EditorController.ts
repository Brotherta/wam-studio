import App from "../../App";
import EditorView from "../../Views/Editor/EditorView";
import {RATIO_MILLS_BY_PX, updateRatioMillsByPx} from "../../Utils/Variables";
import {audioCtx} from "../../index";


export default class EditorController {

    editor: EditorView;
    app: App;

    private readonly MIN_RATIO = 5;
    private readonly MAX_RATIO = 500;
    private readonly ZOOM_STEPS = 10;

    private zoomRenderTimeOut: NodeJS.Timeout;
    private currentLevel = 5;


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

    getZoomRatioByLevel(level: number) {
        const range = Math.log(this.MAX_RATIO) - Math.log(this.MIN_RATIO);
        const step = range / (this.ZOOM_STEPS - 1);
        return Math.exp(Math.log(this.MIN_RATIO) + step * level);
    }

    zoomIn() {
        if (this.zoomRenderTimeOut) clearInterval(this.zoomRenderTimeOut);
        this.currentLevel = Math.max(this.currentLevel - 1, 0);
        const ratio = this.getZoomRatioByLevel(this.currentLevel);
        updateRatioMillsByPx(ratio);
        this.updateZoom();
    }

    zoomOut() {
        if (this.zoomRenderTimeOut) clearInterval(this.zoomRenderTimeOut);
        this.currentLevel = Math.min(this.ZOOM_STEPS - 1, this.currentLevel + 1);
        const ratio = this.getZoomRatioByLevel(this.currentLevel);
        updateRatioMillsByPx(ratio);
        this.updateZoom();
    }

    async updateZoom() {
        this.editor.resizeCanvas();
        this.app.tracksController.trackList.forEach(track => {
            track.updateBuffer(audioCtx, this.app.host.playhead);
            this.editor.stretchRegions(track);
        });

        this.zoomRenderTimeOut = setTimeout(()=> {
            this.app.tracksController.trackList.forEach(track => {
                track.updateBuffer(audioCtx, this.app.host.playhead);
                this.editor.drawRegions(track);
            });
        }, 300);
    }

}