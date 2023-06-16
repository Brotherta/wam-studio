/**
 * Class responsible for the host view. It displays the host controls and the host track.
 */
import {audioCtx} from "../index";

export default class HostView {

    playBtn = document.getElementById("play-btn") as HTMLDivElement;
    backBtn = document.getElementById("back-btn") as HTMLDivElement;
    recordBtn = document.getElementById("record-btn") as HTMLDivElement;
    loopBtn = document.getElementById("loop-btn") as HTMLDivElement;
    muteBtn = document.getElementById("mute-btn") as HTMLDivElement;
    volumeSlider = document.getElementById("global-volume-slider") as HTMLInputElement;
    timer = document.getElementById("timer") as HTMLDivElement;

    playIcon = document.getElementById("play-icon") as HTMLDivElement;
    muteIcon = document.getElementById("mute-icon") as HTMLDivElement;

    vuMeterCanvas = document.getElementById("vu-meter") as HTMLCanvasElement;

    songsContainer = document.getElementById("songs-container") as HTMLDivElement;

    importSongs = document.getElementById("import-songs") as HTMLInputElement;
    newTrackInput: HTMLInputElement = document.getElementById("new-track-input") as HTMLInputElement;
    latencyBtn = document.getElementById("latency-btn") as HTMLDivElement;
    settingsBtn = document.getElementById("settings-btn") as HTMLDivElement;
    saveBtn = document.getElementById("save-project") as HTMLDivElement;
    loadBtn = document.getElementById("load-project") as HTMLDivElement;
    loginBtn = document.getElementById("login") as HTMLDivElement;


    aboutBtn = document.getElementById("about-btn") as HTMLDivElement;
    aboutCloseBtn = document.getElementById("about-close-button") as HTMLDivElement;
    aboutWindow = document.getElementById("about-window") as HTMLDivElement;

    /**
     * Update the timer of the host view.
     *
     * @param pos current pos of the playhead. It is used to calculate the time.
     */
    updateTimer(pos: number) {
        let millseconds = (pos / audioCtx.sampleRate) * 1000;
        this.timer.innerHTML = this.millisToMinutesAndSeconds(millseconds);
    }

    /**
     * Convert milliseconds to minutes and seconds.
     *
     * @param millis milliseconds to convert
     */
    millisToMinutesAndSeconds(millis: number) {
        const d = new Date(Date.UTC(0, 0, 0, 0, 0, 0, millis)),
            parts = [
                d.getUTCHours(),
                d.getUTCMinutes(),
                d.getUTCSeconds()
            ];
        return parts.map(s => String(s).padStart(2, '0')).join(':') + "." + String(d.getMilliseconds()).padStart(3, '0');
    }

    /**
     * Change the icon of the play button when the user press it.
     * @param playing
     */
    pressPlayButton(playing: boolean, stop: boolean) {
        // let imgPlay = document.getElementById("play-img") as HTMLImageElement;
        // let imgPause = document.getElementById("pause-img") as HTMLImageElement;
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
     * Change the icon of the loop button when the user press it.
     * @param looping
     */
    pressLoopButton(looping: boolean) {
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
     * Change the icon of the record button when the user press it.
     * @param recording
     */
    pressRecordingButton(recording: boolean) {
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
     * Change the icon of the mute button when the user press it.
     * @param muted
     */
    pressMuteButton(muted: boolean) {
        let tooltip = this.muteBtn.firstElementChild as HTMLSpanElement;

        if (muted) {
            this.muteIcon.className = "volume-off-icon";
            tooltip.innerHTML = "Unmute";
        } else {
            this.muteIcon.className = "volume-up-icon";
            tooltip.innerHTML = "Mute";
        }
    }

    createNewSongItem(name: string) {
        let item = document.createElement("a");
        item.classList.add("dropdown-item");
        item.innerHTML = name;
        this.songsContainer.appendChild(item);
        return item;
    }
}