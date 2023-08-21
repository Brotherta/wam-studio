import {Application, Sprite, Texture} from "pixi.js";
import {Viewport} from "pixi-viewport";
import ScrollBarElement from "../../Components/ScrollBarElement";
import WaveformView from "./WaveformView";
import PlayheadView from "./PlayheadView";
import Track from "../../Models/Track";
import {HEIGHT_NEW_TRACK, HEIGHT_TRACK} from "../../Utils/Constants";
import {makeLogger} from "ts-loader/dist/logger";


export default class EditorView extends Application {

    canvasContainer = document.getElementById("editor-canvas") as HTMLDivElement;
    editorDiv = document.getElementById("editor") as HTMLDivElement;
    dragCover = document.getElementById("drag-cover") as HTMLDivElement;
    horizontalScrollbar = document.getElementById("horizontal-scrollbar") as ScrollBarElement;
    verticalScrollbar = document.getElementById("vertical-scrollbar") as ScrollBarElement;
    trackContainer = document.getElementById("track-container") as HTMLDivElement;
    automationContainer = document.getElementById("automation-container") as HTMLElement;

    width: number;
    height: number;

    worldWidth: number;
    worldHeight: number;

    originalCenter : { x: number, y: number };

    viewport: Viewport;

    waveforms: WaveformView[];
    playhead: PlayheadView;

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


        this.originalCenter = { x: this.width / 2, y: this.height / 2 };

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

        this.viewport.sortableChildren = true;
        this.stage.sortableChildren = true;

        this.stage.addChild(this.viewport);

        this.bindEvents();
        this.resizeCanvas();
    }

    bindEvents() {
        window.addEventListener("resize", () => {
            this.resizeCanvas();
        });

        window.addEventListener("wheel", (e) => {
            let target = e.target as HTMLElement;
            if (target !== this.view as HTMLCanvasElement && target !== this.canvasContainer && target !== this.editorDiv && target !== this.horizontalScrollbar && target !== this.verticalScrollbar) return;
            if (e.shiftKey) {
                this.horizontalScrollbar.customScrollTo(e.deltaX);
            }
            else {
                this.verticalScrollbar.customScrollTo(e.deltaY);
            }
        });

        this.horizontalScrollbar.addEventListener("change", (e) => {
            let ratio = this.worldWidth / this.width;
            // @ts-ignore
            let scrollValue = e.detail.value * ratio;
            if (isNaN(scrollValue)) return;
            if (scrollValue === 0) {
                this.viewport.position.set(0, this.viewport.position.y);
            }
            else {
                let x = this.originalCenter.x + scrollValue;
                let y = this.viewport.center.y;
                x = Math.max(0, Math.min(this.worldWidth - (this.width / 2), x));
                this.viewport.moveCenter(x, y);
            }
            this.automationContainer.scrollLeft = scrollValue;
        });

        this.verticalScrollbar.addEventListener("change", (e) => {
            let ratio = this.worldHeight / this.height;
            // @ts-ignore
            let scrollValue = e.detail.value * ratio
            if (isNaN(scrollValue)) return;
            if (scrollValue === 0) {
                this.viewport.position.set(this.viewport.position.x, 0);
                this.playhead.position.y = 0;
                this.playhead.track.position.y = 0;
            }
            else {
                let x = this.viewport.center.x;
                let y = this.originalCenter.y + scrollValue;
                y = Math.max(0, Math.min(this.worldHeight - (this.height / 2), y));
                this.viewport.moveCenter(x, y);
                this.playhead.position.y = scrollValue;
                this.playhead.track.position.y = scrollValue;
            }
            this.trackContainer.scrollTop = scrollValue;
            this.automationContainer.scrollTop = scrollValue;
        });
    }


    /**
     * Add a waveform into the canvas fot the given track and update the position of the other waveforms.
     * @param track
     */
    createWaveformView(track: Track) {
        let wave = new WaveformView(this, track);
        this.waveforms.push(wave);
        this.resizeCanvas();
        return wave;
    }

    /**
     * Remove the waveform from the canvas for the given track and update the position of the other waveforms.
     * @param track
     */
    removeWaveForm(track: Track) {
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
     * Resize the canvas when the window is resized.
     */
    resizeCanvas() {

        //
        // this.verticalScrollbar.resize(this.height, this.worldHeight);
        // this.viewport.resize(this.width, this.height, this.worldWidth, this.worldHeight);
        let scrollbarThickness = this.horizontalScrollbar.SCROLL_THICKNESS;
        this.width += (this.editorDiv.clientWidth - this.width) - scrollbarThickness;
        this.height += (this.editorDiv.clientHeight - this.height) - scrollbarThickness;

        let tracksHeight = this.waveforms.length * HEIGHT_TRACK + HEIGHT_NEW_TRACK +4;
        this.worldHeight = Math.max(tracksHeight, this.height);

        this.originalCenter = { x: this.width / 2, y: this.height / 2 };

        this.viewport.resize(this.width, this.height, this.worldWidth, this.worldHeight);
        this.renderer.resize(this.width, this.height);
        this.horizontalScrollbar.resize(this.width, this.worldWidth);
        this.verticalScrollbar.resize(this.height, this.worldHeight);
        this.playhead.resize(Math.max(this.worldWidth, this.width), Math.max(this.worldHeight, this.height));

        this.canvasContainer.style.width = `${this.width}px`;
        this.canvasContainer.style.height = `${this.height}px`;

        this.automationContainer.style.height = `${this.height}px`;
        this.automationContainer.style.width = `${this.width}px`;
    }


    /**
     * Change the color of the waveform for the given track.
     * @param track
     */
    changeWaveFormColor(track: Track) {
        let waveFormView = this.waveforms.find(wave => wave.trackId === track.id);
        if (waveFormView !== undefined) {
            waveFormView.color = track.color;
            waveFormView.regionViews.forEach(regionView => {
                let region = track.getRegion(regionView.id);
                if (region !== undefined) {
                    regionView.drawWave(track.color, region);
                }
            });
        }
    }


    getWaveFormViewById(trackId: number) {
        return this.waveforms.find(wave => wave.trackId === trackId);
    }

    getWaveformView(y: number) {
        return this.waveforms.find(wave => y >= wave.position.y && y <= wave.position.y + HEIGHT_TRACK);
    }
}