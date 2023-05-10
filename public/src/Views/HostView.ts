/**
 * Class responsible for the host view. It displays the host controls and the host track.
 */
import {audioCtx} from "../index";

export default class HostView {

    automationBtn = document.getElementById("automation-btn") as HTMLDivElement;
    playBtn = document.getElementById("play-btn") as HTMLDivElement;
    backBtn = document.getElementById("back-btn") as HTMLDivElement;
    recordBtn = document.getElementById("record-btn") as HTMLDivElement;
    loopBtn = document.getElementById("loop-btn") as HTMLDivElement;
    muteBtn = document.getElementById("mute-btn") as HTMLDivElement;
    volumeSlider = document.getElementById("global-volume-slider") as HTMLInputElement;
    timer = document.getElementById("timer") as HTMLDivElement;

    playbackSlider = document.getElementById("playback-slider") as HTMLInputElement;
    headerTitle = document.getElementById("header-title") as HTMLDivElement;

    controlsBar = document.getElementById("controls-bar") as HTMLDivElement;

    vuMeterCanvas = document.getElementById("vu-meter") as HTMLCanvasElement;

    songsContainer = document.getElementById("songs-container") as HTMLDivElement;
    song1 = document.getElementById("song-1") as HTMLAnchorElement;
    song2 = document.getElementById("song-2") as HTMLAnchorElement;
    song3 = document.getElementById("song-3") as HTMLAnchorElement;
    song4 = document.getElementById("song-4") as HTMLAnchorElement;
    song5 = document.getElementById("song-5") as HTMLAnchorElement;
    song6 = document.getElementById("song-6") as HTMLAnchorElement;

    importSongs = document.getElementById("import-songs") as HTMLInputElement;
    saveProject = document.getElementById("save-project") as HTMLInputElement;
    loadProject = document.getElementById("load-project") as HTMLInputElement;
    importProject = document.getElementById("import-project") as HTMLInputElement;
    exportProject = document.getElementById("export-project") as HTMLInputElement;
    newTrackInput: HTMLInputElement = document.getElementById("new-track-input") as HTMLInputElement;
    importInput: HTMLInputElement = document.getElementById("import-input") as HTMLInputElement;


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
        // get ms only 1 or 2 digits
        let ms = String(d.getMilliseconds());
        ms = ms.substring(0, 2);

        return parts.map(s => String(s).padStart(2, '0')).join(':') + "." + ms.padStart(2, '0');
    }

    /**
     * Change the icon of the play button when the user press it.
     * @param playing
     */
    pressPlayButton(playing: boolean) {
        let imgPlay = document.getElementById("play-img") as HTMLImageElement;
        let imgPause = document.getElementById("pause-img") as HTMLImageElement;
        let tooltip = this.playBtn.firstElementChild as HTMLSpanElement;

        if (playing) {
            imgPause.removeAttribute("hidden");
            imgPlay.setAttribute("hidden", "hidden");
            tooltip.innerHTML = "Pause";
        } else {
            imgPlay.removeAttribute("hidden");
            imgPause.setAttribute("hidden", "hidden");
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
        let imgUnmute = document.getElementById("unmute-img") as HTMLImageElement;
        let imgMute = document.getElementById("mute-img") as HTMLImageElement;
        let tooltip = this.muteBtn.firstElementChild as HTMLSpanElement;

        if (muted) {
            imgMute.removeAttribute("hidden");
            imgUnmute.setAttribute("hidden", "hidden");
            tooltip.innerHTML = "Unmute";
        } else {
            imgUnmute.removeAttribute("hidden");
            imgMute.setAttribute("hidden", "hidden");
            tooltip.innerHTML = "Mute";
        }
    }

    createNewSongItem(name: any) {
        let item = document.createElement("a");
        item.classList.add("dropdown-item");
        item.innerHTML = name;
        this.songsContainer.appendChild(item);
        return item;
    }
}