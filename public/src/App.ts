import HostView from "./Views/HostView";
import HostController from "./Controllers/HostController";
import TracksController from "./Controllers/TracksController";

import TracksView from "./Views/TracksView";
import { makeDivScrollSync } from "./Controllers/StaticController";
import Host from "./Models/Host";
import PlayheadController from "./Controllers/PlayheadController";
import PluginsController from "./Controllers/PluginsController";
import PluginsView from "./Views/PluginsView";

import Loader from "./Loader/Loader";
import ProjectView from "./Views/ProjectView";
import ProjectController from "./Controllers/ProjectController";
import PresetsController from "./Controllers/PresetsController";
import BindsController from "./Controllers/BindsController";
import BindsView from "./Views/BindsView";
import ExporterController from "./Controllers/ExporterController";
import i18n from "./i18n";

console.log("language:", i18n.language);

/**
 * Main class for the host. Start all controllers, views and models. All controllers and views are accessible frome this app.
 */
export default class App {
    
    hostController: HostController;
    tracksController: TracksController;
    playheadController: PlayheadController;
    pluginsController: PluginsController;
    projectController: ProjectController;
    bindsController: BindsController;
    presetsController: PresetsController;
    exportController: ExporterController;

    hostView: HostView;
    tracksView: TracksView;
    pluginsView: PluginsView;
    projectView: ProjectView;
    bindsView: BindsView;

    host: Host;
    loader: Loader;


    constructor() {
        this.host = new Host(this);
        this.loader = new Loader(this);

        this.hostView = new HostView();
        this.tracksView = new TracksView();
        this.pluginsView = new PluginsView();
        this.projectView = new ProjectView();
        this.bindsView = new BindsView();

        this.tracksController = new TracksController(this);
        this.hostController = new HostController(this);
        this.playheadController = new PlayheadController(this);
        this.pluginsController = new PluginsController(this);
        this.projectController = new ProjectController(this);
        this.bindsController = new BindsController(this);
        this.presetsController = new PresetsController(this);
        this.exportController = new ExporterController(this);

        makeDivScrollSync();
    }

    /**
     * Initialize the master track for the host.
     */
    async initHost() {
        await this.host.initWAM()
    }
}