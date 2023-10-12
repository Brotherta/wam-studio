import {audioCtx} from "../index";
import {RATIO_MILLS_BY_PX} from "../Env";
import TempoSelectorElement from "../Components/TempoSelectorElement";
import TimeSignatureSelectorElement from "../Components/TimeSignatureSelectorElement";

/**
 * Class responsible for the host view. It displays the host controls and the host track.
 */
export default class HostView {

    playBtn = document.getElementById("play-btn") as HTMLDivElement;
    backBtn = document.getElementById("back-btn") as HTMLDivElement;
    recordBtn = document.getElementById("record-btn") as HTMLDivElement;
    loopBtn = document.getElementById("loop-btn") as HTMLDivElement;
    muteBtn = document.getElementById("mute-btn") as HTMLDivElement;
    volumeSlider = document.getElementById("global-volume-slider") as HTMLInputElement;
    timer = document.getElementById("timer") as HTMLDivElement;

    tempoDiv = document.getElementById("tempo-selector") as HTMLDivElement;
    tempoSelector = new TempoSelectorElement() as HTMLElement;

    timeSignatureDiv = document.getElementById("time-signature-selector") as HTMLDivElement;
    timeSignatureSelector = new TimeSignatureSelectorElement() as HTMLElement;

    zoomInBtn = document.getElementById("zoom-in-btn") as HTMLDivElement;
    zoomOutBtn = document.getElementById("zoom-out-btn") as HTMLDivElement;

    playIcon = document.getElementById("play-icon") as HTMLDivElement;
    muteIcon = document.getElementById("mute-icon") as HTMLDivElement;

    vuMeterDiv = document.getElementById("vu-meter") as HTMLCanvasElement;
    vuMeterCanvas = document.getElementById("vu-meter-canvas") as HTMLCanvasElement;

    songsContainer = document.getElementById("songs-container") as HTMLDivElement;

    // Menu buttons
    importSongs = document.getElementById("import-songs") as HTMLInputElement;
    newTrackInput: HTMLInputElement = document.getElementById("new-track-input") as HTMLInputElement;
    latencyBtn = document.getElementById("latency-btn") as HTMLDivElement;
    settingsBtn = document.getElementById("settings-btn") as HTMLDivElement;
    saveBtn = document.getElementById("save-project") as HTMLDivElement;
    loadBtn = document.getElementById("load-project") as HTMLDivElement;
    loginBtn = document.getElementById("login") as HTMLDivElement;
    exportProject = document.getElementById("export-project") as HTMLInputElement;

    aboutBtn = document.getElementById("about-btn") as HTMLDivElement;
    aboutCloseBtn = document.getElementById("about-close-button") as HTMLDivElement;
    aboutWindow = document.getElementById("about-window") as HTMLDivElement;

    constructor() {
        // add tempo and time signature selectors to the main toolbar
        this.tempoDiv.appendChild(this.tempoSelector);
        this.timeSignatureDiv.appendChild(this.timeSignatureSelector);
        
    }
    
    /**
     * Updates the timer of the host view.
     *
     * @param pos - The current pos of the playhead. It is used to calculate the time.
     */
    public updateTimer(pos: number) {
        let millseconds = (pos / audioCtx.sampleRate) * 1000;
        this.timer.innerHTML = HostView.millisToMinutesAndSeconds(millseconds);
    }

    /**
     * Updates the timer of the host view from the x position of the playhead.
     *
     * @param pos - The position of the playhead in pixels.
     */
    public updateTimerByPixelsPos(pos: number) {
        this.updateTimer((pos * RATIO_MILLS_BY_PX) / 1000 *audioCtx.sampleRate);
    }

    /**
     * Changes the icon of the play button when the user press it.
     *
     * @param playing - true if the track is playing, false otherwise.
     * @param stop - true if the track is stopped, false otherwise.
     */
    public updatePlayButton(playing: boolean, stop: boolean) {
        let tooltip = this.playBtn.firstElementChild as HTMLSpanElement;

        if (playing) {
            if (stop) {
                this.playIcon.className = "stop-icon";
                tooltip.innerHTML = "Stop";
            } else {
                this.playIcon.className = "pause-icon";
                tooltip.innerHTML = "Pause";
            }
        } else {
            this.playIcon.className = "play-icon";
            tooltip.innerHTML = "Play";
        }
    }

    /**
     * Changes the icon of the loop button when the user press it.
     *
     * @param looping - true if the track is looping, false otherwise.
     */
    public updateLoopButton(looping: boolean) {
        let tooltip = this.loopBtn.firstElementChild as HTMLSpanElement;

        if (looping) {
            this.loopBtn.style.background = "black";
            tooltip.innerHTML = "Turn&nbsp;off&nbsp;looping";
        }
        else {
            this.loopBtn.style.background = "";
            tooltip.innerHTML = "Loop";
        }
    }

    /**
     * Changes the icon of the record button when the user press it.
     *
     * @param recording - true if the track is recording, false otherwise.
     */
    public updateRecordButton(recording: boolean) {
        let tooltip = this.recordBtn.firstElementChild as HTMLSpanElement;

        if (recording) {
            this.recordBtn.style.background = "black";
            tooltip.innerHTML = "Stop&nbsp;recording";
        }
        else {
            this.recordBtn.style.background = "";
            tooltip.innerHTML = "Record";
        }
    }

    /**
     * Changes the icon of the mute button when the user press it.
     *
     * @param muted - true if the track is muted, false otherwise.
     */
    public updateMuteButton(muted: boolean): void {
        let tooltip = this.muteBtn.firstElementChild as HTMLSpanElement;

        if (muted) {
            this.muteIcon.className = "volume-off-icon";
            tooltip.innerHTML = "Unmute";
        } else {
            this.muteIcon.className = "volume-up-icon";
            tooltip.innerHTML = "Mute";
        }
    }

    /**
     * Creates a new song item in the songs' container. It is used to display the songs in the dropdown menu.
     *
     * @param name - The name of the song.
     */
    public createNewSongItem(name: string): HTMLAnchorElement {
        let item = document.createElement("a");
        item.classList.add("dropdown-item");
        item.innerHTML = name;
        this.songsContainer.appendChild(item);
        return item;
    }

    /**
     * Converts milliseconds to minutes and seconds.
     *
     * @param millis - The milliseconds to convert.
     */
    private static millisToMinutesAndSeconds(millis: number) {
        const d = new Date(Date.UTC(0, 0, 0, 0, 0, 0, millis)),
            parts = [
                d.getUTCHours(),
                d.getUTCMinutes(),
                d.getUTCSeconds()
            ];
        return parts.map(s => String(s).padStart(2, '0')).join(':') + "." + String(d.getMilliseconds()).padStart(3, '0');
    }
}