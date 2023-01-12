import HostView from "./Views/HostView";
import HostController from "./Controllers/HostController";
import EditorController from "./Controllers/EditorController";
import TrackController from "./Controllers/TrackController";

import TrackView from "./Views/TrackView";
import { makeDivScrollSync } from "./Controllers/StaticController";
import Tracks from "./Models/Tracks";
import Host from "./Models/Host";
import PlayheadController from "./Controllers/PlayheadController";
import PluginsController from "./Controllers/PluginsController";
import PluginsView from "./Views/PluginsView";
import Plugins from "./Models/Plugins";
import EditorView from "./Views/EditorView";

/**
 * Main class for the host. Start all controllers, views and models. All controllers and views are accessible frome this app.
 */
export default class App {
    
    hostController: HostController;
    editorController: EditorController;
    trackController: TrackController;
    playheadController: PlayheadController;
    pluginsController: PluginsController;

    hostView: HostView;
    trackView: TrackView;
    editorView: EditorView;
    pluginsView: PluginsView;

    tracks: Tracks;
    host: Host;
    plugins: Plugins;

    constructor() {
        this.tracks = new Tracks(this);
        this.host = new Host(this);
        this.plugins = new Plugins();

        this.hostView = new HostView();
        this.trackView = new TrackView();
        this.pluginsView = new PluginsView();
        this.editorView = new EditorView();

        this.hostController = new HostController(this);
        this.editorController = new EditorController(this);
        this.trackController = new TrackController(this);
        this.playheadController = new PlayheadController(this);
        this.pluginsController = new PluginsController(this);

        makeDivScrollSync();
    }

    /**
     * Initialize the master track for the host.
     */
    async initHost() {
        await this.host.initWAM()
    }
}