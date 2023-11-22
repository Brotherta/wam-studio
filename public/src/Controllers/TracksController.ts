import Track from "../Models/Track";
import TracksView from "../Views/TracksView";
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
    track.element.addEventListener("click", () => {
      // Select the track when it is clicked.
      if (!track.deleted) {
        this._app.pluginsController.selectTrack(track);
      }
    });
    track.element.closeBtn.addEventListener("click", () => {
      // Remove the track when the close button is clicked.
      this.removeTrack(track);
    });
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

    track.element.color.addEventListener("click", () => {
      // Change the color of the track when the color button is clicked.
      this.changeColor(track);
    });
    track.element.automationBtn.addEventListener("click", async (e) => {
      // Open the automation menu when the automation button is clicked.
      this.automationMenu(e, track);
    });
    track.element.armBtn.addEventListener("click", () => {
      // Arm the track when the arm button is clicked.
      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickArm(track);
    });
    track.element.monitoringBtn.addEventListener("click", () => {
      // Change the monitoring of the track when the monitoring button is clicked.
      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickMonitoring(track);
    });
    track.element.modeBtn.addEventListener("click", () => {
      // Change the mode of the track when the mode button is clicked.
      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickMode(track);
    });
    track.element.leftBtn.addEventListener("click", () => {
      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickLeft(track);
    });
    track.element.rightBtn.addEventListener("click", () => {
      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickRight(track);
    });
    track.element.mergeBtn.addEventListener("click", () => {
      this._app.pluginsController.selectTrack(track);
      this._app.recorderController.clickMerge(track);
    });
    track.element.fxBtn.addEventListener("click", () => {
      // Open the fx menu when the fx button is clicked.
      this._app.pluginsController.fxButtonClicked(track);
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
    track.solo = !track.solo;

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
    track.muted = mutedValue;
    // change button appeareance
    track.element.setMute(mutedValue);
  }

  undoSolo(track: Track, soloValue: boolean) {
    track.solo = soloValue;
    // change button appeareance
    track.element.setSolo(soloValue);
  }
}
