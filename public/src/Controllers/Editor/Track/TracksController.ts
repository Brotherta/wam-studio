import App, { crashOnDebug } from "../../../App";
import OperableAudioBuffer from "../../../Audio/OperableAudioBuffer";
import WamAudioWorkletNode from "../../../Audio/WAM/WamAudioWorkletNode";
import WamEventDestination from "../../../Audio/WAM/WamEventDestination";
import TrackElement from "../../../Components/TrackElement";
import { RATIO_MILLS_BY_PX } from "../../../Env";
import Plugin from "../../../Models/Plugin";
import WaveformView from "../../../Views/Editor/WaveformView";
import TracksView from "../../../Views/TracksView";
import { audioCtx } from "../../../index";

import WebAudioPeakMeter from "../../../Audio/Utils/PeakMeter";
import { RegionOf } from "../../../Models/Region/Region";
import SampleRegion from "../../../Models/Region/SampleRegion";
import Track from "../../../Models/Track/Track";
import { getRandomColor } from "../../../Utils/Color";
import FriendlyIterable from "../../../Utils/FriendlyIterable";
import { registerOnKeyDown } from "../../../Utils/keys";

/**
 * Class that controls the tracks view. It creates, removes and manages the tracks. It also defines the listeners for the tracks.
 */
export default class TracksController{

  /** Selected track. It is undefined if the host is selected. */
  public selectedTrack?: Track

  /** The app instance. */
  private _app: App;

  /** The ammount of tracks id. The track id counter. */
  public trackIdCount: number;

  /** The tracks view instance. */
  private _view: TracksView;

  /* For undo / redo */
  private _oldVolume: number = 0.5;
  private _oldBalance = 1;

  /** The tracks */
  private readonly track_list: Track[]= []

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
  public addTrack(track: Track): void {
    // Check if already exists
    if(this.track_list.includes(track))crashOnDebug("TracksController - addTrack - Track already exists!")
    
    // Add the track to the list
    this.track_list.push(track)

    // Create its track element (GUI)
    track.plugin = new Plugin(this._app);
    track.id = this.trackIdCount++;
    track.element.trackId = track.id;
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
    this.setColor(track,getRandomColor())
    this.bindTrackEvents(track);
    
    this._app.waveformController.initializeWaveform(track);
    this._app.automationView.initializeAutomation(track.id);

    if(this.tracks.find(it=>it.isSolo))track.isSoloMuted=true
  }

  /**
   * Removes a track from the track view. It also removes the track from the audio controller.
   *
   * @param track - Track to be removed from the track view.
   */
  public removeTrack(track: Track): void {
    // Remove from the lists
    const index=this.track_list.indexOf(track)
    if(index>=0){
      this.track_list.splice(index,1)
      track.close()
      this._app.pluginsController.removePedalBoard(track);
      this._view.removeTrack(track.element);
      this._app.automationView.removeAutomationBpf(track.id);
      this._app.waveformController.removeWaveformOfTrack(track);
    }
    else crashOnDebug("TracksController - removeTrack - Track not found!")
  }

  /**
   * Gets the track with the given id.
   * @param id - The id of the track.
   * @returns the track with the given id if it exists, undefined otherwise.
   */
  public getTrackById(id: number): Track | undefined {
    for(let track of this.track_list){
      if(track.id===id)return track
    }
    return undefined
  }

  /**
   * An iterator for iterating over all tracks of all track lists
   */
  public readonly tracks=new FriendlyIterable(()=>this.track_list[Symbol.iterator]())

  /**
   * Clears all tracks.
   * It removes all tracks from the track list and disconnects the audio nodes.
   */
  public clearAllTracks(): void {
    for (let track of [...this.tracks]) this.removeTrack(track)
    if(this.track_list.length!=0)crashOnDebug("TracksControllers - clearAllTracks - There is remaining tracks!")
    this.track_list.length=0
  }

  /**
   * Creates a new TracksView with the given audio node. Initializes the audio nodes and the canvas.
   *
   * @param node - The audio node of the track.
   * @returns the created track
   * @private
   */
  private createEmptyTrack(): Track {
    let track = new Track(new TrackElement(),audioCtx,this._app.host.hostGroupId)
    this.addTrack(track)
    return track;
  }

  /**
   * Creates a new empty track. It creates the audio node and the track.
   *
   * @param url - The url of the track.
   * @returns the created track
   */
  public async createTrack(url?: string): Promise<Track> {
    let track = this.createEmptyTrack();
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
  public async createTrackWithFile(file: File): Promise<Track | undefined> {
    if (["audio/ogg", "audio/wav", "audio/mpeg", "audio/x-wav"].includes(file.type)) {
      let wamInstance = await WamEventDestination.createInstance(this._app.host.hostGroupId, audioCtx);
      let node = wamInstance.audioNode as WamAudioWorkletNode;

      let audioArrayBuffer = await file.arrayBuffer();
      let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
      let operableAudioBuffer = OperableAudioBuffer.make(audioBuffer);
      operableAudioBuffer = operableAudioBuffer.makeStereo();

      node.setAudio(operableAudioBuffer.toArray());

      let track = this.createEmptyTrack();
      this._app.regionsController.addRegion(track, new SampleRegion(operableAudioBuffer,0))
      track.element.name = file.name;
      return track;
    } else {
      console.warn("File type not supported");
      return undefined;
    }
  }

  public async newTrackFromDeletedTrack(deletedTrack: Track) {
    let wamInstance = await WamEventDestination.createInstance(
      this._app.host.hostGroupId,
      audioCtx
    );
    let node = wamInstance.audioNode as WamAudioWorkletNode;
    let track = this.createEmptyTrack();
    //track.setAudioBuffer(deletedTrack.audioBuffer!);
    track.element = deletedTrack.element;
    track.color = deletedTrack.color;
    track.isMuted = deletedTrack.isMuted;
    track.isSolo = deletedTrack.isSolo;
    track.isSoloMuted = deletedTrack.isSoloMuted;
    /* TODO track.isMerged = deletedTrack.isMerged;
    track.left = deletedTrack.left;
    track.right = deletedTrack.right;
    track.isStereo = deletedTrack.isStereo;*/
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
    this._app.host.playhead = Math.floor(pos * RATIO_MILLS_BY_PX);
  }

  /**
   * Bind the events of the track view.
   * @private
   */
  private bindEvents(): void {
    registerOnKeyDown(e=>{
      //TODO Remove this debug code
      if(e!=="a")return

      console.log(...this.tracks)
      let toptrack=this.tracks.find((v,i)=>i===0)!
      let bottomtrack=this.tracks.find((v,i)=>i===1)!

      let merged: RegionOf<any>|null=null
      for(const m of toptrack?.merged_regions.values())merged=m[0]
      if(!merged)return

      this._app.regionsController.addRegion(bottomtrack,merged.clone())
    })

    this._view.newTrackDiv.addEventListener("click", () => {
      const track=this._app.tracksController.createEmptyTrack()
      track.element.progressDone()
    });
  }

  /**
   * Binds all events of the given track. It defines the listeners for the close, solo, mute, volume and balance sliders etc.
   *
   * @param track - Track to be binded.
   * @private
   */
  private bindTrackEvents(track: Track): void {

    // TRACK SELECT
    track.element.addEventListener("click", () => {
      if(track.deleted)return

      let oldSelectedTrack = this.selectedTrack
      let newSelectedTrack = track

      this._app.doIt(true,
        ()=> this._app.pluginsController.selectTrack(newSelectedTrack),
        ()=> this._app.pluginsController.selectTrack(oldSelectedTrack),
      )
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
      let oldColor = track.color
      let newColor = getRandomColor()

      this._app.doIt(true,
        ()=> this.setColor(track, newColor),
        ()=> this.setColor(track, oldColor),
      )
    })

    // TRACK AUTOMATION
    track.element.automationBtn.addEventListener("click", async (e) => {
      // Open the automation menu when the automation button is clicked.
      this.automationMenu(e, track);
    })
    
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
    /*track.element.modeBtn.addEventListener("click", () => {
      let initialStereo: boolean = track.isStereo
      this._app.doIt(true,
        ()=> track.isStereo = !initialStereo,
        ()=> track.isStereo = initialStereo,
      )
    })

    // TRACK LEFT INPUT
    track.element.leftBtn.addEventListener("click", () => {
      let initialLeft: boolean = track.left
      this._app.doIt(true,
        ()=> track.left = !initialLeft,
        ()=> track.left = initialLeft,
      )
    })

    // TRACK RIGHT INPUT
    track.element.rightBtn.addEventListener("click", () => {
      let initialRight: boolean = track.right
      this._app.doIt(true,
        ()=> track.right = !initialRight,
        ()=> track.right = initialRight,
      )
    })

    // TRACK MERGE LEFT/RIGHT
    track.element.mergeBtn.addEventListener("click", () => {
      let initialMerge: boolean = track.isMerged
      this._app.doIt(true,
        ()=> track.isMerged = !initialMerge,
        ()=> track.isMerged = initialMerge,
      )
    })*/

    // TRACK FX/PLUGINS
    track.element.fxBtn.addEventListener("click", () => {
      this._app.doIt(true,
        ()=> this._app.pluginsController.fxButtonClicked(track),
        ()=> this._app.pluginsController.fxButtonClicked(track),
      )
    });
  }

  /**
   * Handles the automation button of the given track.
   * @param track - The track to open the automation menu.
   * @private
   */
  private async automationMenu(e: Event, track: Track): Promise<void> {
    this._app.pluginsController.selectTrack(track);
    await this._app.automationController.openAutomationMenu(track);
    e.stopImmediatePropagation();
  }

  /**
   * Set the color of the track
   * @param track - The track to change the color.
   * @param string - The new color
   */
  public setColor(track: Track, color: string): void {
    track.color=color
    this._app.editorView.changeWaveFormColor(track);
  }

  /**
   * Solo or unsolo a track.
   * @param track - The track to solo.
   * @param soloValue - Do solo the track else unsolo it.
   */
  private setSolo(track: Track, soloValue: boolean) {
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

  async undoTrackRemove(
    oldTrack: Track,
    element: TrackElement,
    oldTrackWaveform: WaveformView | undefined,
    oldPlugin: Plugin
  ) {
    
    // restore track element with old track element state
    const track=this.createEmptyTrack()
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
      
    return;
  }
}
