import {Container, Graphics} from "pixi.js";
import EditorView from "./EditorView";
import RegionView from "./RegionView";
import Track from "../../Models/Track";
import {HEIGHT_TRACK, OFFSET_FIRST_TRACK} from "../../Utils/Variables";
import Region from "../../Models/Region";
import TrackElement from "../../Components/TrackElement";


export default class WaveformView extends Container {

    editor: EditorView;
    regionViews: RegionView[];
    background: Graphics;

    trackId: number;

    color: string;
    myWidth: number;

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

        regionView.initializeRegionView(this.color, region);
        return regionView;
    }

    removeRegionView(regionView: RegionView) {
        let index = this.regionViews.indexOf(regionView);
        this.regionViews.splice(index, 1);
        this.removeChild(regionView);
    }

    addRegionView(regionView: RegionView) {
        this.regionViews.push(regionView);
        this.addChild(regionView);
    }

    getRegionView(regionId: number) {
        return this.regionViews.find(regionView => regionView.id === regionId);
    }
}