// @ts-ignore
import UndoManager from "undo-manager/lib/undomanager.js";


import HostView from "./Views/HostView";
import HostController from "./Controllers/HostController";
import TracksController from "./Controllers/TracksController";

import TracksView from "./Views/TracksView";
import Host from "./Models/Host";
import PluginsController from "./Controllers/PluginsController";
import PluginsView from "./Views/PluginsView";
import AutomationController from "./Controllers/AutomationController";
import AutomationView from "./Views/AutomationView";
import RecorderController from "./Controllers/RecorderController";
import LatencyController from "./Controllers/LatencyController";
import LatencyView from "./Views/LatencyView";
import SettingsController from "./Controllers/SettingsController";
import SettingsView from "./Views/SettingsView";
import Loader from "./Loader/Loader";
import ProjectController from "./Controllers/ProjectController";
import ProjectView from "./Views/ProjectView";
import EditorController from "./Controllers/Editor/EditorController";
import WaveformController from "./Controllers/Editor/WaveformController";
import RegionsController from "./Controllers/Editor/RegionsController";
import PlayheadController from "./Controllers/Editor/PlayheadController";
import EditorView from "./Views/Editor/EditorView";
import KeyboardController from "./Controllers/KeyboardController";
import ExporterController from "./Controllers/ExportController";
import LoopController from "./Controllers/Editor/LoopController";
import AboutView from "./Views/AboutView";
import KeyboardShortcutsView from "./Views/KeyboardShortcutsView";

/**
 * Main class for the host. Start all controllers, views and models. All controllers and views are accessible frome this app.
 */
export default class App {
    
    hostController: HostController;
    tracksController: TracksController;
    pluginsController: PluginsController;
    automationController: AutomationController;
    recorderController: RecorderController;
    latencyController: LatencyController;
    settingsController: SettingsController;
    projectController: ProjectController;
    editorController: EditorController;
    waveformController: WaveformController;
    regionsController: RegionsController;
    playheadController: PlayheadController
    keyboardController: KeyboardController;
    exportController: ExporterController;
    loopController: LoopController;

    hostView: HostView;
    tracksView: TracksView;
    pluginsView: PluginsView;
    automationView: AutomationView;
    latencyView: LatencyView;
    settingsView: SettingsView;
    projectView: ProjectView;
    editorView: EditorView;
    aboutView: AboutView;
    keyboardShortcutsView: KeyboardShortcutsView;

    host: Host;
    loader: Loader;

    undoManager:UndoManager;


    constructor() {
        this.host = new Host(this);
        this.loader = new Loader(this);

        this.hostView = new HostView();
        this.tracksView = new TracksView();
        this.pluginsView = new PluginsView();
        this.automationView = new AutomationView();
        this.latencyView = new LatencyView();
        this.settingsView = new SettingsView();
        this.projectView = new ProjectView();
        this.editorView = new EditorView();
        this.aboutView = new AboutView();
        this.keyboardShortcutsView = new KeyboardShortcutsView();

        this.editorController = new EditorController(this);
        this.waveformController = new WaveformController(this);
        this.regionsController = new RegionsController(this);
        this.playheadController = new PlayheadController(this);
        this.hostController = new HostController(this);
        this.tracksController = new TracksController(this);
        this.pluginsController = new PluginsController(this);
        this.automationController = new AutomationController(this);
        this.recorderController = new RecorderController(this);
        this.latencyController = new LatencyController(this);
        this.settingsController = new SettingsController(this);
        this.projectController = new ProjectController(this);
        this.keyboardController = new KeyboardController(this);
        this.exportController = new ExporterController(this);
        this.loopController = new LoopController(this);
        
        this.hostController.addDraggableWindow(this.pluginsView, this.latencyView, this.settingsView, 
            this.projectView, this.aboutView, this.keyboardShortcutsView);

        this.undoManager = new UndoManager();

    }

    /**
     * Initialize the master track for the host.
     */
    async initHost() {
        await this.host.initWAM()
        this.hostController.bindNodeListeners();
    }
}
