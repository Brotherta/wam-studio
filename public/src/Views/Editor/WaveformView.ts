import {Container, Graphics} from "pixi.js";
import EditorView from "./EditorView";
import RegionView from "./RegionView";
import Track from "../../Models/Track";
import {HEIGHT_TRACK, OFFSET_FIRST_TRACK} from "../../Utils/Constants";
import Region from "../../Models/Region";
import TrackElement from "../../Components/TrackElement";


export default class WaveformView extends Container {

    editor: EditorView;
    regionViews: RegionView[];
    background: Graphics;

    trackId: number;

    color: string;
    myWidth: number;

    initialX: number;
    initialY: number;
    originalX: number;
    originalY: number;
    movingRegion: RegionView | undefined;

    constructor(editor: EditorView, track: Track) {
        super();
        this.editor = editor;
        this.trackId = track.id;
        this.color = track.color;
        this.myWidth = this.editor.renderer.width;

        this.regionViews = [];

        this.eventMode = "dynamic";
        this.editor.viewport.addChild(this);

        this.zIndex = 0;
        this.setPos(track);
    }

    setPos(track: Track) {
        let trackContainer = document.getElementById("track-container") as HTMLDivElement;
        // get the position of the track in the track container taking into account only the track-elements
        let pos = Array.from(trackContainer.children).filter(e => e instanceof TrackElement).indexOf(track.element);

        this.position.x = 0;
        this.position.y = pos*HEIGHT_TRACK+25;
    }

    createRegionView(region: Region) {
        let regionView = new RegionView(this.editor, this.trackId, region);
        this.regionViews.push(regionView);
        this.addChild(regionView);

        regionView.initRegion(this.color, region);
        return regionView;
    }

    removeRegionView(regionView: RegionView) {
        if (this.movingRegion === regionView) {
            this.movingRegion = undefined;
        }
        let index = this.regionViews.indexOf(regionView);
        this.regionViews.splice(index, 1);
        this.removeChild(regionView);
    }

    startMovingRegion(regionView: RegionView, initialX: number, initialY: number) {
        this.initialX = initialX;
        this.originalX = regionView.x;
        this.initialY = initialY;
        this.originalY = regionView.y;
        this.movingRegion = regionView;
    }

    moveRegion(x: number, _y: number) {
        if (this.movingRegion !== undefined) {
            let deltaX = x - this.initialX;
            let move = this.originalX + deltaX;

            if (move < 0) {
                deltaX = -this.originalX;
            }
            if (move + this.movingRegion.width > this.myWidth) {
                deltaX = this.myWidth - this.movingRegion.width - this.originalX;
            }

            this.movingRegion.position.x = Math.round(this.originalX + deltaX);
        }
    }

    stopMovingRegion() {
        this.movingRegion = undefined;
    }

    propagateMove(regionView: RegionView, oldWaveformView: WaveformView) {
        this.initialX = oldWaveformView.initialX;
        this.originalX = oldWaveformView.originalX;
        this.initialY = oldWaveformView.initialY;
        this.originalY = oldWaveformView.originalY;
        this.movingRegion = regionView;
    }

    getRegionView(regionId: number) {
        return this.regionViews.find(regionView => regionView.id === regionId);
    }
}