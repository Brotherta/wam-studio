import MenuView from "./Views/MenuView";
import AudioController from "./Controllers/AudioController";
import CanvasController from "./Controllers/CanvasController";
import TrackController from "./Controllers/TrackController";

import TrackView from "./Views/TrackView";
import { makeDivScrollSync } from "./Controllers/StaticController";
import Audios from "./Models/Audios";
import CanvasView from "./Views/CanvasView";
import Host from "./Models/Host";
import PlayheadController from "./Controllers/PlayheadController";

export default class App {
    
    audioController: AudioController;
    canvasController: CanvasController;
    trackController: TrackController;
    playheadController: PlayheadController;

    menuView: MenuView;
    trackView: TrackView;
    canvasView: CanvasView;

    audios: Audios;
    host: Host;

    constructor() {
        this.audios = new Audios(this);
        this.host = new Host(this);

        this.menuView = new MenuView();
        this.trackView = new TrackView();
        this.canvasView = new CanvasView();

        this.audioController = new AudioController(this);
        this.canvasController = new CanvasController(this);
        this.trackController = new TrackController(this);
        this.playheadController = new PlayheadController(this);

        makeDivScrollSync();
    }

    async initHost() {
        await this.host.initWAM()
    }
}