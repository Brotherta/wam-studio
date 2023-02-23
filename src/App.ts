import HostView from "./Views/HostView";
import HostController from "./Controllers/HostController";
import EditorController from "./Controllers/EditorController";
import TracksController from "./Controllers/TracksController";

import TracksView from "./Views/TracksView";
import { makeDivScrollSync } from "./Controllers/StaticController";
import Tracks from "./Models/Tracks";
import Host from "./Models/Host";
import PlayheadController from "./Controllers/PlayheadController";
import PluginsController from "./Controllers/PluginsController";
import PluginsView from "./Views/PluginsView";
import EditorView from "./Views/EditorView";
import AutomationController from "./Controllers/AutomationController";
import AutomationView from "./Views/AutomationView";
import RegionsController from "./Controllers/RegionsController";
import WaveformController from "./Controllers/WaveformController";

/**
 * Main class for the host. Start all controllers, views and models. All controllers and views are accessible frome this app.
 */
export default class App {
    
    hostController: HostController;
    editorController: EditorController;
    tracksController: TracksController;
    playheadController: PlayheadController;
    pluginsController: PluginsController;
    automationController: AutomationController;
    waveFormController: WaveformController;

    hostView: HostView;
    tracksView: TracksView;
    editorView: EditorView;
    pluginsView: PluginsView;
    automationView: AutomationView;

    tracks: Tracks;
    host: Host;
    regionsController: RegionsController;

    constructor() {
        this.tracks = new Tracks(this);
        this.host = new Host(this);

        this.hostView = new HostView();
        this.tracksView = new TracksView();
        this.pluginsView = new PluginsView();
        this.editorView = new EditorView();
        this.automationView = new AutomationView();

        this.hostController = new HostController(this);
        this.editorController = new EditorController(this);
        this.tracksController = new TracksController(this);
        this.playheadController = new PlayheadController(this);
        this.pluginsController = new PluginsController(this);
        this.automationController = new AutomationController(this);
        this.waveFormController = new WaveformController(this);
        this.regionsController = new RegionsController(this);

        makeDivScrollSync();
    }

    /**
     * Initialize the master track for the host.
     */
    async initHost() {
        await this.host.initWAM()
    }
}