import App from "../../App";
import EditorView from "../../Views/Editor/EditorView";
import {RATIO_MILLS_BY_PX, updateRatioMillsByPx} from "../../Env";
import {audioCtx} from "../../index";

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
     * Number of zoom step.
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
        if (this._timeout) clearInterval(this._timeout);
        let ratio;
        if (value) { // Scroll - Linear zoom
            ratio = Math.max(RATIO_MILLS_BY_PX - (value) / 2, this.MIN_RATIO);
        } else { // Button pressed - Find nearest step and adjust to that step
            this._currentLevel = this.getNearestZoomLevel();
            let level = this._currentLevel;
            this._currentLevel = Math.max(this._currentLevel - 1, 0);
            if (level === this._currentLevel) return;
            ratio = this.getZoomRatioByLevel(this._currentLevel);
        }
        updateRatioMillsByPx(ratio);
        this.updateZoom();
    }

    /**
     * Zoom out the editor. If the value is not passed, it will take the current level of zoom.
     *
     * @param value the of the zoom in pixel
     */
    public zoomOut(value?: number): void {
        if (this._timeout) clearInterval(this._timeout);
        let ratio;
        if (value) { // Scroll - Linear zoom
            ratio = Math.min(RATIO_MILLS_BY_PX + (value) / 2, this.MAX_RATIO);
        } else { // Button pressed - Find nearest step and adjust to that step
            this._currentLevel = this.getNearestZoomLevel();
            let level = this._currentLevel;
            this._currentLevel = Math.min(this.ZOOM_STEPS - 1, this._currentLevel + 1);
            if (level === this._currentLevel) return;
            ratio = this.getZoomRatioByLevel(this._currentLevel);
        }
        updateRatioMillsByPx(ratio);
        this.updateZoom();
    }


    /**
     * Defines the drag and drop functionality for the editor.
     * It adds the dropped files to the track _view.
     */
    private bindEvents(): void {
        ["dragenter", "dragstart"].forEach(eventName => {
            this._view.canvasContainer.addEventListener(eventName, () => {
                this._view.dragCover.hidden = false;
            });
        });

        window.addEventListener("resize", () => {
            this._view.resizeCanvas();
        });

        this._view.dragCover.addEventListener("dragleave", () => {
            this._view.dragCover.hidden = true;
        });
        window.ondragend = () => {
            this._view.dragCover.hidden = true;
        }
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
     * It first stretches the waveforms and set a timeout for the renderer. If a new zoom is recored before the timeout
     * has been called, it will cancel the current timeout to set a new one.
     */
    private async updateZoom(): Promise<void> {
        let offsetPlayhead = this._view.playhead.position.x;
        this._view.resizeCanvas();
        this._view.playhead.moveToFromPlayhead(this._app.host.playhead);
        this._view.loop.updatePositionFromTime(this._app.host.loopStart, this._app.host.loopEnd);
        this._app.automationController.updateBPFWidth();
        this._view.horizontalScrollbar.customScrollTo(this._view.playhead.position.x - offsetPlayhead);
        this._app.tracksController.trackList.forEach(track => {
            track.updateBuffer(audioCtx, this._app.host.playhead);
            this._view.stretchRegions(track);
        });

        this._timeout = setTimeout(() => {
            this._app.tracksController.trackList.forEach(track => {
                track.updateBuffer(audioCtx, this._app.host.playhead);
                this._view.drawRegions(track);
            });
        }, 500);
    }

    /**
     * @return the nearest zoom level depending on the current ration of pixels by milliseconds.
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
}