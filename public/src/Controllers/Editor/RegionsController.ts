import App from "../../App";
import EditorView from "../../Views/Editor/EditorView";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import Region from "../../Models/Region";
import {RATIO_MILLS_BY_PX} from "../../Env";
import {FederatedPointerEvent} from "pixi.js";
import WaveformView from "../../Views/Editor/WaveformView";
import RegionView from "../../Views/Editor/RegionView";
import {audioCtx} from "../../index";
import Track from "../../Models/Track";

/**
 * Class that control the regions of the editor.
 */
export default class RegionsController {

    /**
     * Number of region that is incremented for each time a region is created.
     */
    public regionIdCounter: number;

    /**
     * Route Application.
     */
    private _app: App;
    /**
     * Editor's Application of PIXI.JS.
     */
    private _editorView: EditorView;

    /**
     * Store if the movinf is currently moving or not.
     */
    private _isMovingRegion: boolean;
    /**
     * The current selected region view.
     */
    private _selectedRegionView: RegionView | undefined;
    /**
     * the current selected region.
     */
    private _selectedRegion: Region | undefined;

    /**
     * The offset on X axis when a region is moved.
     * Represents the position on the region view itself, where the user clicked.
     */
    private _offsetX: number;

    constructor(app: App) {
        this._app = app;
        this._editorView = app.editorView;
        this.regionIdCounter = 0;
        this._isMovingRegion = false;

        this.bindEvents();
    }

    /**
     * Creates a region and the corresponding view in the track with the given buffer.
     * It will also bind the events to the new region view and updates the buffer of the track.
     *
     * @param track - The track where to create the new region.
     * @param buffer - The buffer that the new region will contain.
     * @param start - The time in milliseconds where the region should start.
     * @param waveformView - Optional - The waveform where the region should be added. If not given, the waveform
     * will be search using the ID of the track.
     */
    public createRegion(track: Track, buffer: OperableAudioBuffer, start: number, waveformView?: WaveformView) {
        if (!waveformView) waveformView = this._editorView.getWaveFormViewById(track.id);
        let region = new Region(track.id, buffer, start, this.getNewId())
        let regionView = waveformView!.createRegionView(region);

        this._app.regionsController.bindRegionEvents(region, regionView);

        track.modified = true;
        track.addRegion(region);
    }

    /**
     * Creates a temporary region. The region is only visual, and has no event bound.
     * It will create a placeholder buffer.
     *
     * @param track - The track where to create the new region.
     * @param start - The time in milliseconds where the region should start.
     */
    public createTemporaryRegion(track: Track, start: number) {
        let buffer = new OperableAudioBuffer({
            length: 128,
            sampleRate: audioCtx.sampleRate,
            numberOfChannels: 2
        })

        let waveformView = this._editorView.getWaveFormViewById(track.id);
        let region = new Region(track.id, buffer, start, this.getNewId());
        waveformView!.createRegionView(region);

        return region;
    }

    /**
     * Updates a temporary region with the new buffer.
     *
     * @param region - The temporary region tu update.
     * @param track - The track where the region is.
     * @param buffer - The new buffer for the region.
     */
    public updateTemporaryRegion(region: Region, track: Track, buffer: OperableAudioBuffer) {
        const waveformView = this._editorView.getWaveFormViewById(track.id);
        if (waveformView === undefined) throw new Error("Waveform not found");

        const regionView = waveformView.getRegionViewById(region.id);
        if (regionView === undefined) throw new Error("RegionView not found");

        region.buffer = region.buffer.concat(buffer);
        region.duration = region.buffer.duration;

        waveformView.removeRegionView(regionView);
        return waveformView!.createRegionView(region);
    }

    /**
     * Updates the last piece of buffer in the region buffer and create the associated region view.
     * Then it binds the region view events and add the new region.
     *
     * @param region - The temporary region tu update.
     * @param track - The track where the region is.
     * @param buffer - The new buffer for the region.
     */
    public renderTemporaryRegion(region: Region, track: Track, buffer: OperableAudioBuffer) {
        const latency = this._app.host.latency;
        if (region.start - latency < 0) {
            let diff = region.start - latency;
            if (diff >= 0) {
                region.start = 0;
            }
            else {
                diff = -diff;
                region.buffer = region.buffer.split(diff * audioCtx.sampleRate / 1000)[1]!;
                region.duration -= diff / 1000;
            }
        }
        else {
            region.start -= latency;
        }
        const newRegionView = this.updateTemporaryRegion(region, track, buffer);
        this._app.regionsController.bindRegionEvents(region, newRegionView);
        track.addRegion(region);
    }

    /**
     * Get the maximum duration of all the regions in the editor.
     *
     * @returns The maximum duration of all the regions in the editor.
     */
    public getMaxDurationRegions(): number {
        let maxTime = 0;
        for (let track of this._app.tracksController.trackList) {
            for (let region of track.regions) {
                let end = region.start*1000 + region.duration;
                if (end > maxTime) {
                    maxTime = end;
                }
            }
        }
        return maxTime;
    }

    /**
     * Binds the event of a regionView. Used when a new regionView is created.
     *
     * @param region - The data object of the region.
     * @param regionView - The view representing the region.
     * @private
     */
    private bindRegionEvents(region: Region, regionView: RegionView): void {
        regionView.on("pointerdown", (_e) => {
            this.handlePointerDown(regionView);
            this._offsetX = _e.data.global.x - regionView.position.x;
            this._isMovingRegion = true;
        });
        regionView.on("pointerup", () => {
            this.handlePointerUp();
        });
        regionView.on("pointerupoutside", () => {
            this.handlePointerUp();
        });
    }

    /**
     * Binds on initialisation the events related to the playhead : pointerdown, pointerup, pointermove and so on...
     * @private
     */
    private bindEvents(): void {
        // On escape key pressed, deselect the selected waveform.
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.deselectRegion();
            }
        });
        // On delete key pressed, delete the selected region.
        document.addEventListener("keydown", (e) => {
            if ((e.key === "Delete" || e.key === "Backspace") && this._selectedRegionView !== undefined) {
                this.deleteSelectedRegion();
            }
        });
        // On the pointer move around the PIXI Canvas.
        this._editorView.viewport.on("pointermove", (e) => {
            if (this._isMovingRegion) {
                this.handlePointerMove(e);
            }
        });
    }

    /**
     * Get a new region ID and increment the region ID counter.
     * @private
     * @return a new ID.
     */
    private getNewId(): number {
        return this.regionIdCounter++;
    }

    /**
     * Selects the region when the user click on the view.
     *
     * @param regionView - The clicked region view
     * @private
     */
    private handlePointerDown(regionView: RegionView): void {
        if (this._selectedRegionView !== regionView) {
            this.deselectRegion();
            this._selectedRegionView = regionView;
            this._selectedRegionView.select();
            this._selectedRegion = this._app.tracksController.getTrack(regionView.trackId)?.getRegion(regionView.id);
        }
    }

    /**
     * Deselects the current selected region view.
     *
     * @private
     */
    private deselectRegion(): void {
        if (this._selectedRegionView !== undefined) {
            this._selectedRegionView.deselect();
            this._selectedRegionView = undefined;
            this._selectedRegion = undefined;
        }
    }

    /**
     * Deletes the current selected region and the corresponding view.
     *
     * @private
     */
    private deleteSelectedRegion(): void {
        if (!this._selectedRegionView || !this._selectedRegion || this._isMovingRegion) return;

        let waveform = this._selectedRegionView.parent as WaveformView;
        let track = this._app.tracksController.getTrack(this._selectedRegion.trackId);
        if (track === undefined) throw new Error("Track not found");

        track.removeRegion(this._selectedRegion.id);
        waveform.removeRegionView(this._selectedRegionView);

        this._selectedRegionView = undefined;
        this._selectedRegion = undefined;

        track.modified = true;
        track.updateBuffer(audioCtx, this._app.host.playhead);
    }

    /**
     * Move the region in the current waveform. If the users move out of the current waveform, it will also
     * change the region to the new waveform.
     *
     * @param e - Pixi event that handle the events details.
     * @private
     */
    private handlePointerMove(e: FederatedPointerEvent): void {
        if (!this._selectedRegionView || !this._selectedRegion || !this._offsetX) return;

        let x = e.data.global.x;
        let y = e.data.global.y + this._editorView.viewport.top;

        let newX = x - this._offsetX;
        newX = Math.max(0, Math.min(newX, this._editorView.worldWidth));

        let parentWaveform = this._selectedRegionView.parent as WaveformView;
        let parentTop = parentWaveform.y;
        let parentBottom = parentTop + parentWaveform.height;

        if (y > parentBottom && !this._app.waveformController.isLast(parentWaveform)) { // if the waveform is dragged to the bottom of the screen
            let nextWaveform = this._app.waveformController.getNextWaveform(parentWaveform);
            if (nextWaveform) {
                this.updateRegionWaveform(parentWaveform, nextWaveform);
            }
        }
        else if (y < parentTop && !this._app.waveformController.isFirst(parentWaveform)) { // if the waveform is dragged to the top of the screen
            let previousWaveform = this._app.waveformController.getPreviousWaveform(parentWaveform);
            if (previousWaveform) {
                this.updateRegionWaveform(parentWaveform, previousWaveform);
            }
        }
        this._selectedRegionView.position.x = newX;
        this._selectedRegion.start = newX * RATIO_MILLS_BY_PX;
    }

    /**
     * If the region was moving, it stops the move and update the track buffer. If the region is in a new tracks,
     * it will modify the old track and the new one.
     * @private
     */
    private handlePointerUp(): void {
        this._isMovingRegion = false;
        if (!this._selectedRegionView && !this._selectedRegion) return;

        if (this._selectedRegionView!.trackId !== this._selectedRegion!.trackId) {
            let oldTrack = this._app.tracksController.getTrack(this._selectedRegion!.trackId);
            let newTrack = this._app.tracksController.getTrack(this._selectedRegionView!.trackId);
            if (oldTrack == undefined || newTrack == undefined) {
                throw new Error("Track not found");
            }
            oldTrack.removeRegion(this._selectedRegion!.id);
            newTrack.addRegion(this._selectedRegion!);

            oldTrack.modified = true;
            newTrack.modified = true;
            oldTrack.updateBuffer(audioCtx, this._app.host.playhead);
            newTrack.updateBuffer(audioCtx, this._app.host.playhead);

            this._selectedRegion!.trackId = this._selectedRegionView!.trackId;
        }
        else {
            let track = this._app.tracksController.getTrack(this._selectedRegion!.trackId);
            if (track == undefined) throw new Error("Track not found");
            track.modified = true;
            track.updateBuffer(audioCtx, this._app.host.playhead);
        }
    }

    /**
     * Updates the current selected region that is moving to a new waveform view.
     * It updates the old and the new waveform.
     *
     * @param oldWaveForm - The waveform whom the selected region view will be removed.
     * @param newWaveForm - the new waveform of the selected region view
     * @private
     */
    private updateRegionWaveform(oldWaveForm: WaveformView, newWaveForm: WaveformView): void {
        newWaveForm.addRegionView(this._selectedRegionView!);
        oldWaveForm.removeRegionView(this._selectedRegionView!);
        this._selectedRegionView!.trackId = newWaveForm.trackId;
        this._selectedRegionView!.drawWave(newWaveForm.color, this._selectedRegion!);
    }
}