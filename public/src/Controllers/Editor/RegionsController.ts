import App from "../../App";
import EditorView from "../../Views/Editor/EditorView";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import Region from "../../Models/Region";
import {RATIO_MILLS_BY_PX} from "../../Utils/Variables";
import {FederatedPointerEvent} from "pixi.js";
import WaveformView from "../../Views/Editor/WaveformView";
import RegionView from "../../Views/Editor/RegionView";
import {audioCtx} from "../../index";


export default class RegionsController {

    app: App;
    editor: EditorView;

    regionIdCounter: number;

    isMovingRegion: boolean;
    selectedRegionView: RegionView | undefined;
    selectedRegion: Region | undefined;

    offsetX: number;
    offsetY: number;

    constructor(app: App) {
        this.app = app;
        this.editor = this.app.editorView;

        this.regionIdCounter = 0;
        this.isMovingRegion = false;

        this.bindEvents();
    }

    bindEvents() {
        // On escape key pressed, deselect the selected waveform
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.deselectRegion();
            }
        });
        // On delete key pressed, delete the selected region
        document.addEventListener("keydown", (e) => {
            if ((e.key === "Delete" || e.key === "Backspace") && this.selectedRegionView !== undefined) {
                this.deleteSelectedRegion();
            }
        });

        this.editor.viewport.on("pointermove", (e) => {
            if (this.isMovingRegion) {
                this.moveRegion(e);
            }
        });
    }

    createRegion(trackId: number, buffer: OperableAudioBuffer, start: number) {
        return new Region(trackId, buffer, start, this.getNewId());
    }

    defineRegionListeners(region: Region, regionView: RegionView, waveFormView: WaveformView) {
        regionView.on("pointerdown", (_e) => {
            this.selectRegion(regionView);
            this.offsetY = _e.data.global.y - regionView.position.y;
            this.offsetX = _e.data.global.x - regionView.position.x;
            this.isMovingRegion = true;
        });
        regionView.on("pointerup", () => {
            this.stopMovingRegion();
        });
        regionView.on("pointerupoutside", () => {
            this.stopMovingRegion();
        });
    }

    getNewId() {
        return this.regionIdCounter++;
    }

    selectRegion(region: RegionView) {
        if (this.selectedRegionView !== region) {
            this.deselectRegion();
            this.selectedRegionView = region;
            this.selectedRegionView.select();
            this.selectedRegion = this.app.tracksController.getTrack(region.trackId)?.getRegion(region.id);
        }
    }

    deselectRegion() {
        if (this.selectedRegionView !== undefined) {
            this.selectedRegionView.deselect();
            this.selectedRegionView = undefined;
            this.selectedRegion = undefined;
        }
    }

    deleteSelectedRegion() {
        if (!this.selectedRegionView || !this.selectedRegion || this.isMovingRegion) return;

        let waveform = this.selectedRegionView.parent as WaveformView;
        let track = this.app.tracksController.getTrack(this.selectedRegion.trackId);
        if (track === undefined) throw new Error("Track not found");

        track.removeRegion(this.selectedRegion.id);
        waveform.removeRegionView(this.selectedRegionView);

        this.selectedRegionView = undefined;
        this.selectedRegion = undefined;

        track.modified = true;
        track.updateBuffer(audioCtx, this.app.host.playhead);
    }


    moveRegion(e: FederatedPointerEvent) {
        if (!this.selectedRegionView || !this.selectedRegion || !this.offsetX || !this.offsetY) return;

        let x = e.data.global.x;
        let y = e.data.global.y + this.editor.viewport.top;

        let newX = x - this.offsetX;
        newX = Math.max(0, Math.min(newX, this.editor.worldWidth));

        let parentWaveform = this.selectedRegionView.parent as WaveformView;
        let parentTop = parentWaveform.y;
        let parentBottom = parentTop + parentWaveform.height;

        if (y > parentBottom && !this.app.waveformController.isLast(parentWaveform)) { // if the waveform is dragged to the bottom of the screen
            let nextWaveform = this.app.waveformController.getNextWaveform(parentWaveform);
            if (nextWaveform) {
                this.updateRegionWaveform(parentWaveform, nextWaveform);
            }
        }
        else if (y < parentTop && !this.app.waveformController.isFirst(parentWaveform)) { // if the waveform is dragged to the top of the screen
            let previousWaveform = this.app.waveformController.getPreviousWaveform(parentWaveform);
            if (previousWaveform) {
                this.updateRegionWaveform(parentWaveform, previousWaveform);
            }
        }
        this.selectedRegionView.position.x = newX;
        this.selectedRegion.start = newX * RATIO_MILLS_BY_PX;
    }

    stopMovingRegion() {
        this.isMovingRegion = false;
        if (!this.selectedRegionView && !this.selectedRegion) return;

        if (this.selectedRegionView!.trackId !== this.selectedRegion!.trackId) {
            let oldTrack = this.app.tracksController.getTrack(this.selectedRegion!.trackId);
            let newTrack = this.app.tracksController.getTrack(this.selectedRegionView!.trackId);
            if (oldTrack == undefined || newTrack == undefined) {
                throw new Error("Track not found");
            }
            oldTrack.removeRegion(this.selectedRegion!.id);
            newTrack.addRegion(this.selectedRegion!);

            oldTrack.modified = true;
            newTrack.modified = true;
            oldTrack.updateBuffer(audioCtx, this.app.host.playhead);
            newTrack.updateBuffer(audioCtx, this.app.host.playhead);

            this.selectedRegion!.trackId = this.selectedRegionView!.trackId;
        }
        else {
            let track = this.app.tracksController.getTrack(this.selectedRegion!.trackId);
            if (track == undefined) throw new Error("Track not found");
            track.modified = true;
            track.updateBuffer(audioCtx, this.app.host.playhead);
        }
    }

    updateRegionWaveform(oldWaveForm: WaveformView, newWaveForm: WaveformView) {
        newWaveForm.addChild(this.selectedRegionView!);
        oldWaveForm.removeChild(this.selectedRegionView!);
        this.selectedRegionView!.drawWave(newWaveForm.color, this.selectedRegion!);
        this.selectedRegionView!.trackId = newWaveForm.trackId;
    }
}