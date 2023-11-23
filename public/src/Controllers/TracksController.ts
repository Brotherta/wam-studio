import Track from "../Models/Track";
import TracksView from "../Views/TracksView";
import WaveformView from "../Views/Editor/WaveformView";
import App from "../App";
import { audioCtx } from "../index";
import WamEventDestination from "../Audio/WAM/WamEventDestination";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import TrackElement from "../Components/TrackElement";
import Plugin from "../Models/Plugin";
import { BACKEND_URL, RATIO_MILLS_BY_PX } from "../Env";

import WebAudioPeakMeter from "../Audio/Utils/PeakMeter";

/**
 * Class that controls the tracks view. It creates, removes and manages the tracks. It also defines the listeners for the tracks.
 */
export default class TracksController {
  /**
   * The app instance.
   */
  private _app: App;
  /**
   * The tracks view instance.
   */
  private _view: TracksView;

  /**
   * The account of tracks' id.
   */
  public trackIdCount: number;
  /**
   * The list of tracks.
   */
  public trackList: Track[];

  /* For undo / redo */
  private _oldVolume: number = 0.5;
  private _oldBalance = 1;

  constructor(app: App) {
    this._app = app;
    this._view = app.tracksView;
    this.trackIdCount = 1;
    this.trackList = [];

    this.bindEvents();
  }

  /**
   * Initializes the track view with the given track.
   * It also initializes the waveforms and the automations.
   *
   * @param track - The track to be initialized.
   */
  public initializeTrack(track: Track): void {
    this._view.addTrack(track.element);
    this._view.changeColor(track);
    this.bindTrackEvents(track);
    this._app.recorderController.clickMode(track);

    this._app.automationView.initializeAutomation(track.id);
    this._app.waveformController.initializeWaveform(track);
  }

  /**
   * Removes a track from the track view. It also removes the track from the audio controller.
   *
   * @param track - Track to be removed from the track view.
   */
  public removeTrack(track: Track): void {
    track.deleted = true; // Used to stop the track to be loaded on xhr request
    this._app.pluginsController.removePedalBoard(track);
    this._view.removeTrack(track.element);
    this._app.tracksController.deleteTrack(track);
    this._app.waveformController.removeWaveformOfTrack(track);
    this._app.automationView.removeAutomationBpf(track.id);
    track.deleted = true;
  }

  /**
   * Gets the track with the given id.
   * @param trackId - The id of the track.
   * @returns the track with the given id if it exists, undefined otherwise.
   */
  public getTrackById(trackId: number): Track | undefined {
    return this.trackList.find((track) => track.id === trackId);
  }

  /**
   * Clears all tracks.
   * It removes all tracks from the track list and disconnects the audio nodes.
   */
  public clearAllTracks(): void {
    for (let track of this.trackList) {
      this._app.pluginsController.removePedalBoard(track);
      this._view.removeTrack(track.element);
      this._app.waveformController.removeWaveformOfTrack(track);
      this._app.automationView.removeAutomationBpf(track.id);
      track.node!.removeAudio();
      track.node!.disconnectEvents();
      track.node!.disconnect();
    }
    this.trackList = [];
  }

  /**
   * Creates a new empty track. It creates the audio node and the track.
   *
   * @param url - The url of the track.
   * @returns the created track
   */
  public async newEmptyTrack(url?: string): Promise<Track> {
    let wamInstance = await WamEventDestination.createInstance(
      this._app.host.hostGroupId,
      audioCtx
    );
    let node = wamInstance.audioNode as WamAudioWorkletNode;

    let track = this.createTrack(node);
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
  public async newTrackWithFile(file: File): Promise<Track | undefined> {
    if (
      file.type === "audio/ogg" ||
      file.type === "audio/wav" ||
      file.type === "audio/mpeg" ||
      file.type === "audio/x-wav"
    ) {
      let wamInstance = await WamEventDestination.createInstance(
        this._app.host.hostGroupId,
        audioCtx
      );
      let node = wamInstance.audioNode as WamAudioWorkletNode;

      let audioArrayBuffer = await file.arrayBuffer();
      let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
      let operableAudioBuffer = Object.setPrototypeOf(
        audioBuffer,
        OperableAudioBuffer.prototype
      ) as OperableAudioBuffer;
      operableAudioBuffer = operableAudioBuffer.makeStereo();

      node.setAudio(operableAudioBuffer.toArray());

      let track = this.createTrack(node);
      track.setAudioBuffer(operableAudioBuffer);
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
    let track = this.createTrack(node);
    //track.setAudioBuffer(deletedTrack.audioBuffer!);
    track.element = deletedTrack.element;
    track.color = deletedTrack.color;
    track.mute = deletedTrack.mute;
    track.solo = deletedTrack.solo;
    track.merge = deletedTrack.merge;
    track.left = deletedTrack.left;
    track.right = deletedTrack.right;
    track.stereo = deletedTrack.stereo;
    track.armed = deletedTrack.armed;
    track.monitored = deletedTrack.monitored;
    track.setVolume(deletedTrack.volume);
    track.setBalance(deletedTrack.getBalance());
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
    this.trackList.forEach((track) => {
      track.node!.port.postMessage({ playhead: this._app.host.playhead + 1 });
    });

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
      this._app.tracksController.newEmptyTrack().then((track) => {
        this.initializeTrack(track);
        track.element.progressDone();
      });
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
      // for undo/redo
      let oldSelectedTrack = this._app.pluginsController.selectedTrack;

      // Select the track when it is clicked.
      if (!track.deleted) {
        this._app.pluginsController.selectTrack(track);
      }

      let newSelectedTrack = this._app.pluginsController.selectedTrack;

      this._app.undoManager.add({
        undo: () => {
          this.undoSelect(track, oldSelectedTrack);
        },
        redo: () => {
          this.undoSelect(track, newSelectedTrack);
        },
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

      // Remove the track when the close button is clicked.
      this.removeTrack(track);

      // for undo/redo
      this._app.undoManager.add({
        undo: () => {
          this.undoTrackRemove(oldTrack, oldTrackElement, oldWaveform);
        },
        redo: () => {
          // remove the track again
          this.removeTrack(oldTrack);
        },
      });

      //
    });

    // SOLO TRACK
    track.element.soloBtn.addEventListener("click", () => {
      // Solo the track when the solo button is clicked.
      let oldSoloStatus = track.solo;
      this.solo(track);
      let newSoloStatus = track.solo;

      // for undo/redo
      this._app.undoManager.add({
        undo: () => {
          this.undoSolo(track, oldSoloStatus);
        },
        redo: () => {
          this.undoSolo(track, newSoloStatus);
        },
      });
      this.updateUndoButtons();
    });

    // MUTE TRACK
    track.element.muteBtn.addEventListener("click", () => {
      // Mute the track when the mute button is clicked.
      let oldMuteStatus = track.muted;
      this.mute(track);
      let newMuteStatus = track.muted;

      // for undo/redo
      this._app.undoManager.add({
        undo: () => {
          this.undoMute(track, oldMuteStatus);
        },
        redo: () => {
          this.undoMute(track, newMuteStatus);
        },
      });
      this.updateUndoButtons();
    });

    // TRACK VOLUME
    track.element.volumeSlider.addEventListener("input", (evt) => {
      // Change the volume of the track when the volume slider is changed.
      const newVolume: number =
        parseInt(track.element.volumeSlider.value) / 100;
      track.setVolume(newVolume);
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

      this._app.undoManager.add({
        undo: () => {
          this.undoSetVolume(track, oldV);
        },
        redo: () => {
          this.undoSetVolume(track, newVolume);
        },
      });

      this.updateUndoButtons();
    });

    // TRACK BALANCE
    track.element.balanceSlider.addEventListener("input", () => {
      // Change the balance of the track when the balance slider is changed.
      track.setBalance(parseFloat(track.element.balanceSlider.value));
    });
    // for undo / redo set balance
    track.element.balanceSlider.addEventListener("mousedown", (evt) => {
      // memorize volume when we first clicked on the slider
      this._oldBalance = track.getBalance();
    });
    track.element.balanceSlider.addEventListener("change", (evt) => {
      const newBalance: number = +track.element.balanceSlider.value;
      // for undo/redo
      let oldB = this._oldBalance;

      this._app.undoManager.add({
        undo: () => {
          this.undoSetBalance(track, oldB);
        },
        redo: () => {
          this.undoSetBalance(track, newBalance);
        },
      });
      this.updateUndoButtons();
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
    });

    // TRACK ARM
    track.element.armBtn.addEventListener("click", () => {
      // for undo/redo
      let oldArmStatus: boolean = track.armed;

      // Arm the track when the arm button is clicked.
      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickArm(track);

      let newArmStatus: boolean = track.armed;
      this._app.undoManager.add({
        undo: () => {
          this._app.recorderController.clickArm(track);
          this.undoArm(track, oldArmStatus);
        },
        redo: () => {
          this._app.recorderController.clickArm(track);
          this.undoArm(track, newArmStatus);
        },
      });
    });

    // TRACK MONITOR
    track.element.monitoringBtn.addEventListener("click", () => {
      // for undo/redo
      let oldMonitoringStatus: boolean = track.monitored;

      // Change the monitoring of the track when the monitoring button is clicked.
      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickMonitoring(track);

      let newMonitoringStatus: boolean = track.monitored;

      this._app.undoManager.add({
        undo: () => {
          this._app.recorderController.clickMonitoring(track);
          this.undoMonitoring(track, oldMonitoringStatus);
        },
        redo: () => {
          this._app.recorderController.clickMonitoring(track);
          this.undoMonitoring(track, newMonitoringStatus);
        },
      });
    });

    // TRACK MODE STEREO or (MONO to STEREO)
    track.element.modeBtn.addEventListener("click", () => {
      // for undo/redo
      let oldMode: boolean = track.stereo;

      // Change the mode of the track when the mode button is clicked.
      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickMode(track);

      let newMode = track.stereo;

      this._app.undoManager.add({
        undo: () => {
          this._app.recorderController.clickMode(track);
          this.undoMode(track, oldMode);
        },
        redo: () => {
          this._app.recorderController.clickMode(track);
          this.undoMode(track, newMode);
        },
      });
    });

    // TRACK LEFT INPUT
    track.element.leftBtn.addEventListener("click", () => {
      // for undo/redo
      let oldLeftStatus = track.left;

      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickLeft(track);
      let newLeftStatus = track.left;

      this._app.undoManager.add({
        undo: () => {
          this._app.recorderController.clickLeft(track);
          this.undoLeft(track, oldLeftStatus);
        },
        redo: () => {
          this._app.recorderController.clickLeft(track);
          this.undoLeft(track, newLeftStatus);
        },
      });
    });

    // TRACK RIGHT INPUT
    track.element.rightBtn.addEventListener("click", () => {
      // for undo/redo
      let oldRightStatus = track.right;

      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickRight(track);

      let newRightStatus = track.right;

      this._app.undoManager.add({
        undo: () => {
          this._app.recorderController.clickRight(track);
          this.undoRight(track, oldRightStatus);
        },
        redo: () => {
          this._app.recorderController.clickRight(track);
          this.undoRight(track, newRightStatus);
        },
      });
    });

    // TRACK MERGE LEFT/RIGHT
    track.element.mergeBtn.addEventListener("click", () => {
      // for undo/redo
      let oldMergeStatus = track.merge;

      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickMerge(track);

      let newMergeStatus = track.merge;

      this._app.undoManager.add({
        undo: () => {
          this._app.recorderController.clickMerge(track);
          this.undoMerge(track, oldMergeStatus);
        },
        redo: () => {
          this._app.recorderController.clickMerge(track);
          this.undoMerge(track, newMergeStatus);
        },
      });
    });

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
  private async automationMenu(e: Event, track: Track): Promise<void> {
    this._app.pluginsController.selectTrack(track);
    await this._app.automationController.openAutomationMenu(track);
    e.stopImmediatePropagation();
  }

  /**
   * Handles the color button of the given track.
   * @param track - The track to change the color.
   * @private
   */
  private changeColor(track: Track): void {
    this._app.pluginsController.selectTrack(track);
    this._view.changeColor(track);
    this._app.editorView.changeWaveFormColor(track);
  }

  /**
   * Handles the mute button of the given track.
   * @param track - The track to mute.
   * @private
   */
  private mute(track: Track): void {
    this._app.pluginsController.selectTrack(track);
    if (track.muted) {
      track.unmute();
      track.element.unmute();
    } else {
      track.mute();
      track.element.mute();
    }
    track.muted = !track.muted;
  }

  /**
   * Handles the solo button of the given track.
   * @param track - The track to solo.
   * @private
   */
  private solo(track: Track): void {
    this._app.pluginsController.selectTrack(track);

    this.setSolo(track, !track.solo);
  }

  private setSolo(track: Track, soloValue: boolean) {
    track.solo = soloValue;

    if (track.solo) {
      // Solo the track

      this.trackList.forEach((other) => {
        // Mute all other tracks except the soloed one
        if (other !== track && !other.solo) {
          other.muteSolo();
        }
      });
      if (!track.muted) {
        // Unmute the soloed track if it is not muted
        track.unmute();
      }
      track.element.solo();
    } else {
      // Un-solo the track
      let otherSolo = false; // Check if there is another soloed track

      this.trackList.forEach((other) => {
        if (other.solo) {
          otherSolo = true;
        }
      });

      if (!otherSolo) {
        // Unmute all tracks if there is no other soloed track
        this.trackList.forEach((other) => {
          if (!other.solo) {
            if (other.muted) {
              other.muteSolo();
            } else {
              other.unmute();
            }
          }
        });
      } else {
        // Else only unmute the track.
        track.muteSolo();
      }

      track.element.unsolo();
    }
  }

  /**
   * Creates a new TracksView with the given audio node. Initializes the audio nodes and the canvas.
   *
   * @param node - The audio node of the track.
   * @returns the created track
   * @private
   */
  private createTrack(node: WamAudioWorkletNode): Track {
    let trackElement = new TrackElement();
    trackElement.trackId = this.trackIdCount;

    let track = new Track(this.trackIdCount, trackElement, node);
    track.plugin = new Plugin(this._app);
    track.gainNode.connect(this._app.host.gainNode);

    this.trackList.push(track);

    // wait until the trackElement WebComponent is connected
    // to the DOM before initializing the peak meter
    let id = setInterval(() => {
      //console.log("trackElement.isConnected", trackElement.isConnected);
      // create the peak meter
      if (trackElement.isConnected) {
        //console.log("trackElement.isConnected", trackElement.isConnected)
        let peakMeter = new WebAudioPeakMeter(
          audioCtx,
          track.gainNode,
          trackElement.getPeakMeterParentElement(),
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

    this.trackIdCount++;
    return track;
  }

  /**
   * Removes the given track from the track list and disconnects the audio node.
   *
   * @param track - The track to remove
   * @private
   */
  private deleteTrack(track: Track): void {
    let trackIndex = this.trackList.indexOf(track);
    this.trackList.splice(trackIndex, 1);
    track.node!.removeAudio();
    track.node!.disconnectEvents();
    track.node!.disconnect();
  }

  // ----- UNDO / REDO methods
  updateUndoButtons() {
    // to disable/enable undo/redo buttons if undo/redo is available
    this._app.hostView.setUndoButtonState(this._app.undoManager.hasUndo());
    this._app.hostView.setRedoButtonState(this._app.undoManager.hasRedo());
  }

  undoSetVolume(track: Track, v: number) {
    track.element.volumeSlider.value = "" + v * 100;
    track.setVolume(v);
  }

  undoSetBalance(track: Track, b: number) {
    track.element.balanceSlider.value = "" + b;
    track.setBalance(b);
  }

  undoMute(track: Track, mutedValue: boolean) {
    this._app.pluginsController.selectTrack(track);
    if (mutedValue) {
      track.mute();
      track.element.mute();
    } else {
      track.unmute();
      track.element.unmute();
    }
  }

  undoSolo(track: Track, soloValue: boolean) {
    this._app.pluginsController.selectTrack(track);
    this.setSolo(track, soloValue);
  }

  undoTrackColorChange(track: Track, color: string) {
    track.color = color;
    this._view.changeColor(track);
    this._app.editorView.changeWaveFormColor(track);
  }

  undoArm(track: Track, status: boolean) {
    track.armed = status;
    track.element.setArm(status);
  }

  undoMonitoring(track: Track, status: boolean) {
    track.monitored = status;
    track.element.setMonitoring(status);
  }

  undoMode(track: Track, stereoMode: boolean) {
    track.stereo = stereoMode;
    track.element.setMode(stereoMode);
  }

  undoLeft(track: Track, leftStatus: boolean) {
    track.left = leftStatus;
    track.element.setLeft(leftStatus);
  }

  undoRight(track: Track, rightStatus: boolean) {
    track.right = rightStatus;
    track.element.setRight(rightStatus);
  }

  undoMerge(track: Track, mergeStatus: boolean) {
    track.merge = mergeStatus;
    track.element.setMerge(mergeStatus);
  }

  undoFx(track: Track, fxStatus: boolean) {
    this._app.pluginsController.fxButtonClicked(track);
  }

  undoSelect(track: Track, trackToSelect: Track | undefined) {
    if (trackToSelect) {
      this._app.pluginsController.selectTrack(trackToSelect);
    }
  }

  async undoTrackRemove(
    oldTrack: Track,
    element: TrackElement,
    oldTrackWaveform: WaveformView | undefined
  ) {
    
    // restore track element with old track element state
    this._app.tracksController.newEmptyTrack().then((track) => {
        this.initializeTrack(track);
        let elementState = element.getState();
        track.element.setState(elementState);
        // to show the hidden buttons...
        track.element.progressDone();
      });
      
    // Create new track with old track state
    let newTrack = await this._app.tracksController.newTrackFromDeletedTrack(oldTrack);
    // add regions from old track to new track
    // add regions to waveform

    let waveformView = this._app.editorView.getWaveFormViewById(newTrack.id);
      oldTrack.regions.forEach(region => {
        newTrack.regions.push(region);
        waveformView!.createRegionView(region);
      })
    
    newTrack.modified = true;
    newTrack.updateBuffer(audioCtx, this._app.host.playhead);

    return;
    oldTrack.deleted = false;
    this.bindTrackEvents(oldTrack);
    this._app.recorderController.clickMode(oldTrack);
    this._app.pluginsController.selectTrack(oldTrack);
    // update buffers
    oldTrack.modified = true;
    //oldTrack.updateBuffer()
  }
}
