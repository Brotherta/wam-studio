import HostView from "../Views/HostView";
import App from "../App";
import songs from "../../static/songs.json"
import {audioCtx} from "../index";
import {focusWindow} from "./StaticController";
import {SONGS_FILE_URL} from "../Env";
import VuMeter from "../Components/VuMeterElement";

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
    private readonly TIMER_INTERVAL_MS = 1000/60; // 60 fps

    constructor(app: App) {
        this._app = app;
        this._view = app.hostView;

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
        if (playing) {
            this._app.automationController.applyAllAutomations();
            this._app.tracksController.trackList.forEach(track => {
                if (track.modified) track.updateBuffer(audioCtx, this._app.host.playhead);
                track.node?.play();
            });
            this._app.host.hostNode?.play();
            this.launchTimerInterval();
        }
        else {
            this._app.tracksController.trackList.forEach(track => {
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
        this._app.tracksController.jumpTo(1);
        this._app.automationController.applyAllAutomations();
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
    }

    /**
     * Handles the mute button. It mutes or unmutes the audio.
     */
    public mute(): void {
        const muted = !this._app.host.muted
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
                    this._app.tracksController.newTrackWithFile(file)
                        .then(track => {
                            if (track !== undefined) {
                                this._app.tracksController.initTrackComponents(track);
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
            this._app.host.hostNode.port.onmessage = ev => {
                if (ev.data.playhead) {
                    this._app.host.playhead = ev.data.playhead;
                }
                else if (ev.data.volume >= 0) {
                    let vol = ev.data.volume;
                    let sensitivity = 2.3;
                    this.vuMeter.update(Math.abs(vol) * sensitivity);
                }

            }
        }
        else {
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
            this._app.editorController.zoomIn();
        });
        this._view.zoomOutBtn.addEventListener("click", async () => {
            this._app.editorController.zoomOut();
        });

        // MENU BUTTONS
        this._view.exportProject.addEventListener("click", () => {
            this._app.projectController.openExportProject();
        });
        this._view.saveBtn.addEventListener("click",  () => {
            this._app.projectController.openSaveProject();
        });
        this._view.loadBtn.addEventListener("click", () => {
            this._app.projectController.openLoadProject();
        });
        this._view.loginBtn.addEventListener("click",  () => {
            this._app.projectController.openLogin();
        });
        this._view.settingsBtn.addEventListener("click",   () => {
            this._app.settingsController.openSettings();
        });
        this._view.aboutBtn.addEventListener("click",  () => {
            this._view.aboutWindow.hidden = false;
            focusWindow(this._view.aboutWindow);
        });
        this._view.aboutCloseBtn.addEventListener("click",  () => {
            this._view.aboutWindow.hidden = true;
        });
        this._view.importSongs.addEventListener('click', () => {
            this._view.newTrackInput.click();
        });
        this._view.newTrackInput.addEventListener('change', (e) => {
            this.importFilesSongs(e as InputEvent);
        });
        this._view.latencyBtn.addEventListener("click", () => {
            this._app.latencyView.openWindow();
        });
    }

    /**
     * Initializes the demo songs. It creates a new song item for each demo song.
     * @private
     */
    private initializeDemoSongs(): void {
        songs.forEach((song) => {
            let name = song.name;
            let el = this._view.createNewSongItem(name);
            el.onclick = async () => {
                for (let trackSong of song.songs) {
                    const url = SONGS_FILE_URL + trackSong;
                    let track = await this._app.tracksController.newEmptyTrack(url);
                    track.url = url;
                    this._app.tracksController.initTrackComponents(track);
                }
                for (let track of this._app.tracksController.trackList) {
                    this._app.tracksController.loadTrackUrl(track);
                }
            }
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
        }, this.TIMER_INTERVAL_MS)
    }

    /**
     * Initializes the vu meter. It creates a new vu meter for the master track.
     * @private
     */
    private initializeVuMeter(): void {
        this.vuMeter = new VuMeter(this._view.vuMeterCanvas, 30, 157);
    }
}