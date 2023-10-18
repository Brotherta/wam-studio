import HostView from "../Views/HostView";
import App from "../App";
import songs from "../../static/songs.json";
import { audioCtx } from "../index";
import { updateTempo, TEMPO_DELTA, SONGS_FILE_URL } from "../Env";
import VuMeter from "../Components/VuMeterElement";
import DraggableWindow from "../Utils/DraggableWindow";
import WebAudioPeakMeter from "../Audio/Utils/PeakMeter";
import PlayheadView from "../Views/Editor/PlayheadView";

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

    this.initializeDemoSongs();
    this.initializeVuMeter();
    this.bindEvents();
    this.bindNodeListeners();
  }

  /**
   * Handles the play button. It plays or pauses the audio. It also starts the timer interval and handle the recording.
   *
   * @param stop - Boolean to know if the button is a stop button or not when recording.
   */
  public play(stop: boolean = false): void {
    const playing = !this._app.host.playing;
    this._app.host.playing = playing;
    console.log("Playing: " + playing);
    if (playing) {
      // disable zoom buttons when playing (this confuses the player in this version)
      this._view.zoomInBtn.classList.remove("zoom-enabled");
      this._view.zoomOutBtn.classList.remove("zoom-enabled");
      this._view.zoomInBtn.classList.add("zoom-disabled");
      this._view.zoomOutBtn.classList.add("zoom-disabled");
      //console.log("Playing zoom-disabled");

      this._app.automationController.applyAllAutomations();
      this._app.tracksController.trackList.forEach((track) => {
        if (track.modified)
          track.updateBuffer(audioCtx, this._app.host.playhead);
        track.node?.play();
      });
      this._app.host.hostNode?.play();
      this.launchTimerInterval();
    } else {
      // enable zoom buttons when playing is stopped
      this._view.zoomInBtn.classList.remove("zoom-disabled");
      this._view.zoomOutBtn.classList.remove("zoom-disabled");
      this._view.zoomInBtn.classList.add("zoom-enabled");
      this._view.zoomOutBtn.classList.add("zoom-enabled");
      //console.log("Stopping zoom-enabled");

      this._app.tracksController.trackList.forEach((track) => {
        if (track.plugin.initialized) {
          track.plugin.instance!._audioNode.clearEvents();
        }
        track.node?.pause();
      });
      if (this._app.host.recording) {
        this._app.recorderController.stopRecordingAllTracks();
        this._view.updateRecordButton(false);
      }
      this._app.host.hostNode?.pause();
      if (this._timerInterval) clearInterval(this._timerInterval);
    }
    this._view.updatePlayButton(playing, stop);
  }

  /**
   * Handles the back button. It goes back to the beginning of the song.
   */
  public back(): void {
    this._app.editorView.playhead.moveToFromPlayhead(0);
    this._app.tracksController.jumpTo(0);
    this._app.automationController.applyAllAutomations();

    // recenter viewport at center of current viewport width
    // MB FIX
    const pos = this._app.editorView.editorDiv.clientWidth/2 ;
    console.log("width = " + this._app.editorView.editorDiv.clientWidth)
    this._app.editorView.viewport.moveCenter(pos, 
        this._app.editorView.viewport.center.y);
        // need to reposition the custom scrollbar too...
        // adjust horizontal scrollbar
        this._app.editorView.horizontalScrollbar.moveToBeginning();
  }

  /**
   * Handles the loop button. It loops the song or not.
   */
  public loop(): void {
    const looping = !this._app.host.looping;
    this._app.host.looping = looping;
    this._app.tracksController.trackList.forEach((track) => {
      track.node?.loop(looping);
    });
    this._app.host.hostNode?.loop(looping);
    this._view.updateLoopButton(looping);
    this._app.editorView.loop.updateActive(looping);
  }

  /**
   * Handles the mute button. It mutes or unmutes the audio.
   */
  public mute(): void {
    const muted = !this._app.host.muted;
    this._app.host.muted = muted;
    if (muted) this._app.host.mute();
    else this._app.host.unmute();
    this._view.updateMuteButton(muted);
  }

  /**
   * Handles the volume slider. It updates the volume of the master track.
   */
  public updateVolume(): void {
    let value = parseInt(this._view.volumeSlider.value) / 100;
    this._app.host.setVolume(value);
  }

  /**
   * Updates the loop value of the host. It is called when the user changes the loop value.
   *
   * @param leftTime - Time of the left loop in milliseconds.
   * @param rightTime - Time of the right loop in milliseconds.
   */
  public updateLoopValue(leftTime: number, rightTime: number): void {
    this._app.host.updateLoopTime(leftTime, rightTime);
    this._app.tracksController.trackList.forEach((track) => {
      track.updateLoopTime(leftTime, rightTime);
    });
  }

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
          this._app.tracksController.newTrackWithFile(file).then((track) => {
            if (track !== undefined) {
              this._app.tracksController.initializeTrack(track);
              track.element.progressDone();
            }
          });
        }
      }
    }
  }

  /**
   * Binds the events of the host node.
   */
  public bindNodeListeners(): void {
    if (this._app.host.hostNode) {
      this._app.host.hostNode.port.onmessage = (ev) => {
        // MB !
        //if(!ev.data.volume) return;

        if (ev.data.playhead) {
          this._app.host.playhead = ev.data.playhead;
        } else if (ev.data.volume >= 0) {
          let vol = ev.data.volume;
          let sensitivity = 2.3;
          // MB replaced by another vu-meter
          //this.vuMeter.update(Math.abs(vol) * sensitivity);
        }
      };
    } else {
      console.warn("Host node not initialized.");
    }
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
  public resumeTimerInteravel(): void {
    this._timerIntervalPaused = false;
  }

  /**
   * Stops all the tracks.
   */
  public stopAllTracks(): void {
    this._app.tracksController.trackList.forEach(async (track) => {
      track.node?.pause();
    });
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
    this._view.volumeSlider.addEventListener("input", (e: Event) => {
      this.updateVolume();
    });
    this._view.muteBtn.addEventListener("click", () => {
      this.mute();
    });
    this._view.zoomInBtn.addEventListener("click", async () => {
      let playhead = this._app.host.playhead;
      console.log("zoomInBtn.addEventListener !!!!!!!");
      console.log("beginning of zoomInBtn.addEventListener playhead=" + playhead + 
      " pos="  + this._app.editorView.playhead.position.x + " ms=" + (playhead / audioCtx.sampleRate) * 1000);
      console.log("---");

      this._app.editorController.zoomIn();
    });
    this._view.zoomOutBtn.addEventListener("click", async () => {
      this._app.editorController.zoomOut();
    });

    // Tempo and Time Signature selectors
    this._view.timeSignatureSelector.addEventListener("timeSignatureChanged", (event: any) => {
      console.log("time signature changed to " + event.detail.signature);
      console.log("nbStepsPerBar=" + event.detail.nbStepsPerBar);
      console.log("nbStepsPerBeat=" + event.detail.nbStepsPerBeat);
      // update grid
      this._app.editorView.grid.updateTimeSignature(event.detail.nbStepsPerBar, event.detail.nbStepsPerBeat);
    });

    this._view.tempoSelector.addEventListener("tempoChanged", (event: any) => {
      // sent by the tempoSelector Web Component (custom event has its data in event.detail)
      const newTempo = event.detail.tempo;

      if(newTempo < 5 || newTempo > 600) return;

      updateTempo(newTempo);

      // should update length of waveforms, time display, playhead speed, not the grid...
      // update timer using playhead pos in pixels
      this._view.updateTimerByPixelsPos(this._app.editorView.playhead.position.x);

      // update playhead value (in samples) and post to all track nodes
      //console.log("Tempo changed : playhead before = " + this._app.host.playhead + " pos = " + this._app.editorView.playhead.position.x + " in ms : " + (this._app.host.playhead*1000)/audioCtx.sampleRate);
      // jumps to new playhead value
      this._app.tracksController.jumpTo(this._app.editorView.playhead.position.x);

      // update position of playhead in editorView
      this._app.editorView.playhead.moveToFromPlayhead(this._app.host.playhead);
      //console.log("Tempo changed : playhead AFTER= " + this._app.host.playhead + " pos = " + this._app.editorView.playhead.position.x  + " in ms : " + (this._app.host.playhead*1000)/audioCtx.sampleRate);

      // redraw all tracks according to new tempo
      this._app.tracksController.trackList.forEach((track) => {
        // redraw all regions taking into account the new tempo
        // RATIO_MILLS_BY_PX has been updated by updateTemponew(Tempo)
        
        // for all track regions, update their start properties
        for (const region of track.regions) {
          // TEMPO_DELTA (that represents the ration newTempo/oldTempo) has been updated
          // region pos should not change when the tempo changes
          // a region that starts at 2000ms at 120bpm, when tempo changes to 60bpm
          // should now start at 2000/TEMPO_DELTA, in other words 2000/0.5 = 4000ms
          region.updateStart(region.start / TEMPO_DELTA);
        }

        // MB : is this necessary ? Apparently yes as start of regions changed.
        // TODO : check if this is really necessary.
        track.updateBuffer(audioCtx, this._app.host.playhead);

        this._app.editorView.drawRegions(track);
      });
    });

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
        this._app.tracksController.clearAllTracks();
        for (let trackSong of song.songs) {
          const url = SONGS_FILE_URL + trackSong;
          let track = await this._app.tracksController.newEmptyTrack(url);
          track.url = url;
          this._app.tracksController.initializeTrack(track);
        }
        for (let track of this._app.tracksController.trackList) {
          this._app.loader.loadTrackUrl(track);
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
          this._app.editorView.playhead.moveToFromPlayhead(newPos);
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
    // MB replaced by another vu-meter
    //this.vuMeter = new VuMeter(this._view.vuMeterCanvas, 30, 157);

    // create vu-meter. Wait until parent is visible.
    let id = setInterval(() => {
      if (this._view.vuMeterDiv.isConnected) {
        let peakMeter = new WebAudioPeakMeter(
          audioCtx,
          this._app.host.gainNode, // MB: Check, here we should use the node at the end of the chain i.e main output
          this._view.vuMeterDiv,
          {
            borderSize: 2,
            fontSize: 7, // tick fontSize. If zero -> no ticks, no labels etc.
            backgroundColor: "black",
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
  }
}
