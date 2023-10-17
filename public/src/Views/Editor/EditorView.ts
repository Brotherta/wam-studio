import {Application, Sprite, Texture} from "pixi.js";
import {Viewport} from "pixi-viewport";
import ScrollBarElement from "../../Components/ScrollBarElement";
import WaveformView from "./WaveformView";
import PlayheadView from "./PlayheadView";
import Track from "../../Models/Track";
import {
    HEIGHT_NEW_TRACK,
    HEIGHT_TRACK,
    MAX_DURATION_SEC,
    RATIO_MILLS_BY_PX,
} from "../../Env";
import {ScrollEvent} from "../../Controllers/Editor/EditorController";
import LoopView from "./LoopView";
import GridView from "./GridView";

/**
 * Class that Override PIXI.Application. Represents the main editor and handle all events about the editor.
 * Use to store the waveforms and the playhead.
 */
export default class EditorView extends Application {

    /**
     * Accessors from the index.html
     */
    public canvasContainer = document.getElementById("editor-canvas") as HTMLDivElement;
    public editorDiv = document.getElementById("editor") as HTMLDivElement;
    public horizontalScrollbar = document.getElementById("horizontal-scrollbar") as ScrollBarElement;
    public verticalScrollbar = document.getElementById("vertical-scrollbar") as ScrollBarElement;
    public trackContainer = document.getElementById("track-container") as HTMLDivElement;
    public automationContainer = document.getElementById("automation-container") as HTMLElement;
    public spanZoomLevel = document.getElementById("spanZoomLevel") as HTMLSpanElement;
    /**
     * The width of the editor in pixels. It's the size of the viewport minus the scrollbars.
     */
    public width: number;
    /**
     * The height of the editor in pixels. It's the size of the viewport minus the scrollbars.
     */
    public height: number;

    /**
     * The width of the content of the viewport in pixels. This size is computed with the current ration of pixels by
     * milliseconds.
     */
    public worldWidth: number;
    /**
     * The height of the content of the viewport in pixels. This size is computed with the number of tracks multiplied
     * by the number of the tracks.
     */
    public worldHeight: number;

    /**
     * The viewport of the editor, that handle the canvas to be drawn at the correct given position.
     */
    public viewport: Viewport;
    /**
     * Array of PIXI Containers that contains the waveforms of each tracks.
     */
    public waveforms: WaveformView[];
    /**
     * The PIXI Container that handle the playhead behavior.
     */
    public playhead: PlayheadView;
    /**
     * The PIXI Container that handle the loop behavior.
     */
    public loop: LoopView;
    /**
     * The PIXI Container that handle the grid of bars.
     */
    public grid: GridView;

    public static readonly PLAYHEAD_HEIGHT = 17;
    public static readonly PLAYHEAD_WIDTH = 10;
    public static readonly LOOP_HEIGHT = 7;


    /**
     * The center of the viewport. Used to store where the center of the current viewport size is.
     * @private
     */
    private _originalCenter : { x: number, y: number };

    constructor() {
        super({
            width: 0,
            height: 0,
        });
        this.canvasContainer.appendChild(this.view as HTMLCanvasElement);

        this.width = this.canvasContainer.clientWidth;
        this.height = this.canvasContainer.clientHeight;

        this.renderer.resize(this.width, this.height);

        this.worldWidth = this.width;
        this.worldHeight = this.height;

        this._originalCenter = { x: this.width / 2, y: this.height / 2 };

        this.viewport = new Viewport({
            screenWidth: this.width,
            screenHeight: this.height,
            worldWidth: this.worldWidth,
            worldHeight: this.worldHeight,
            events: this.renderer.events
        });

        this.horizontalScrollbar.resize(this.width, this.worldWidth);
        this.verticalScrollbar.resize(this.height, this.worldHeight);

        this.waveforms = [];
        this.playhead = new PlayheadView(this);
        this.loop = new LoopView(this);
        this.grid = new GridView(this);

        this.viewport.sortableChildren = true;
        this.stage.sortableChildren = true;

        this.stage.addChild(this.viewport);

        this.resizeCanvas();
    }

    /**
     * Handler for the wheel event on the editor. It will scroll vertically or horizontally depending on the
     * shiftKey.
     *
     * @param e Event that contains information of the wheel event.
     */
    public handleWheel(e: WheelEvent): void {
        let target = e.target as HTMLElement;
        if (target !== this.view as HTMLCanvasElement && target !== this.canvasContainer && target !== this.editorDiv && target !== this.horizontalScrollbar && target !== this.verticalScrollbar) return;
        if (e.shiftKey) {
            this.horizontalScrollbar.customScrollTo(e.deltaX*2);
        }
        else {
            this.verticalScrollbar.customScrollTo(e.deltaY);
        }
    }

    /**
     * Handler for the horizontal scroll. It will scroll the automations
     * the editor and the playhead to the left or right.
     *
     * @param e Event that contains the value of the change of the scrollbar.
     */
    public handleHorizontalScroll(e: ScrollEvent): void {
        let ratio = this.worldWidth / this.width;
        if (!e.detail) throw new Error("The event on the scrollbar is not properly set. Missing the detail property.");
        let scrollValue = e.detail.value * ratio;
        if (isNaN(scrollValue)) return;
        if (scrollValue === 0) {
            this.viewport.position.set(0, this.viewport.position.y);
        }
        else {
            let x = this._originalCenter.x + scrollValue;
            let y = this.viewport.center.y;
            x = Math.max(0, Math.min(this.worldWidth - (this.width / 2), x));
            this.viewport.moveCenter(x, y);
        }
        this.automationContainer.scrollLeft = scrollValue;
    }

    /**
     * Handler for the vertical scroll. It will scroll the automations
     * the editor and the playhead to the top or bottom.
     *
     * @param e Event that contains the value of the change of the scrollbar.
     */
    public handleVerticalScroll(e: ScrollEvent): void {
        let ratio = this.worldHeight / this.height;
        if (!e.detail) throw new Error("The event on the scrollbar is not properly set. Missing the detail property.");
        let scrollValue = e.detail.value * ratio
        if (isNaN(scrollValue)) return;
        if (scrollValue === 0) {
            this.viewport.position.set(this.viewport.position.x, 0);
            this.playhead.position.y = 0;
            this.playhead.track.position.y = 0;
            this.loop.position.y = 0;
            this.loop.track.position.y = 0;
        }
        else {
            let x = this.viewport.center.x;
            let y = this._originalCenter.y + scrollValue;
            y = Math.max(0, Math.min(this.worldHeight - (this.height / 2), y));
            this.viewport.moveCenter(x, y);
            this.playhead.position.y = scrollValue;
            this.playhead.track.position.y = scrollValue;
            this.loop.position.y = scrollValue;
            this.loop.track.position.y = scrollValue;
        }
        if (e.detail.type !== "propagate off") {
            this.trackContainer.scrollTop = scrollValue;
            this.automationContainer.scrollTop = scrollValue;
        }
    }

    /**
     * Add a waveform into the canvas fot the given track and update the position of the other waveforms.
     * @param track - The track where the new waveform will be created.
     */
    public createWaveformView(track: Track): WaveformView {
        let wave = new WaveformView(this, track);
        this.waveforms.push(wave);
        this.resizeCanvas();
        this.grid.resize();

        return wave;
    }

    /**
     * Remove the waveform from the canvas for the given track and update the position of the other waveforms.
     * @param track - The track that contain the waveform to delete.
     */
    public removeWaveForm(track: Track): void {
        let wave = this.waveforms.find(wave => wave.trackId === track.id);
        let index = this.waveforms.indexOf(wave!);

        wave!.destroy();
        this.waveforms.splice(index, 1);
        for (let i = index; i < this.waveforms.length; i++) {
            this.waveforms[i].position.y -= HEIGHT_TRACK;
        }
        this.resizeCanvas();
    }

    /**
     * Resize the canvas when the window is resized. It will resize the playhead, the viewport, the PIXI.Renderer,
     * the canvas and the automation div.
     */
    public resizeCanvas(): void {
        requestAnimationFrame(() => {
            this.stage.scale.x = 1;
            let scrollbarThickness = this.horizontalScrollbar.SCROLL_THICKNESS;
            this.width += (this.editorDiv.clientWidth - this.width) - scrollbarThickness;
            this.height += (this.editorDiv.clientHeight - this.height) - scrollbarThickness;

            let tracksHeight = this.waveforms.length * HEIGHT_TRACK + HEIGHT_NEW_TRACK +4;
            this.worldHeight = Math.max(tracksHeight, this.height);
            this.worldWidth = Math.max((MAX_DURATION_SEC*1000) / RATIO_MILLS_BY_PX, this.width);

            this._originalCenter = { x: this.width / 2, y: this.height / 2 };

            this.viewport.resize(this.width, this.height, this.worldWidth, this.worldHeight);
            this.renderer.resize(this.width, this.height);
            this.horizontalScrollbar.resize(this.width, this.worldWidth);
            this.verticalScrollbar.resize(this.height, this.worldHeight);

            this.canvasContainer.style.width = `${this.width}px`;
            this.canvasContainer.style.height = `${this.height}px`;

            this.automationContainer.style.height = `${this.height - EditorView.LOOP_HEIGHT - EditorView.PLAYHEAD_HEIGHT}px`;
            this.automationContainer.style.width = `${this.width}px`;

            this.playhead.resize();
            this.loop.resize();
            this.grid.resize();
        })
    }

    /**
     * Change the color of the waveform for the given track.
     * @param track - The track where the Waveform must be redrawn.
     */
    public changeWaveFormColor(track: Track): void {
        let waveFormView = this.waveforms.find(wave => wave.trackId === track.id);
        if (waveFormView !== undefined) {
            waveFormView.color = track.color;
            waveFormView.regionViews.forEach(regionView => {
                let region = track.getRegionById(regionView.id);
                if (region !== undefined) {
                    regionView.drawWave(track.color, region);
                }
            });
        }
    }

    /**
     * Draw the waveform of all the regions of a track. Mind that this method has a high impact on performances.
     *
     * @param track - The track that contains the regions.
     */
    public drawRegions(track: Track): void {
        requestAnimationFrame(() => {
            let waveFormView = this.waveforms.find(wave => wave.trackId === track.id);
            if (!waveFormView) return
            for (let regionView of waveFormView.regionViews) {
                let region = track.getRegionById(regionView.id);
                if (region) {
                    regionView.initializeRegionView(track.color, region);
                }
            }
        });
    }

    /**
     * Take the waveform of the given track, and stretch the waveform to the current Ratio of pixels by 
     * milliseconds.
     * @param track - The track that contains the regions.
     */
    public stretchRegions(track: Track): void {
        requestAnimationFrame(()=> {
            let waveFormView = this.waveforms.find(wave => wave.trackId === track.id);
            if (!waveFormView) return
            for (let regionView of waveFormView.regionViews) {
                // MB : prevented first click on ZoomIn to do something
                //if (!track.audioBuffer) return;
                let region = track.getRegionById(regionView.id);
                if (region) {
                    regionView.stretch(region.duration, region.start);
                    //console.log("STRECHED REGION !")
                }
            }
        });
    }

    /**
     * Get the waveform by the given track ID.
     * @param trackId - The track ID of the waveform.
     */
    public getWaveFormViewById(trackId: number): WaveformView | undefined {
        return this.waveforms.find(wave => wave.trackId === trackId);
    }

    public createBarGrid() {
        let grid = new GridView(this);
    }
}