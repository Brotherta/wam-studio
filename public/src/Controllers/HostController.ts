import songs from "../../static/songs.json";
import App from "../App";
import WebAudioPeakMeter from "../Audio/Utils/PeakMeter";
import VuMeter from "../Components/VuMeterElement";
import { SONGS_FILE_URL, TEMPO_DELTA, updateTempo } from "../Env";
import DraggableWindow from "../Utils/DraggableWindow";
import HostView from "../Views/HostView";
import { audioCtx } from "../index";

/**
 * Class to control the audio. It contains all the listeners for the audio controls.
 * It also contains the audio context and the list of tracks. It is used to play, pause, record, mute, loop, etc.
 */
export default class HostController {
  /**
   * Vu meter of the master track.
   */
  public vuMeter: VuMeter;

  /**
   * Route application.
   */
  private _app: App;
  /**
   * View of the host.
   */
  private _view: HostView;
  /**
   * List of draggable windows.
   */
  private windows: DraggableWindow[];

  /**
   * Active HTML element when scrolling.
   */
  private active: EventTarget | null;
  /**
   * Boolean to know if the timer interval is paused.
   */
  private _timerIntervalPaused: boolean;
  /**
   * Interval to update the timer.
   */
  private _timerInterval: NodeJS.Timer | undefined;
  /**
   * Interval time to update the vu meter.
   */
  private readonly TIMER_INTERVAL_MS = 1000 / 60; // 60 fps

  constructor(app: App) {
    this._app = app;
    this._view = app.hostView;
    this.windows = [];
    this._timerIntervalPaused = false;

    this._view.host?.append(this._app.host.element)
    this._app.host.element.name="Master Track"
    this._app.tracksController.bindSoundProviderEvents(this._app.host)

    this.initializeDemoSongs();
    this.initializeVuMeter();
    this.bindEvents();
    this.bindNodeListeners();
    this._app.host.metronomeOn = false;  // Metronome is off by default
    console.log("Initial Metronome State: " + (this._app.host.metronomeOn ? "On" : "Off"));
    this._view.updateMetronomeBtn(false);

    this._app.host.onPlayHeadMove.add((playhead) => {
      // TODO Move the metronome to the new playhead position
    })
  }

  /**
   * Handles the play button. It plays or pauses the audio. It also starts the timer interval and handle the recording.
   *
   * @param stop - Boolean to know if the button is a stop button or not when recording.
   */
  public play(inRecordingMode: boolean = false): void {
    const host=this._app.host
    if (!host.isPlaying) {
      // disable zoom buttons when playing (this confuses the player in this version)
      this._view.zoomInBtn.classList.remove("zoom-enabled");
      this._view.zoomOutBtn.classList.remove("zoom-enabled");
      this._view.zoomInBtn.classList.add("zoom-disabled");
      this._view.zoomOutBtn.classList.add("zoom-disabled");
      //console.log("Playing zoom-disabled");

      this._app.automationController.applyAllAutomations();
      if (host.modified){
        host.update(audioCtx, this._app.host.playhead)
        host.modified=false
      }
      host.inRecordingMode = inRecordingMode;
      host.play()
      this.launchTimerInterval();

      // Start the metronome if it's enabled
      if (host.metronomeOn){
        (this._view.MetronomeElement).startMetronome();
      }else{
        (this._view.MetronomeElement).pauseMetronome();
      }

    } else {
      // enable zoom buttons when playing is stopped
      this._view.zoomInBtn.classList.remove("zoom-disabled")
      this._view.zoomOutBtn.classList.remove("zoom-disabled")
      this._view.zoomInBtn.classList.add("zoom-enabled")
      this._view.zoomOutBtn.classList.add("zoom-enabled")
      //console.log("Stopping zoom-enabled");

      this._app.tracksController.tracks.forEach((track) => {
        if (track.plugin && track.plugin.instance) {
          track.plugin.instance?.audioNode?.clearEvents()
        }
      });
      host.inRecordingMode=false
      host.pause()
      if (this._app.host.recording) {
        this._app.recorderController.stopRecordingAllTracks()
        this._view.updateRecordButton(false);
      }
      if (this._timerInterval) clearInterval(this._timerInterval);
      // Always stop the metronome when playback is stopped
      (this._view.MetronomeElement).pauseMetronome()
    }
    this._view.updatePlayButton(host.isPlaying, inRecordingMode)
  }

  /**
   * Handles the back button. It goes back to the beginning of the song.
   */
  public back(): void {
    this._app.host.playhead = 0;
    this._app.automationController.applyAllAutomations();

    // recenter viewport at center of current viewport width
    const pos = this._app.editorView.editorDiv.clientWidth / 2;
    //console.log("width = " + this._app.editorView.editorDiv.clientWidth);
    this._app.editorView.viewport.moveCenter(
      pos,
      this._app.editorView.viewport.center.y
    );
    // need to reposition the custom scrollbar too...
    // adjust horizontal scrollbar
    this._app.editorView.horizontalScrollbar.moveToBeginning();
  }

  /**
   * Handles the mute button. It mutes or unmutes the audio.
   */
  public mute(): void {
    this._app.host.isMuted=true
  }
  

  public toggleMetronome(): void {
    const metronomeOn = !this._app.host.metronomeOn;
    console.log("Metronome Toggled: " + (metronomeOn ? "On" : "Off"));
    this._app.host.metronomeOn = metronomeOn;

    // Log the state change
    console.log(`Metronome ${metronomeOn ? "started" : "stopped"}`);

    // Start or stop the metronome based on both metronome state and whether playback is active
    if (metronomeOn && this._app.host.isPlaying) {
      (this._view.MetronomeElement).startMetronome();
    }else{
      (this._view.MetronomeElement).pauseMetronome();
    }

    // Update the icon to reflect the new state.
    this._view.updateMetronomeBtn(metronomeOn);
}


  public snapOnOff(): void {
    const snapping = !this._app.editorView.snapping;
    this._app.editorView.snapping = snapping;

    this._view.updateSnapButton(snapping);
  }

   /** Handles the loop button. It loops the song or not. */
  public loop(): void {
    const looping = !this._app.host.loopRange
    this._view.updateLoopButton(looping)
    this._app.editorView.loop.updateActive(looping)
    if(looping)this._app.host.setLoop(this._loopRange)
    else this._app.host.setLoop(null)
  }

  /**
   * Updates the loop value of the host. It is called when the user changes the loop value.
   *
   * @param range - Time of the left and right of the loop in milliseconds.
   */
  public setLoop(range: [number,number]): void {
    this._loopRange=range
    if(this._app.host.loopRange)this._app.host.setLoop(range)
  }
  private _loopRange: [number,number] = [0,0]
  get loopRange(): [number,number]{ return this._loopRange }

  /**
   * Handles the import of files by the browser. It creates a new track for each file.
   *
   * @param e - Input event of the file input.
   */
  public importFilesSongs(e: InputEvent): void {
    const target = e.target as HTMLInputElement;

    if (target.files) {
      for (let i = 0; i < target.files.length; i++) {
        let file = target.files[i];
        if (file !== undefined) {
          this._app.tracksController.createTrackWithFile(file).then((track) => {
          });
        }
      }
    }
  }

  /**
   * Binds the events of the host node.
   */
  public bindNodeListeners(): void {
    /*if (this._app.host.hostNode) {
      const prev=this._app.host.hostNode.port.onmessage
      this._app.host.hostNode.port.onmessage = (ev) => {
        if (ev.data.volume >= 0) {
          let vol = ev.data.volume;
          let sensitivity = 2.3;
        }
      };
    } else {
      console.warn("Host node not initialized.");
    }*/
  }

  /**
   * Pauses the timer interval. Used when the user is jumping to a specific beat.
   */
  public pauseTimerInterval(): void {
    this._timerIntervalPaused = true;
  }

  /**
   * Resumes the timer interval. Used when the user is jumping to a specific beat.
   */
  public resumeTimerInterval(): void {
    this._timerIntervalPaused = false;
  }

  /**
   * Stops all the tracks.
   */
  public stopAllTracks(): void {
    this._app.host.pause()
  }

  /**
   * Adds draggable windows to the host.
   * @param windows - Windows to add.
   */
  public addDraggableWindow(...window: DraggableWindow[]): void {
    this.windows.push(...window);
    this.windows.forEach((win) => {
      win.resizableWindow.addEventListener("mousedown", () => {
        this.focus(win);
      });
    });
  }

  /**
   * Focus the window passed in parameter.
   * @param window - Window to focus.
   */
  public focus(window: DraggableWindow): void {
    for (const win of this.windows) {
      win.resizableWindow.style.zIndex =
        win.resizableWindow === window.resizableWindow ? "100" : "99";
    }
  }

  /**
   * Binds the events of the host.
   * @private
   */
  private bindEvents(): void {
    // detect global click on the document and resume the audio context if necessary
    document.addEventListener("click", () => {
      if (audioCtx.state === "suspended") {
        console.log("RESUMING AUDIO CONTEXT");
        audioCtx.resume();
      }
    });
    // TOP BAR CONTROLS
    this._view.playBtn.addEventListener("click", () => {
      this.play();
    });
    this._view.backBtn.addEventListener("click", () => {
      this.back();
    });
    this._view.recordBtn.addEventListener("click", () => {
      this._app.recorderController.record();
    });
    this._view.loopBtn.addEventListener("click", () => {
      this.loop();
    });
    this._view.muteBtn.addEventListener("click", () => {
      this.mute();
    });
    this._view.metroBtn.addEventListener("click", () => {
      this.toggleMetronome();
    });
    this._view.snapBtn.addEventListener("click", () => {
      this.snapOnOff();
    });

    this._view.splitBtn.addEventListener("click", () => {
      this._app.regionsController.splitSelectedRegion();
    });

    this._view.mergeBtn.addEventListener("click", () => {
      this._app.regionsController.mergeSelectedRegion();
    });

    // undo/redo
    // with cdm/ctl-z or cmd-ctrl-shift-z
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      // MB: not sure that this is the proper way do handle
      // keyboard shortcuts for copy/cut/paste
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            this._app.undoManager.undo();
            break;
          case "Z":
            this._app.undoManager.redo();
            break;
        }
        this._app.hostView.setUndoButtonState(this._app.undoManager.hasUndo());
        this._app.hostView.setRedoButtonState(this._app.undoManager.hasRedo());
      }
    });

    // with clicks on undo/redo buttons
    this._view.undoBtn.addEventListener("click", () => {
      this._app.undoManager.undo();
      this._app.hostView.setUndoButtonState(this._app.undoManager.hasUndo());
      this._app.hostView.setRedoButtonState(this._app.undoManager.hasRedo());
    });
    this._view.redoBtn.addEventListener("click", () => {
      this._app.undoManager.redo();

      this._app.hostView.setUndoButtonState(this._app.undoManager.hasUndo());
      this._app.hostView.setRedoButtonState(this._app.undoManager.hasRedo());
    });

    // ZOOM BUTTONS
    this._view.zoomInBtn.addEventListener("click", async () => {
      this._app.editorController.zoomIn();
    });
    this._view.zoomOutBtn.addEventListener("click", async () => {
      this._app.editorController.zoomOut();
    });

    // Tempo and Time Signature selectors
    this._view.timeSignatureSelector.on_change.add(([numerator,denominator])=>{
      this._app.editorView.grid.updateTimeSignature(numerator,denominator)
    })

    this._view.tempoSelector.on_change.add((newTempo)=>{
      if(newTempo < 5 || newTempo > 600){
        this._view.tempoSelector.tempo=Math.max(5,Math.min(600,newTempo))
        return
      }
      updateTempo(newTempo)
      this._app.playheadController.moveTo(this._app.host.playhead,false)

      // redraw all tracks according to new tempo
      this._app.tracksController.tracks.forEach((track) => {
        // redraw all regions taking into account the new tempo
        // RATIO_MILLS_BY_PX has been updated by updateTemponew(Tempo)
        // for all track regions, update their start properties
        for (const region of track.regions) {
          // TEMPO_DELTA (that represents the ration newTempo/oldTempo) has been updated
          // region pos should not change when the tempo changes
          // a region that starts at 2000ms at 120bpm, when tempo changes to 60bpm
          // should now start at 2000/TEMPO_DELTA, in other words 2000/0.5 = 4000ms
          region.start=region.start / TEMPO_DELTA
        }

        track.modified=true

        this._app.editorView.drawRegions(track);
      });
    })

    // MENU BUTTONS
    this._view.exportProject.addEventListener("click", () => {
      this._app.projectController.openExportWindow();
      this.focus(this._app.projectView);
    });
    this._view.saveBtn.addEventListener("click", () => {
      this._app.projectController.openSaveWindow();
      this.focus(this._app.projectView);
    });
    this._view.loadBtn.addEventListener("click", () => {
      this._app.projectController.openLoadWindow();
      this.focus(this._app.projectView);
    });
    this._view.loginBtn.addEventListener("click", () => {
      this._app.projectController.openLoginWindow();
      this.focus(this._app.projectView);
    });
    this._view.settingsBtn.addEventListener("click", () => {
      this._app.settingsController.openSettings();
      this.focus(this._app.settingsView);
    });

    this._view.aboutBtn.addEventListener("click", () => {
      this._view.aboutWindow.hidden = false;
      this.focus(this._app.aboutView);
    });
    this._view.aboutCloseBtn.addEventListener("click", () => {
      this._view.aboutWindow.hidden = true;
    });

    this._view.keyboardShortcutsBtn.addEventListener("click", () => {
      this._view.keyboardShortcutsWindow.hidden = false;
      this.focus(this._app.keyboardShortcutsView);
    });
    this._view.keyboardShortcutsCloseBtn.addEventListener("click", () => {
      this._view.keyboardShortcutsWindow.hidden = true;
    });

    this._view.latencyBtn.addEventListener("click", () => {
      this._app.latencyView.openWindow();
      this.focus(this._app.latencyView);
    });
    this._view.importSongs.addEventListener("click", () => {
      this._view.newTrackInput.click();
    });
    this._view.newTrackInput.addEventListener("change", (e) => {
      this.importFilesSongs(e as InputEvent);
    });

    // SCROLL SYNC
    const trackDiv = this._app.tracksView.trackContainerDiv;
    const automationDiv = this._app.automationView.automationContainer;
    trackDiv.addEventListener("mouseenter", (e: Event) => {
      this.active = e.target;
    });
    automationDiv.addEventListener("mouseenter", (e: Event) => {
      this.active = e.target;
    });

    trackDiv.addEventListener("scroll", (e: Event) => {
      if (e.target !== this.active) return;
      automationDiv.scrollTop = trackDiv.scrollTop;
      this._app.editorView.verticalScrollbar.customScrollTop(
        trackDiv.scrollTop
      );
    });
    automationDiv.addEventListener("scroll", (e: Event) => {
      if (e.target !== this.active) return;
      trackDiv.scrollTop = automationDiv.scrollTop;
    });
  }

  /**
   * Initializes the demo songs. It creates a new song item for each demo song present in the json file.
   * @private
   */
  private initializeDemoSongs(): void {
    songs.forEach((song) => {
      let name = song.name;
      let el = this._view.createNewSongItem(name);
      el.onclick = async () => {
        this._app.tracksController.clearTracks();
        for (let trackSong of song.songs) {
          const url = SONGS_FILE_URL + trackSong;
          let track = await this._app.tracksController.createTrack(url);
          this._app.loader.loadTrackUrl(track,url);
        }
      };
    });
  }

  /**
   * Initializes the timer interval. It updates the timer and the playhead position.
   * @private
   */
  private launchTimerInterval(): void {
    let lastPos = this._app.host.playhead;
    this._timerInterval = setInterval(() => {
      let newPos = this._app.host.playhead;
      if (lastPos !== newPos) {
        lastPos = newPos;
        if (!this._timerIntervalPaused) {
          this._view.updateTimer(newPos);
        }
      }
    }, this.TIMER_INTERVAL_MS);
  }

  /**
   * Initializes the vu meter. It creates a new vu meter for the master track.
   * @private
   */
  private initializeVuMeter(): void {
    let peakMeter = new WebAudioPeakMeter(
      audioCtx,
      this._app.host.outputNode,
      this._app.host.element.getPeakMeterParentElement(),
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
    // MB replaced by another vu-meter
    //this.vuMeter = new VuMeter(this._view.vuMeterCanvas, 30, 157);

    // create vu-meter. Wait until parent is visible.

  }
}
