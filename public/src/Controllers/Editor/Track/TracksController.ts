import App from "../../../App";
import OperableAudioBuffer from "../../../Audio/OperableAudioBuffer";
import WamAudioWorkletNode from "../../../Audio/WAM/WamAudioWorkletNode";
import WamEventDestination from "../../../Audio/WAM/WamEventDestination";
import TrackElement from "../../../Components/TrackElement";
import { RATIO_MILLS_BY_PX } from "../../../Env";
import Plugin from "../../../Models/Plugin";
import SampleTrack from "../../../Models/Track/SampleTrack";
import WaveformView from "../../../Views/Editor/WaveformView";
import TracksView from "../../../Views/TracksView";
import { audioCtx } from "../../../index";

import WebAudioPeakMeter from "../../../Audio/Utils/PeakMeter";
import { RegionOf } from "../../../Models/Region/Region";
import SampleRegion from "../../../Models/Region/SampleRegion";
import TrackOf from "../../../Models/Track/Track.js";
import FriendlyIterable from "../../../Utils/FriendlyIterable";

export class TrackList<REGION extends RegionOf<REGION>, TRACK extends TrackOf<REGION>> {
  
  _tracks: TRACK[]=[]

  /**
   * Get a track by his id
   * @param id 
   */
  public getById(id:number): TRACK|undefined {
    return this._tracks.find( track => track.id === id );
  }

  [Symbol.iterator](){
    return this._tracks[Symbol.iterator]()
  }
}

/**
 * Class that controls the tracks view. It creates, removes and manages the tracks. It also defines the listeners for the tracks.
 */
export default class TracksController{

  /** Selected track. It is undefined if the host is selected. */
  public selectedTrack: TrackOf<any> | undefined;

  /** The app instance. */
  private _app: App;

  /** The ammount of tracks id. The track id counter. */
  public trackIdCount: number;

  /** The tracks view instance. */
  private _view: TracksView;

  /* For undo / redo */
  private _oldVolume: number = 0.5;
  private _oldBalance = 1;

  /**
   * The list of tracks.
   * You have to add one for all the type tracks you want to manage. 
   * */
  public readonly sampleTracks= new TrackList<SampleRegion,SampleTrack>()

  private readonly track_lists: TrackList<any,any>[]= [this.sampleTracks]

  constructor(app: App) {
    this._app = app
    this._view = app.tracksView
    this.trackIdCount = 1
    this.bindEvents()
  }

  /**
   * Add a track and Initializes its view.
   * It also initializes the waveforms and the automations.
   *
   * @param track - The track to be initialized.
   */
  public addTrack<T extends TrackOf<any>>(list: TrackList<any,T>, track: T): void {
    // Add the track to the list
    list._tracks.push(track)

    // Create its track element (GUI)
    track.plugin = new Plugin(this._app);
    track.element.trackId = this.trackIdCount++;
    // wait until the trackElement WebComponent is connected
    // to the DOM before initializing the peak meter
    let id = setInterval(() => {
      // create the peak meter
      if (track.element.isConnected) {
        let peakMeter = new WebAudioPeakMeter(
          audioCtx,
          track.outputNode,
          track.element.getPeakMeterParentElement(),
          {
            borderSize: 2,
            fontSize: 7, // tick fontSize. If zero -> no ticks, no labels etc.
            backgroundColor: "#1C1E21",
            tickColor: "#ddd",
            labelColor: "#ddd",
            gradient: ["red 1%", "#ff0 16%", "lime 45%", "#080 100%"],
            dbRange: 48,
            dbTickSize: 6,
            maskTransition: "0.1s",
          }
        );
        clearInterval(id);
      }
    }, 100);
    this._view.addTrack(track.element);
    this._view.changeColor(track);
    this.bindTrackEvents(track);
    
    if(track instanceof SampleTrack){
      this._app.waveformController.initializeWaveform(track);
    }
    this._app.automationView.initializeAutomation(track.id);

    if(this.tracks.find(it=>it.isSolo))track.isSoloMuted=true
  }

  /**
   * Removes a track from the track view. It also removes the track from the audio controller.
   *
   * @param track - Track to be removed from the track view.
   */
  public removeTrack(track: TrackOf<any>): void {
    // Remove from the lists
    for(const list of this.track_lists){
      const index=list._tracks.indexOf(track)
      if(index>=0){
        list._tracks.splice(index,1)
        break
      }
    }

    track.deleted = true; // Used to stop the track to be loaded on xhr request
    this._app.pluginsController.removePedalBoard(track);
    this._view.removeTrack(track.element);
    this._app.automationView.removeAutomationBpf(track.id);
    track.outputNode.disconnect()
    if(track instanceof SampleTrack){
      this._app.waveformController.removeWaveformOfTrack(track);
      track.node!.removeAudio();
      track.node!.disconnectEvents();
      track.node!.disconnect();
    }
  }

  /**
   * Gets the track with the given id.
   * @param id - The id of the track.
   * @returns the track with the given id if it exists, undefined otherwise.
   */
  public getTrackById(id: number): TrackOf<any> | undefined {
    for(let list of this.track_lists){
      let ret=list.getById(id)
      if(ret!=null)return ret
    }
    return undefined
  }

  /**
   * An iterator for iterating over all tracks of all track lists
   */
  public readonly tracks_and_lists=new FriendlyIterable(()=>this._tracks_and_lists())
  private *_tracks_and_lists(): Generator<[TrackOf<any>,TrackList<any,any>]>{
    for(let list of this.track_lists){
      for(let track of list){
        yield [track,list]
      }
    }
  }

  /**
   * An iterator for iterating over all tracks of all track lists
   */
  public readonly tracks=new FriendlyIterable(()=>this._tracks())
  private *_tracks(): Generator<TrackOf<any>>{
    for(let list of this.track_lists){
      for(let track of list){
        yield track
      }
    }
  }

  /**
   * Clears all tracks.
   * It removes all tracks from the track list and disconnects the audio nodes.
   */
  public clearAllTracks(): void {
    for (let track of [...this.tracks]) this.removeTrack(track)
    for(let list of this.track_lists)
      if(list._tracks.length!=0)
        console.error("TracksControllers - clearAllTracks - There is remaining tracks!")
  }

  /**
   * Creates a new TracksView with the given audio node. Initializes the audio nodes and the canvas.
   *
   * @param node - The audio node of the track.
   * @returns the created track
   * @private
   */
  private createTrackFromNode(node: WamAudioWorkletNode): SampleTrack {
    let track = new SampleTrack(this.trackIdCount, new TrackElement(), node);
    return track;
  }

  /**
   * Creates a new empty track. It creates the audio node and the track.
   *
   * @param url - The url of the track.
   * @returns the created track
   */
  public async createEmptySampleTrack(url?: string): Promise<SampleTrack> {
    let wamInstance = await WamEventDestination.createInstance(this._app.host.hostGroupId, audioCtx);
    let node = wamInstance.audioNode as WamAudioWorkletNode;

    let track = this.createTrackFromNode(node);
    if (url) {
      let urlSplit = url.split("/");
      track.element.name = urlSplit[urlSplit.length - 1];
    } else {
      track.element.name = `Track ${track.id}`;
    }
    return track;
  }

  /**
   * Creates the track with the given file. It verifies the type of the file and then create the track.
   *
   * It returns undefined if the file is not an audio file and if the duration of the file is too long.
   *
   * @param file - The file to create the track.
   */
  public async createTrackWithFile(file: File): Promise<SampleTrack | undefined> {
    if (["audio/ogg", "audio/wav", "audio/mpeg", "audio/x-wav"].includes(file.type)) {
      let wamInstance = await WamEventDestination.createInstance(this._app.host.hostGroupId, audioCtx);
      let node = wamInstance.audioNode as WamAudioWorkletNode;

      let audioArrayBuffer = await file.arrayBuffer();
      let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
      let operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;
      operableAudioBuffer = operableAudioBuffer.makeStereo();

      node.setAudio(operableAudioBuffer.toArray());

      let track = this.createTrackFromNode(node);
      track.setAudioBuffer(operableAudioBuffer);
      track.element.name = file.name;
      return track;
    } else {
      console.warn("File type not supported");
      return undefined;
    }
  }

  public async newTrackFromDeletedTrack(deletedTrack: SampleTrack) {
    let wamInstance = await WamEventDestination.createInstance(
      this._app.host.hostGroupId,
      audioCtx
    );
    let node = wamInstance.audioNode as WamAudioWorkletNode;
    let track = this.createTrackFromNode(node);
    //track.setAudioBuffer(deletedTrack.audioBuffer!);
    track.element = deletedTrack.element;
    track.color = deletedTrack.color;
    track.isMuted = deletedTrack.isMuted;
    track.isSolo = deletedTrack.isSolo;
    track.isMerged = deletedTrack.isMerged;
    track.left = deletedTrack.left;
    track.right = deletedTrack.right;
    track.isStereo = deletedTrack.isStereo;
    track.isArmed = deletedTrack.isArmed;
    track.monitored = deletedTrack.monitored;
    track.volume=deletedTrack.volume;
    track.balance=deletedTrack.balance;
    return track;
  }
  /**
   * Jumps audio to the given position in px.
   *
   * @param pos - The position in px
   */
  public jumpTo(pos: number): void {
    this._app.host.playhead = Math.floor(
      ((pos * RATIO_MILLS_BY_PX) / 1000) * audioCtx.sampleRate
    );

    for(const track of this.tracks) if(track instanceof SampleTrack) track.node!.port.postMessage({ playhead: this._app.host.playhead + 1 })

    this._app.host.hostNode?.port.postMessage({
      playhead: this._app.host.playhead + 1,
    });
  }

  /**
   * Bind the events of the track view.
   * @private
   */
  private bindEvents(): void {
    this._view.newTrackDiv.addEventListener("click", () => {
      this._app.tracksController.createEmptySampleTrack().then((track) => {
        this.addTrack(this.sampleTracks,track)
        track.element.progressDone()
      });
    });
  }

  /**
   * Binds all events of the given track. It defines the listeners for the close, solo, mute, volume and balance sliders etc.
   *
   * @param track - Track to be binded.
   * @private
   */
  private bindTrackEvents(track: TrackOf<any>): void {
    // TRACK SELECT
    track.element.addEventListener("click", () => {
      // for undo/redo
      let oldSelectedTrack = this.selectedTrack

      // Select the track when it is clicked.
      if (!track.deleted) {
        this._app.pluginsController.selectTrack(track);
      }

      let newSelectedTrack = this.selectedTrack;

      if(newSelectedTrack!=oldSelectedTrack)this._app.undoManager.add({
        undo: () => this.undoSelect(track, oldSelectedTrack),
        redo: () => this.undoSelect(track, newSelectedTrack),
      });
      this.updateUndoButtons();
    });

    // REMOVE TRACK
    track.element.closeBtn.addEventListener("click", () => {
      // for undo/redo
      // make a copy of the track
      let oldTrack = track;
      let oldWaveform = this._app.editorView.getWaveformById(oldTrack.id);
      let oldTrackElement = track.element;
      let oldPlugin = track.plugin;

      // Remove the track when the close button is clicked.
      this.removeTrack(track);
    });

    // SOLO TRACK
    track.element.soloBtn.addEventListener("click", () => {
      let initialSolo = track.isSolo;
      this._app.doIt(true,
        ()=> this.setSolo(track, !initialSolo),
        ()=> this.setSolo(track, initialSolo),
      )
    });

    // MUTE TRACK
    track.element.muteBtn.addEventListener("click", () => {
      let initialMute = track.isMuted
      this._app.doIt(true,
        ()=> track.isMuted = !initialMute,
        ()=> track.isMuted = initialMute,
      )
    });

    // TRACK VOLUME
    track.element.volumeSlider.addEventListener("input", (evt) => {
      // Change the volume of the track when the volume slider is changed.
      const newVolume: number =
        parseInt(track.element.volumeSlider.value) / 100;
      track.volume=newVolume;
    });
    // for undo / redo setVolume
    track.element.volumeSlider.addEventListener("mousedown", (evt) => {
      // memorize volume when we first clicked on the slider
      this._oldVolume = track.volume;
    });
    track.element.volumeSlider.addEventListener("change", (evt) => {
      const newVolume: number =
        parseInt(track.element.volumeSlider.value) / 100;
      // for undo/redo
      let oldV = this._oldVolume;

      this._app.doIt(true,
        ()=> track.volume = newVolume,
        ()=> track.volume = oldV,
      );
    });

    // TRACK BALANCE
    track.element.balanceSlider.addEventListener("input", () => {
      // Change the balance of the track when the balance slider is changed.
      track.balance=parseFloat(track.element.balanceSlider.value);
    });
    // for undo / redo set balance
    track.element.balanceSlider.addEventListener("mousedown", (evt) => {
      // memorize volume when we first clicked on the slider
      this._oldBalance = track.balance;
    });
    track.element.balanceSlider.addEventListener("change", (evt) => {
      const newBalance: number = +track.element.balanceSlider.value;
      let oldB = this._oldBalance;

      this._app.doIt(true,
        ()=> track.balance = newBalance,
        ()=> track.balance = oldB,
      );
    });

    // TRACK COLOR
    track.element.color.addEventListener("click", () => {
      // Change the color of the track when the color button is clicked.
      // for undo/redo
      let oldColor = track.color;
      this.changeColor(track);
      let newColor = track.color;

      this._app.undoManager.add({
        undo: () => {
          this.undoTrackColorChange(track, oldColor);
        },
        redo: () => {
          this.undoTrackColorChange(track, newColor);
        },
      });
      this.updateUndoButtons();
    });

    // TRACK AUTOMATION
    track.element.automationBtn.addEventListener("click", async (e) => {
      // Open the automation menu when the automation button is clicked.
      this.automationMenu(e, track);
    })
    
    if(track instanceof SampleTrack){
      // TRACK ARM
      track.element.armBtn.addEventListener("click", () => {
        let initialArm: boolean = track.isArmed;
        this._app.doIt(true,
          ()=> this._app.recorderController.clickArm(track),
          ()=> this._app.recorderController.clickArm(track),
        );
      })

      // TRACK MONITOR
      track.element.monitoringBtn.addEventListener("click", () => {
        this._app.doIt(true,
          ()=> this._app.recorderController.clickMonitoring(track),
          ()=> this._app.recorderController.clickMonitoring(track),
        );
      })

      // TRACK MODE STEREO or (MONO to STEREO)
      track.element.modeBtn.addEventListener("click", () => {
        if(!(track instanceof SampleTrack))return
        let initialStereo: boolean = track.isStereo
        this._app.doIt(true,
          ()=> track.isStereo = !initialStereo,
          ()=> track.isStereo = initialStereo,
        )
      })

      // TRACK LEFT INPUT
      track.element.leftBtn.addEventListener("click", () => {
        if(!(track instanceof SampleTrack))return
        let initialLeft: boolean = track.left
        this._app.doIt(true,
          ()=> track.left = !initialLeft,
          ()=> track.left = initialLeft,
        )
      })

      // TRACK RIGHT INPUT
      track.element.rightBtn.addEventListener("click", () => {
        if(!(track instanceof SampleTrack))return
        let initialRight: boolean = track.right
        this._app.doIt(true,
          ()=> track.right = !initialRight,
          ()=> track.right = initialRight,
        )
      })

      // TRACK MERGE LEFT/RIGHT
      track.element.mergeBtn.addEventListener("click", () => {
        if(!(track instanceof SampleTrack))return
        let initialMerge: boolean = track.isMerged
        this._app.doIt(true,
          ()=> track.isMerged = !initialMerge,
          ()=> track.isMerged = initialMerge,
        )
      })
    }

    // TRACK FX/PLUGINS
    track.element.fxBtn.addEventListener("click", () => {
      // for undo/redo
      let oldFxStatus = this._app.pluginsView.windowOpened;

      // Open the fx menu when the fx button is clicked.
      this._app.pluginsController.fxButtonClicked(track);

      let newFxStatus = this._app.pluginsView.windowOpened;

      this._app.undoManager.add({
        undo: () => {
          this.undoFx(track, oldFxStatus);
        },
        redo: () => {
          this.undoFx(track, newFxStatus);
        },
      });
    });
  }

  /**
   * Handles the automation button of the given track.
   * @param track - The track to open the automation menu.
   * @private
   */
  private async automationMenu(e: Event, track: TrackOf<any>): Promise<void> {
    this._app.pluginsController.selectTrack(track);
    await this._app.automationController.openAutomationMenu(track);
    e.stopImmediatePropagation();
  }

  /**
   * Handles the color button of the given track.
   * @param track - The track to change the color.
   * @private
   */
  private changeColor(track: TrackOf<any>): void {
    //this._app.pluginsController.selectTrack(track);
    this._view.changeColor(track);
    this._app.editorView.changeWaveFormColor(track);
  }

  /**
   * Solo or unsolo a track.
   * @param track - The track to solo.
   * @param soloValue - Do solo the track else unsolo it.
   */
  private setSolo(track: TrackOf<any>, soloValue: boolean) {
    // When soloed, mute every non-soloed track
    if(soloValue){
      this.tracks.forEach(it=>{
        if(!it.isSolo)it.isSoloMuted=true
      })
      track.isSolo=true
    }
    // When unsoloed, unmute every solo-muted track if there is no more soloed track
    if(!soloValue){
      track.isSolo=false
      let soloedTrack = this.tracks.find(it=>it.isSolo)
      if(!soloedTrack)this.tracks.forEach(it=>it.isSoloMuted=false)
      if(soloedTrack)track.isSoloMuted=true
    }
  }

  // ----- UNDO / REDO methods
  updateUndoButtons() {
    // to disable/enable undo/redo buttons if undo/redo is available
    this._app.hostView.setUndoButtonState(this._app.undoManager.hasUndo());
    this._app.hostView.setRedoButtonState(this._app.undoManager.hasRedo());
  }

  undoTrackColorChange(track: TrackOf<any>, color: string) {
    track.color = color;
    this._view.changeColor(track);
    this._app.editorView.changeWaveFormColor(track);
  }

  undoFx(track: TrackOf<any>, fxStatus: boolean) {
    this._app.pluginsController.fxButtonClicked(track);
  }

  undoSelect(track: TrackOf<any>, trackToSelect: TrackOf<any> | undefined) {
    if (trackToSelect) {
      this._app.pluginsController.selectTrack(trackToSelect);
    }
  }

  async undoTrackRemove(
    oldTrack: SampleTrack,
    element: TrackElement,
    oldTrackWaveform: WaveformView | undefined,
    oldPlugin: Plugin
  ) {
    
    // restore track element with old track element state
    this.createEmptySampleTrack().then((track) => {
        this.addTrack(this.sampleTracks,track);
        let elementState = element.getState();
        track.element.setState(elementState);
        // to show the hidden buttons...
        track.element.progressDone();

        track.color = oldTrack.color;
        // get regionView of track
        let waveformView = this._app.editorView.getWaveformById(track.id);
        if(waveformView) waveformView.color = oldTrack.color;
    
        // restore waveformView with old waveformView state
        
        oldTrack.regions.forEach(region => {
            region.trackId = track.id;
            track.regions.push(region);
            //TODO const regionView = waveformView!.createRegionView(region);
            //TODO this._app.regionsController.bindRegionEvents(region, regionView);
          });

          // restore plugin controller  with old plugin controller state
          // connect oldPlugin to the track and audio graph
          // TODO

          track.plugin = oldPlugin;
          track.plugin.initialized = true;
          // reconnect it to the track
          this._app.pluginsController.connectPedalBoard(track);

          this._app.pluginsController.selectTrack(track);

          track.modified = true;
      });
      
    return;
  }
}
