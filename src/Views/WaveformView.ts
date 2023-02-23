import RegionView from "./RegionView";
import {Application, Container, Graphics} from "pixi.js";
import {HEIGHT_TRACK, OFFSET_FIRST_TRACK} from "../Utils";
import Track from "../Models/Track";
import Region from "../Models/Region";


export default class WaveformView extends Container{

    pixiApp: Application;
    regionViews: RegionView[];
    trackId: number;

    background: Graphics;

    color: string;
    myWidth: number;

    initialX: number;
    initialY: number;
    originalX: number;
    originalY: number;
    movingRegion: RegionView | undefined;

    constructor(pixiApp: Application, track: Track) {
        super();
        this.pixiApp = pixiApp;
        this.trackId = track.id;
        this.color = track.color;
        this.myWidth = this.pixiApp.renderer.width;

        this.regionViews = [];


        this.zIndex = 0;
        this._setPos(track);
        // this._setBackground();

        this.interactive = true;
        this.pixiApp.stage.addChild(this);
    }

    _setPos(track: Track) {
        let top = Math.round(track.element.getBoundingClientRect().top - OFFSET_FIRST_TRACK);
        let pos = top/HEIGHT_TRACK;

        this.position.x = 0;
        this.position.y = pos*HEIGHT_TRACK;
    }

    /**
     * Initialize the background and draw the background of the waveform.
     */
    _setBackground() {
        this.background = new Graphics();
        this._drawBackground();
        this.addChild(this.background);
    }

    createRegionView(region: Region) {
        let regionView = new RegionView(this.pixiApp, this.trackId, region);
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

    _drawBackground() {
        this.background.beginFill(0x2c2c2c);
        this.background.lineStyle({width: 1,color: 0x000000});
        this.background.drawRect(0, 0, this.width, HEIGHT_TRACK-1);
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