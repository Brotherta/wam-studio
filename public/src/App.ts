import HostView from "./Views/HostView";
import HostController from "./Controllers/HostController";
import EditorController from "./Controllers/EditorController";
import TracksController from "./Controllers/TracksController";

import TracksView from "./Views/TracksView";
import { makeDivScrollSync } from "./Controllers/StaticController";
import Host from "./Models/Host";
import PlayheadController from "./Controllers/PlayheadController";
import PluginsController from "./Controllers/PluginsController";
import PluginsView from "./Views/PluginsView";
import EditorViewOld from "./Views/EditorViewOld";
import AutomationController from "./Controllers/AutomationController";
import AutomationView from "./Views/AutomationView";
import RegionsControllerOld from "./Controllers/RegionsControllerOld";
import WaveformControllerOld from "./Controllers/WaveformControllerOld";
import RecorderController from "./Controllers/RecorderController";
import LatencyController from "./Controllers/LatencyController";
import LatencyView from "./Views/LatencyView";
import SettingsController from "./Controllers/SettingsController";
import SettingsView from "./Views/SettingsView";
import Loader from "./Loader/Loader";
import ProjectController from "./Controllers/ProjectController";
import ProjectView from "./Views/ProjectView";

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
    waveFormController: WaveformControllerOld;
    regionsController: RegionsControllerOld;
    recorderController: RecorderController;
    latencyController: LatencyController;
    settingsController: SettingsController;
    projectController: ProjectController;

    hostView: HostView;
    tracksView: TracksView;
    editorView: EditorViewOld;
    pluginsView: PluginsView;
    automationView: AutomationView;
    latencyView: LatencyView;
    settingsView: SettingsView;
    projectView: ProjectView;

    host: Host;
    loader: Loader;


    constructor() {
        this.host = new Host(this);
        this.loader = new Loader(this);

        this.hostView = new HostView();
        this.tracksView = new TracksView();
        this.pluginsView = new PluginsView();
        this.editorView = new EditorViewOld();
        this.automationView = new AutomationView();
        this.latencyView = new LatencyView();
        this.settingsView = new SettingsView();
        this.projectView = new ProjectView();

        this.hostController = new HostController(this);
        this.editorController = new EditorController(this);
        this.tracksController = new TracksController(this);
        this.playheadController = new PlayheadController(this);
        this.pluginsController = new PluginsController(this);
        this.automationController = new AutomationController(this);
        this.waveFormController = new WaveformControllerOld(this);
        this.regionsController = new RegionsControllerOld(this);
        this.recorderController = new RecorderController(this);
        this.latencyController = new LatencyController(this);
        this.settingsController = new SettingsController(this);
        this.projectController = new ProjectController(this);

        makeDivScrollSync();
    }

    /**
     * Initialize the master track for the host.
     */
    async initHost() {
        await this.host.initWAM()
    }
}
