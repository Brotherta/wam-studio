import Metronome from "../Components/MetronomeComponent";
import TempoSelectorElement from "../Components/TempoSelectorElement";
import TimeSignatureSelectorElement from "../Components/TimeSignatureSelectorElement";
import AudioLoopBrowser from "../Components/WamAudioLoopBrowser";
import { RATIO_MILLS_BY_PX } from "../Env";

/**
 * Class responsible for the host view. It displays the host controls and the host track.
 */
export default class HostView {
    playBtn = document.getElementById("play-btn") as HTMLDivElement;
    backBtn = document.getElementById("back-btn") as HTMLDivElement;
    recordBtn = document.getElementById("record-btn") as HTMLDivElement;
    loopBtn = document.getElementById("loop-btn") as HTMLDivElement;
    muteBtn = document.getElementById("mute-btn") as HTMLDivElement;
    snapBtn = document.getElementById("snap-btn") as HTMLDivElement;
    splitBtn = document.getElementById("split-btn") as HTMLDivElement;
    mergeBtn = document.getElementById("merge-btn") as HTMLDivElement;
    undoBtn = document.getElementById("undo-btn") as HTMLDivElement;
    redoBtn = document.getElementById("redo-btn") as HTMLDivElement;
    metroBtn = document.getElementById("metro-btn") as HTMLDivElement;
    soundLoopBtn = document.getElementById("soundLoupBtn") as HTMLElement;

    volumeSlider = document.getElementById("global-volume-slider") as HTMLInputElement;
    timer = document.getElementById("timer") as HTMLDivElement;

    tempoDiv = document.getElementById("tempo-selector") as HTMLDivElement;
    tempoSelector = new TempoSelectorElement() as HTMLElement;

    audioLoopBrowserDiv = document.getElementById("audio-loop-browser") as HTMLDivElement;
    audioLoopBrowserElement = new AudioLoopBrowser() as HTMLElement;

    timeSignatureDiv = document.getElementById("time-signature-selector") as HTMLDivElement;
    timeSignatureSelector = new TimeSignatureSelectorElement() as HTMLElement;

    MetronomeDiv = document.getElementById("metronome") as HTMLDivElement;
    MetronomeElement = new Metronome(this.tempoSelector,this.timeSignatureSelector) as HTMLElement;

    zoomInBtn = document.getElementById("zoom-in-btn") as HTMLDivElement;
    zoomOutBtn = document.getElementById("zoom-out-btn") as HTMLDivElement;

    playIcon = document.getElementById("play-icon") as HTMLDivElement;
    muteIcon = document.getElementById("mute-icon") as HTMLDivElement;
    snapIcon = document.getElementById("snap-icon") as HTMLDivElement;
    undoIcon = document.getElementById("undo-icon") as HTMLDivElement;
    redoIcon = document.getElementById("redo-icon") as HTMLDivElement;
    metronomeIcon = document.getElementById("metro-icon") as HTMLDivElement;

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

    keyboardShortcutsBtn = document.getElementById("keyboard-shortcuts-btn") as HTMLDivElement;
    keyboardShortcutsCloseBtn = document.getElementById("keyboard-shortcuts-close-button") as HTMLDivElement;
    keyboardShortcutsWindow = document.getElementById("keyboard-shortcuts-window") as HTMLDivElement;

    constructor() {
        // add tempo and time signature selectors to the main toolbar
        this.tempoDiv.appendChild(this.tempoSelector);
        this.timeSignatureDiv.appendChild(this.timeSignatureSelector);

        // audio loop browser
        this.audioLoopBrowserDiv.appendChild(this.audioLoopBrowserElement);
        this.MetronomeDiv.appendChild(this.MetronomeElement);

    }
    toggleAudioLoopBrowser = this.soundLoopBtn.addEventListener("click", () => {
        this.audioLoopBrowserDiv.style.display = this.audioLoopBrowserDiv.style.display === "none" ? "flex" : "none";
    });
    
    
    public updateMetronomeBtn(metronomeOn: boolean) {
        let tooltip = this.metroBtn.firstElementChild as HTMLSpanElement;
        if(metronomeOn){
            this.metroBtn.style.backgroundColor = "black";
            tooltip.textContent = "Metronome On";
        }else{
            this.metroBtn.style.backgroundColor = "";
            tooltip.textContent = "Metronome Off";
        }
    }
        
    /**
     * Updates the timer of the host view.
     *
     * @param pos - The current time in milliseconds
     */
    public updateTimer(pos: number) {
        this.timer.innerHTML = HostView.millisToMinutesAndSeconds(pos);
    }

    /**
     * Updates the timer of the host view from the x position of the playhead.
     *
     * @param pos - The position of the playhead in pixels.
     */
    public updateTimerByPixelsPos(pos: number) {
        // turn the pos from pixels to ms
        const posInMs = pos*RATIO_MILLS_BY_PX;
        this.timer.innerHTML = HostView.millisToMinutesAndSeconds(posInMs);
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
    public updateSnapButton(snapGrid: boolean): void {
        let tooltip = this.snapBtn.firstElementChild as HTMLSpanElement;

        if (snapGrid) {
            this.snapIcon.className = "snap-icon";
            tooltip.innerHTML = "Snap Grid Off";
        } else {
            this.snapIcon.className = "snap-icon-off";
            tooltip.innerHTML = "Snap Grid On";
        }
    }

    public setUndoButtonState(undoAvailable: boolean): void {
        if(undoAvailable) 
            this.undoIcon.className= "undo-icon";
        else 
            this.undoIcon.className ="undo-icon-off";
    }

    public setRedoButtonState(redoAvailable: boolean): void {
        if(redoAvailable) 
            this.redoIcon.className = "redo-icon";
        else 
            this.redoIcon.className = "redo-icon-off";
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