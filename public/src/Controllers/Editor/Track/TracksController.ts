import App, { crashOnDebug } from "../../../App";
import OperableAudioBuffer from "../../../Audio/OperableAudioBuffer";
import TrackElement from "../../../Components/Editor/TrackElement";
import { RATIO_MILLS_BY_PX } from "../../../Env";
import Plugin from "../../../Models/Plugin";
import WaveformView from "../../../Views/Editor/WaveformView";
import TracksView from "../../../Views/TracksView";
import { audioCtx } from "../../../index";

import WebAudioPeakMeter from "../../../Audio/Utils/PeakMeter";
import { RegionOf } from "../../../Models/Region/Region";
import SampleRegion from "../../../Models/Region/SampleRegion";
import SoundProvider from "../../../Models/Track/SoundProvider";
import Track from "../../../Models/Track/Track";
import { getRandomColor } from "../../../Utils/Color";
import { registerOnKeyDown } from "../../../Utils/keys";
import { ObservableArray, ReadOnlyObservableArray } from "../../../Utils/observable/observables";
import RecorderController, { CRecorderFactory } from "../../Recording/RecorderController";
import RegionRecorderManager from "../../Recording/Recorders/RegionRecorderManager";

/**
 * Class that controls the tracks view. It creates, removes and manages the tracks. It also defines the listeners for the tracks.
 */
export default class TracksController{

  /** The app instance. */
  private _app: App;

  /** The ammount of tracks id. The track id counter. */
  public trackIdCount: number;

  /** The tracks view instance. */
  private _view: TracksView;

  /* For undo / redo */
  private _oldVolume: number = 0.5;
  private _oldBalance = 1;

  private readonly track_list= new ObservableArray<Track>()

  /** The currents tracks ordered by their position in the editor */
  public get tracks(): ReadOnlyObservableArray<Track> { return this.track_list}


  constructor(app: App) {
    this._app = app
    this._view = app.tracksView
    this.trackIdCount = 1
    this.bindEvents()
  }


  
  /** -~- Selection -~- */
  private _selectedSoundProvider: SoundProvider|null = null
  readonly afterSelectedChange=new Set<(preivous:SoundProvider|null, selected: SoundProvider|null)=>void>()

  /** Select an SoundProvider (A track or the host) */
  public select(soundProvider: SoundProvider|null){
    if(this._selectedSoundProvider===soundProvider)return
    if(this._selectedSoundProvider){
      this._selectedSoundProvider.element.unSelect()
    }
    
    if(soundProvider){
      soundProvider.element.select()
    }
    this._selectedSoundProvider=soundProvider
    this.afterSelectedChange.forEach(it=>it(this._selectedSoundProvider,soundProvider))
  }

  /** Get the selected SoundProvider */
  public get selected(){ return this._selectedSoundProvider }

  /** Get the selected SoundProvider if it is a track. */
  public get selectedTrack(){ return this._selectedSoundProvider instanceof Track ? this._selectedSoundProvider : null }


  
  /**
   * Add a track and Initializes its view.
   * It also initializes the waveforms and the automations.
   *
   * @param track - The track to be initialized.
   */
  public async addTrack(track: Track) {
    // Check if already exists
    if(this.track_list.includes(track))crashOnDebug("TracksController - addTrack - Track already exists!")
    
    await track.init()

    // Add the track to the list
    this.track_list.push(track)

    // Create its track element (GUI)
    track.id = this.trackIdCount++;
    track.element.trackId = track.id;
    this._view.addTrack(track.element);
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
    track.recorders=new RegionRecorderManager({app:this._app,track})
    track.recorders.connect(track.audioInputNode)
    this.bindTrackEvents(track);
    this.setColor(track,getRandomColor())
    
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
      this._app.pluginsController.connectPlugin(track,null);
      this._view.removeTrack(track.element);
      this._app.automationView.removeAutomationBpf(track.id);
      this._app.waveformController.removeWaveformOfTrack(track);
      track.dispose()
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
   * Clears all tracks.
   * It removes all tracks from the track list and disconnects the audio nodes.
   */
  public clearTracks(): void {
    for (let track of [...this.tracks]) this.removeTrack(track)
    if(this.track_list.length!=0)crashOnDebug("TracksControllers - clearAllTracks - There is remaining tracks!")
    this.track_list.length=0
    this.trackIdCount=1
  }

  /**
   * Creates a new TracksView with the given audio node. Initializes the audio nodes and the canvas.
   *
   * @param node - The audio node of the track.
   * @returns the created track
   * @private
   */
  private async createEmptyTrack(): Promise<Track> {
    let track = new Track(new TrackElement(),audioCtx,this._app.host.hostGroupId)
    track.element.name=`Track ${this.trackNameCounter++}`
    await this.addTrack(track)
    return track;
  }

  private trackNameCounter=1

  /**
   * Creates a new empty track and add it to the track view.
   * @param url - The url of the track.
   * @returns the created track
   */
  public async createTrack(url?: string): Promise<Track> {
    let track = await this.createEmptyTrack();
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
      // Create the track
      let track = await this.createEmptyTrack();
      track.element.name = file.name;
      track.element.progress(0,1)

      // Load the file
      let audioArrayBuffer = await file.arrayBuffer();
      let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
      let operableAudioBuffer = OperableAudioBuffer.make(audioBuffer);
      operableAudioBuffer = operableAudioBuffer.makeStereo();
      this._app.regionsController.addRegion(track, new SampleRegion(operableAudioBuffer,0))

      // Finish the progress
      track.element.progressDone();
      return track;
    } else {
      console.warn("File type not supported");
      return undefined;
    }
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
      if(e=="p"){
        (async ()=>{
          console.log("Playing",this.selectedTrack)
          if(!this.selectedTrack)return
          let graph= await this.selectedTrack.track_graph.instantiate(audioCtx, this._app.host.groupId)
          graph.connect(audioCtx.destination)
          graph.playhead=0
          graph.isPlaying=true
          setTimeout(()=>{
            graph.isPlaying=false
            graph.dispose()
          },5000)
        })()
      }
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
    });
  }

  /**
   * Binds all events of the given sound provider. It defines the listeners for the close, solo, mute, volume and balance sliders etc.
   *
   * @param track - Track to be binded.
   * @private
   */
  bindSoundProviderEvents(track: SoundProvider): void {

    // TRACK SELECT
    track.element.addEventListener("click", () => {
      let oldSelectedTrack = this.selectedTrack
      let newSelectedTrack = track
      this._app.doIt(true,
        ()=> this.select(newSelectedTrack),
        ()=> this.select(oldSelectedTrack),
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
      const newVolume = track.element.volume / 100
      track.volume=newVolume;
    });
    track.element.volumeSlider.addEventListener("mousedown", (evt) => {
      this._oldVolume = track.volume;
    });
    track.element.volumeSlider.addEventListener("change", (evt) => {
      const newVolume = track.element.volume / 100
      let oldV = this._oldVolume;
      this._app.doIt(true,
        ()=> track.volume = newVolume,
        ()=> track.volume = oldV,
      );
    });

    // TRACK BALANCE
    track.element.balanceSlider.addEventListener("input", () => {
      track.balance= track.element.balance
    });
    track.element.balanceSlider.addEventListener("mousedown", (evt) => {
      this._oldBalance = track.balance;
    });
    track.element.balanceSlider.addEventListener("change", (evt) => {
      const newBalance = track.element.balance;
      let oldB = this._oldBalance;
      this._app.doIt(true,
        ()=> track.balance = newBalance,
        ()=> track.balance = oldB,
      );
    });

    // TRACK FX/PLUGINS
    track.element.fxBtn.addEventListener("click", () => {
      this._app.doIt(true,
        ()=> this._app.pluginsController.fxButtonClicked(track),
        ()=> this._app.pluginsController.fxButtonClicked(track),
      )
    });
  }

  /**
   * Binds all events of the given track. It defines the listeners for the close, solo, mute, volume and balance sliders etc.
   *
   * @param track - Track to be binded.
   * @private
   */
  bindTrackEvents(track: Track): void {

    this.bindSoundProviderEvents(track)

    // REMOVE TRACK
    track.element.closeBtn.addEventListener("click", () => {
      let oldTrack = track;
      let oldWaveform = this._app.editorView.getWaveformById(oldTrack.id);
      let oldTrackElement = track.element;
      let oldPlugin = track.plugin;

      // Remove the track when the close button is clicked.
      this.removeTrack(track);
    });

    // TRACK AUTOMATION
    track.element.automationBtn.addEventListener("click", async (e) => {
      // Open the automation menu when the automation button is clicked.
      this.automationMenu(e, track);
    })

    // SOLO TRACK
    track.element.soloBtn.addEventListener("click", () => {
      let initialSolo = track.isSolo;
      this._app.doIt(true,
        ()=> this.setSolo(track, !initialSolo),
        ()=> this.setSolo(track, initialSolo),
      )
    });

    // TRACK COLOR
    track.element.colorLine.addEventListener("click", () => {
      let oldColor = track.color
      let newColor = getRandomColor()

      this._app.doIt(true,
        ()=> this.setColor(track, newColor),
        ()=> this.setColor(track, oldColor),
      )
    })

    // TRACK MONITOR
    track.element.monitoringBtn.addEventListener("click", () => {
      const oldValue=track.monitored
      this._app.doIt(true,
        ()=> track.monitored=!oldValue,
        ()=> track.monitored=oldValue,
      );
    })
    
    // TRACK 
    const that=this
    /** HELPER METHOD TO REGISTER ARM BUTTON */
    function linkArmButton(recorder: CRecorderFactory<any>, button: Element, setter: (track:TrackElement,value:boolean)=>void){
      track.recorders.get(recorder)
      button.addEventListener("click", () => {
        const initialArm= that._app.recorderController.isArmed(track, recorder)
        that._app.doIt(true,
          ()=> {
            that._app.recorderController.toggleArm(track, recorder, !initialArm)
            setter(track.element,!initialArm)
          },
          ()=> {
            that._app.recorderController.toggleArm(track, recorder, initialArm)
            setter(track.element,initialArm)
          }
        );
      })
    }

    linkArmButton(RecorderController.SAMPLE_RECORDER, track.element.armBtn, (t,v)=>t.isSampleArmed=v)
    linkArmButton(RecorderController.MIDI_RECORDER, track.element.midiBtn, (t,v)=>t.isMidiArmed=v)

    /*const {SAMPLE_RECORDER} = RecorderController
    this._app.recorderController.getRecorder(track, SAMPLE_RECORDER)
    track.element.armBtn.addEventListener("click", () => {
      const initialArm= this._app.recorderController.isArmed(track, SAMPLE_RECORDER)
      this._app.doIt(true,
        ()=> {
          this._app.recorderController.toggleArm(track, SAMPLE_RECORDER, !initialArm)
          track.element.isSampleArmed=!initialArm
        },
        ()=> {
          this._app.recorderController.toggleArm(track, SAMPLE_RECORDER, initialArm)
          track.element.isSampleArmed=initialArm
        }
      );
    })*/

    // TRACK MODE STEREO or (MONO to STEREO)
    const {SAMPLE_RECORDER}=RecorderController
    track.element.modeBtn.addEventListener("click", async () => {
      const recorder= await track.recorders.get(SAMPLE_RECORDER)
      let initialStereo= recorder.isStereo
      this._app.doIt(true,
        ()=> recorder.isStereo = !initialStereo,
        ()=> recorder.isStereo = initialStereo,
      )
    })

    // TRACK LEFT INPUT
    track.element.leftBtn.addEventListener("click", async () => {
      const recorder= await track.recorders.get(SAMPLE_RECORDER)
      let initialLeft= recorder.left
      this._app.doIt(true,
        ()=> recorder.left = !initialLeft,
        ()=> recorder.left = initialLeft,
      )
    })

    // TRACK RIGHT INPUT
    track.element.rightBtn.addEventListener("click", async () => {
      const recorder= await track.recorders.get(SAMPLE_RECORDER)
      let initialRight= recorder.right
      this._app.doIt(true,
        ()=> recorder.right = !initialRight,
        ()=> recorder.right = initialRight,
      )
    })

    // TRACK MERGE LEFT/RIGHT
    track.element.mergeBtn.addEventListener("click", async () => {
      const recorder= await track.recorders.get(SAMPLE_RECORDER)
      let initialMerge= recorder.isMerged
      this._app.doIt(true,
        ()=> recorder.isMerged = !initialMerge,
        ()=> recorder.isMerged = initialMerge,
      )
    })

  }

  /**
   * Handles the automation button of the given track.
   * @param track - The track to open the automation menu.
   * @private
   */
  private async automationMenu(e: Event, track: Track): Promise<void> {
    this.select(track);
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

  async undoTrackRemove(
    oldTrack: Track,
    element: TrackElement,
    oldTrackWaveform: WaveformView | undefined,
    oldPlugin: Plugin
  ) {/*
    
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
      
    return;*/
  }
}
