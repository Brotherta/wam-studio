import { SAMPLE_RATE } from "../Utils";

export default class HostView {

    automationBtn = document.getElementById("automation-btn") as HTMLDivElement;
    playBtn = document.getElementById("play-btn") as HTMLDivElement;
    backBtn = document.getElementById("back-btn") as HTMLDivElement;
    recordBtn = document.getElementById("record-btn") as HTMLDivElement;
    loopBtn = document.getElementById("loop-btn") as HTMLDivElement;
    muteBtn = document.getElementById("mute-btn") as HTMLDivElement;
    volumeSlider = document.getElementById("global-volume-slider") as HTMLInputElement;
    timer = document.getElementById("timer") as HTMLDivElement;


    song1 = document.getElementById("song-1") as HTMLAnchorElement;
    song2 = document.getElementById("song-2") as HTMLAnchorElement;
    song3 = document.getElementById("song-3") as HTMLAnchorElement;
    song4 = document.getElementById("song-4") as HTMLAnchorElement;
    song5 = document.getElementById("song-5") as HTMLAnchorElement;

    updateTimer(pos: number) {
        let millseconds = (pos / SAMPLE_RATE) * 1000;
        this.timer.innerHTML = this.millisToMinutesAndSeconds(millseconds);
    }

    millisToMinutesAndSeconds(millis: number) {
        const d = new Date(Date.UTC(0, 0, 0, 0, 0, 0, millis)),
            parts = [
                d.getUTCHours(),
                d.getUTCMinutes(),
                d.getUTCSeconds()
            ];
        return parts.map(s => String(s).padStart(2, '0')).join(':') + "." + String(d.getMilliseconds()).padStart(3, '0');
    }

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
}