import App from "../../App";
import EditorView from "../../Views/Editor/EditorView";
import { HEIGHT_TRACK, RATIO_MILLS_BY_PX, ZOOM_LEVEL, decrementZoomLevel, incrementZoomLevel } from "../../Env";
import { audioCtx } from "../../index";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import Track from "../../Models/Track";

/**
 * Interface of the custom event of the ScrollBarElement.
 */
export interface ScrollEvent extends Event {
    detail?: {
        value: number,
        type: string
    }
}

/**
 * Controller class that binds the events of the editor. It controls the zoom and the render of the editor.
 */
export default class EditorController {

    /**
     * Route Application.
     */
    private _app: App;
    /**
     * View of the editor.
     */
    private _view: EditorView;
    /**
     * Timeout for the zoom to be rendered. Contains the callback of the final render for the waveforms.
     */
    private _timeout: NodeJS.Timeout;
    /**
     * Pointer to the current zoom level.
     */
    private _currentLevel = 5;
    /**
     * Last zoom level executed.
     */
    private _lastExecutedZoom = 0

    /**
     * Minimum ratio of pixels by milliseconds.
     */
    private readonly MIN_RATIO = 1;
    /**
     * Maximum ratio of pixels by milliseconds.
     */
    private readonly MAX_RATIO = 500;
    /**
     * Number of zoom steps.
     */
    private readonly ZOOM_STEPS = 12;
    /**
     * Last zoom level executed.
     */
    private readonly THROTTLE_TIME = 10;

    constructor(app: App) {
        this._view = app.editorView;
        this._app = app;

        this.bindEvents();
    }

    /**
     * Zoom in the editor. If the value is not passed, it will take the current level of zoom.
     *
     * @param value the of the zoom in pixel
     */
    public zoomIn(value?: number): void {

        // for the moment, do not allow zoom in/out while playing
        if (this._app.host.playing) return;

        // if zoom button has been pressed, zoom out should be enabled
        this._app.hostView.zoomOutBtn.classList.remove("zoom-disabled");
        this._app.hostView.zoomOutBtn.classList.add("zoom-enabled");

        if (this._timeout) clearInterval(this._timeout);
        let ratio;
        if (value) { // Scroll - Linear zoom
            ratio = Math.max(RATIO_MILLS_BY_PX - (value) / 2, this.MIN_RATIO);
        } else { // Button pressed - Find nearest step and adjust to that step
            this._currentLevel = this.getNearestZoomLevel();
            let level = this._currentLevel;
            
            this._currentLevel = Math.max(this._currentLevel - 1, 0);
            //console.log("_currentLevel", this._currentLevel)

            if(this._currentLevel === 0) {
                // level is at max zoom value
                this._app.hostView.zoomInBtn.classList.remove("zoom-enabled");
                this._app.hostView.zoomInBtn.classList.add("zoom-disabled");
            }

            if (level === this._currentLevel)return;
            
            ratio = this.getZoomRatioByLevel(this._currentLevel);
            //console.log(ratio)
        }
        //updateRatioMillsByPx(ratio);
        incrementZoomLevel();
        this.updateZoom();

       //this._view.stage.scale.x *= ZOOM_LEVEL;

    }

    /**
     * Zoom out the editor. If the value is not passed, it will take the current level of zoom.
     *
     * @param value the of the zoom in pixel
     */
    public zoomOut(value?: number): void {
    

        // for the moment, do not allow zoom in/out while playing
        if (this._app.host.playing) return;

        // if zoom ouy button has been pressed, zoom in should be enabled
        this._app.hostView.zoomInBtn.classList.remove("zoom-disabled");
        this._app.hostView.zoomInBtn.classList.add("zoom-enabled");

        if (this._timeout) clearInterval(this._timeout);
        let ratio;
        if (value) { // Scroll - Linear zoom
            ratio = Math.min(RATIO_MILLS_BY_PX + (value) / 2, this.MAX_RATIO);
        } else { // Button pressed - Find nearest step and adjust to that step
            this._currentLevel = this.getNearestZoomLevel();
            let level = this._currentLevel;
            //console.log("level", level)

            this._currentLevel = Math.min(this.ZOOM_STEPS - 1, this._currentLevel + 1);
            //console.log("_currentLevel", this._currentLevel)

            if(this._currentLevel === this.ZOOM_STEPS - 1) {
                this._app.hostView.zoomOutBtn.classList.remove("zoom-enabled");
                this._app.hostView.zoomOutBtn.classList.add("zoom-disabled");
            }

            if (level === this._currentLevel) return;
            
            ratio = this.getZoomRatioByLevel(this._currentLevel);
        }
        //updateRatioMillsByPx(ratio);
        decrementZoomLevel();
        this.updateZoom();
    }


    /**
     * Defines the drag and drop functionality for the editor.
     * It adds the dropped files to the track _view.
     */
    private bindEvents(): void {
        window.addEventListener("resize", () => {
            this._view.resizeCanvas();
        });
        window.addEventListener("wheel", (e) => {
            const currentTime = Date.now();
            if (currentTime - this._lastExecutedZoom < this.THROTTLE_TIME) return;

            this._lastExecutedZoom = currentTime;

            const isMac = navigator.platform.toUpperCase().includes('MAC');
            if (isMac && e.metaKey || !isMac && e.ctrlKey) {
                const zoomIn = e.deltaY > 0;
                if (zoomIn) this._app.editorController.zoomIn(e.deltaY);
                else this._app.editorController.zoomOut(e.deltaY*-1);
            }
            else {
                this._view.handleWheel(e);
            }
        });
        this._view.horizontalScrollbar.addEventListener("change", (e: ScrollEvent) => {
            this._view.handleHorizontalScroll(e);
        });
        this._view.verticalScrollbar.addEventListener("change", (e: ScrollEvent) => {
            this._view.handleVerticalScroll(e);
        });
        this._view.canvasContainer.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
        });
        window.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
        });
        this._view.canvasContainer.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer?.items) {
                this.importDraggedFiles([...e.dataTransfer.items], e.clientX, e.clientY);
            }
        })
        window.addEventListener('drop', (e) => {
            e.preventDefault();
        })
    }

    /**
     * Given the level, returns the ratio px / ms. The steps are logarithmic. More the level is high, more the steps are
     * large.
     *
     * @param level - The current level to determines the corresponding ratio.
     * @return the ratio of pixels by milliseconds.
     */
    private getZoomRatioByLevel(level: number): number {
        const range = Math.log(this.MAX_RATIO) - Math.log(this.MIN_RATIO);
        const step = range / (this.ZOOM_STEPS - 1);
        return Math.exp(Math.log(this.MIN_RATIO) + step * level);
    }

    /**
     * Updates the zoom according to the new size and the new ratio of pixels by milliseconds.
     * It first stretches the waveforms and sets a timeout for the renderer. If a new zoom is recorded before 
     * the timeout
     * has been called, it will cancel the current timeout to set a new one.
     */
    private async updateZoom(): Promise<void> {
        let offsetPlayhead = this._view.playhead.position.x;
        //console.log("playhad pos before zoom = " + offsetPlayhead)

        this._view.resizeCanvas();
        this._view.playhead.moveToFromPlayhead(this._app.host.playhead);
         const playhead = this._app.host.playhead;
         /*
        console.log("after zoom playhead=" + playhead + 
                " pos="  + this._view.playhead.position.x + " ms=" + (playhead / audioCtx.sampleRate) * 1000);
        */
        this._view.loop.updatePositionFromTime(this._app.host.loopStart, this._app.host.loopEnd);
        this._app.automationController.updateBPFWidth();

        // let's scroll the viewport + recompute size and pos of the horizontal scrollbar
        let scrollValue = this._view.playhead.position.x - offsetPlayhead;
        this._view.horizontalScrollbar.customScrollTo(scrollValue);
        
        this._view.spanZoomLevel.innerHTML = ("x"+ZOOM_LEVEL.toFixed(2));
        
        this._app.tracksController.trackList.forEach(track => {
            // MB : this seems unecessary
            //track.updateBuffer(audioCtx, this._app.host.playhead);
            this._view.stretchRegions(track);
        });

        // MB: Center the viewport around the playhead if it is visible,
        // otherwise around the center of the viewport
        // get playhead x pos
        //const pos = this._view.playhead.position.x;
        //this._view.playhead.resize();
        //this._app.playheadController.centerViewportAround();


        this._timeout = setTimeout(() => {
            //console.log("Dans le timeout")
            //this._app.playheadController.centerViewportAround();
            this._app.tracksController.trackList.forEach(track => {
                // MB : below seems also unecessary
                track.updateBuffer(audioCtx, this._app.host.playhead);
                this._view.drawRegions(track);
            });
        }, 1000);
    }

    /**
     * @return the nearest zoom level depending on the current ratio of pixels by milliseconds.
     */
    private getNearestZoomLevel(): number {
        let nearestLevel = 0;
        let smallestDifference = Number.MAX_VALUE;

        for (let i = 0; i < this.ZOOM_STEPS; i++) {
            const ratioForLevel = this.getZoomRatioByLevel(i);
            const difference = Math.abs(RATIO_MILLS_BY_PX - ratioForLevel);

            if (difference < smallestDifference) {
                smallestDifference = difference;
                nearestLevel = i;
            }
        }
        return nearestLevel;
    }

    /**
     * Import files that has been dragged on the page.
     * 
     * @param file - Files that must be dragged
     * @param clientX - x pos of the drop
     * @param clientY - y pos of the drop
     */
    private async importDraggedFiles(files: DataTransferItem[], clientX: number, clientY: number) {  
        let offsetLeft = this._view.canvasContainer.offsetLeft // offset x of the canvas
        let offsetTop = this._view.canvasContainer.offsetTop // offset y of the canvas
    
        if ((clientX >= offsetLeft && clientX <= offsetLeft + this._view.width) &&
            (clientY >= offsetTop && clientY <= offsetTop + this._view.height)) {
            
            const start = (this._app.editorView.viewport.left + (clientX - offsetLeft)) * RATIO_MILLS_BY_PX;
            let acc = 0;
            for (let item of files) {
                if (item.kind === "file") {
                    let file = item.getAsFile() as File;
                    if (file.type === "audio/mpeg"
                        || file.type === "audio/ogg" 
                        || file.type === "audio/wav"
                        || file.type === "audio/x-wav") {

                        let waveform = this._view.getWaveformAtPos(clientY - offsetTop + acc);

                        if (!waveform) {
                            let track = await this._app.tracksController.newEmptyTrack();
                            this._app.tracksController.initializeTrack(track);
                            track.element.progressDone();
                            waveform = this._view.getWaveFormViewById(track.id);
                            if (!waveform) {
                                console.error("Can't fin a waveform with the given track id " + track.id);
                                return;
                            }
                        }
                        let track = this._app.tracksController.getTrackById(waveform.trackId) as Track;

                        let audioArrayBuffer = await file.arrayBuffer();
                        let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
                        let operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;
                        
                        this._app.regionsController.createRegion(track, operableAudioBuffer, start, waveform)
                        acc += HEIGHT_TRACK;
                    }
                    else {
                        console.warn("the file provided is not an audio file");
                    }
                }
            }
        }
        
    }
}