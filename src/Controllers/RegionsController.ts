import App from "../App";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import Region from "../Models/Region";
import RegionView from "../Views/RegionView";
import WaveformView from "../Views/WaveformView";
import {RATIO_MILLS_BY_PX} from "../Utils";


export default class RegionsController {

    app: App;
    regionIdCounter: number;

    isMovingRegion: boolean = false;
    selectedRegion: RegionView | undefined;

    constructor(app: App) {
        this.app = app;
        this.regionIdCounter = 0;

        this.definesListeners();
    }

    createRegion(trackId: number, buffer: OperableAudioBuffer, start: number) {
        return new Region(trackId, buffer, start, this.getNewId());
    }

    getNewId() {
        return this.regionIdCounter++;
    }

    definesListeners() {
        // On escape key pressed, deselect the selected waveform
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.deselectRegion();
            }
        });
    }

    selectRegion(region: RegionView) {
        if (this.selectedRegion !== region) {
            this.deselectRegion();
            this.selectedRegion = region;
            this.selectedRegion.select();
        }
    }

    deselectRegion() {
        if (this.selectedRegion !== undefined) {
            this.selectedRegion.deselect();

            this.selectedRegion = undefined;
        }
    }

    defineRegionListeners(region: Region, regionView: RegionView, waveFormView: WaveformView) {
        regionView.on("pointerdown", (_e) => {
            this.selectRegion(regionView);
            waveFormView.startMovingRegion(regionView, _e.data.global.x, _e.data.global.y);
            this.isMovingRegion = true;
        });
        regionView.on("pointermove", (_e) => {
            if (this.isMovingRegion) {
                waveFormView.moveRegion(_e.data.global.x, _e.data.global.y);
            }
        });
        regionView.on("pointerup", (_e) => {
            this.stopMovingRegion(regionView, region);
        });
        regionView.on("pointerupoutside", (_e) => {
            this.stopMovingRegion(regionView, region);
        });
    }

    stopMovingRegion(regionView: RegionView, region: Region) {
        this.isMovingRegion = false;
        let track = this.app.tracks.getTrack(region.trackId);
        if (track == undefined) {
            throw new Error("Track not found");
        }
        region.updateStart(regionView.position.x * RATIO_MILLS_BY_PX);
        track.modified = true;
    }

}