// @ts-ignore
import UndoManager from "undo-manager/lib/undomanager.js";


import TracksController from "./Controllers/Editor/Track/TracksController";
import HostController from "./Controllers/HostController";
import HostView from "./Views/HostView";

import AutomationController from "./Controllers/AutomationController";
import EditorController from "./Controllers/Editor/EditorController";
import LoopController from "./Controllers/Editor/LoopController";
import PlayheadController from "./Controllers/Editor/PlayheadController";
import MIDIRegionController from "./Controllers/Editor/Region/MIDIRegionController";
import SampleRegionController from "./Controllers/Editor/Region/SampleRegionController";
import WaveformController from "./Controllers/Editor/WaveformController";
import ExporterController from "./Controllers/ExportController";
import KeyboardController from "./Controllers/KeyboardController";
import LatencyController from "./Controllers/LatencyController";
import PluginsController from "./Controllers/PluginsController";
import ProjectController from "./Controllers/ProjectController";
import RecorderController from "./Controllers/RecorderController";
import SettingsController from "./Controllers/SettingsController";
import Loader from "./Loader/Loader";
import HostTrack from "./Models/Track/HostTrack";
import AboutView from "./Views/AboutView";
import AutomationView from "./Views/AutomationView";
import EditorView from "./Views/Editor/EditorView";
import KeyboardShortcutsView from "./Views/KeyboardShortcutsView";
import LatencyView from "./Views/LatencyView";
import PluginsView from "./Views/PluginsView";
import ProjectView from "./Views/ProjectView";
import SettingsView from "./Views/SettingsView";
import TracksView from "./Views/TracksView";

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
    midiRegionsController: MIDIRegionController;
    regionsController: SampleRegionController;
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

    host: HostTrack;
    loader: Loader;

    undoManager:UndoManager;
    audioLoopBrowser: any;

    constructor() {
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
        this.regionsController = new SampleRegionController(this);
        this.midiRegionsController = new MIDIRegionController(this);
        this.playheadController = new PlayheadController(this);
        this.tracksController = new TracksController(this);
        this.host = new HostTrack(this,this.tracksController.tracks);
        this.hostController = new HostController(this);
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
        const old=this.undoManager.add.bind(this.undoManager)
        
        //@ts-ignore
        this.undoManager.add=(...args)=>{
            old(...args)
            console.trace()
        }
    }

    /**
     * Initialize the master track for the host.
     */
    async initHost() {
        await this.host.initWAM()
        this.hostController.bindNodeListeners();
    }

    /**
   * Do something once, and if undoable is true, save the do and undo functions in the undo manager.
   * todo is called, and if undoable id true, todo and undo are added to the undoManager respectively as redo and undo
   * @param undoable Is the action saved in the undo manager
   * @param todo The todo and redo function, called once and then saved as a redo function if undoable is true
   * @param undo The undo function, it should cancel what do did, it is save in the undo manager if undoable is true
   */
    doIt(undoable: boolean, todo: ()=>void, undo: ()=>void){
        todo()
        if(undoable) this.addRedoUndo(todo, undo)
    }

    /**
     * Add redo and undo functions to the undo manager
     * @param redo The redo function
     * @param undo The undo function
     */
    addRedoUndo(redo: ()=>void, undo: ()=>void){
        // to disable/enable undo/redo buttons if undo/redo is available
        const refreshButtons= ()=>{
            this.hostView.setUndoButtonState(this.undoManager.hasUndo())
            this.hostView.setRedoButtonState(this.undoManager.hasRedo())
        }
        this.undoManager.add({
            undo: ()=>{
                undo()
                refreshButtons()
            },
            redo: ()=>{
                redo()
                refreshButtons()
            }
        })
        refreshButtons()
    }
}
