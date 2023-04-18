import HostView from "../Views/HostView";
import App from "../App";
import songs from "../../static/songs/songs.json";

/**
 * Class to control the audio. It contains all the listeners for the audio controls.
 * It also contains the audio context and the list of tracks. It is used to play, pause, record, mute, loop, etc.
 */
export default class HostController {

    app: App;
    audioCtx: AudioContext;
    hostView: HostView;

    playing: boolean = false;
    looping: boolean = false;
    muted: boolean = false;
    pauseInterval = false;

    timerInterval: NodeJS.Timer | undefined;

    vuMeter: VuMeter;

    constructor(app: App) {
        this.app = app;
        this.hostView = app.hostView;
        this.audioCtx = app.tracks.audioCtx;
        
        this.defineControls();
    }

    /**
     * Define all the listeners for the audio controls.
     */
    defineControls() {
        this.definePlayListener();
        this.defineBackListener();
        this.defineRecordListener();
        this.defineLoopListener();
        this.defineVolumeListener();
        this.defineMuteListener();
        this.defineTimerListener();
        this.defineSongs();
        this.defineMenuListeners();
    } 

    /**
     * Define the listener for the timer.
     * It updates the playhead position and the timer.
     */
    defineTimerListener() {
        let lastPos = this.app.host.playhead;
        this.timerInterval = setInterval(() => {
            let newPos = this.app.host.playhead;
            if (lastPos !== newPos) {
                lastPos = newPos;
                if (!this.pauseInterval) {
                    this.app.editorView.playhead.movePlayhead(newPos);
                    this.app.hostView.updateTimer(newPos);
                }
            }
        }, 1000/60)
    }

    /**
     * Define the listener for the mute button.
     * It mutes or unmutes the host.
     */
    defineMuteListener() {
        this.hostView.muteBtn.onclick = () => {
            if (this.muted) {
                this.app.host.unmuteHost();
            }
            else {
                this.app.host.muteHost();
            }
            this.muted = !this.muted;
            this.hostView.pressMuteButton(this.muted);
        }
    }

    /**
     * Define the listener for the volume slider. It controls the volume of the host.
     */
    defineVolumeListener() {
        this.hostView.volumeSlider.oninput = () => {
            
            let value = parseInt(this.hostView.volumeSlider.value) / 100;
            this.app.host.setVolume(value);
        }
    }

    /**
     * Define the listener for the loop button. It loops or unloops the host.
     */
    defineLoopListener() {
        this.hostView.loopBtn.onclick = () => {
            if (this.looping) {
                this.app.tracks.trackList.forEach((track) => {
                    //@ts-ignore
                    track.node.parameters.get("loop").value = 0;
                });
                //@ts-ignore
                this.app.host.hostNode.parameters.get("loop").value = 0;
            }
            else {
                this.app.tracks.trackList.forEach((track) => {
                    //@ts-ignore
                    track.node.parameters.get("loop").value = 1;
                });
                //@ts-ignore
                this.app.host.hostNode.parameters.get("loop").value = 1;
            }
            this.looping = !this.looping;
            this.hostView.pressLoopButton(this.looping);
        }
    }

    /**
     * TODO : Not implemented yet.
     */
    defineRecordListener() {
        this.hostView.recordBtn.onclick = () => {
            this.app.recorderController.clickRecord();
        }
    }

    /**
     * Define the listener for the back button. It goes back to the first beat.
     * 
     */
    defineBackListener() {
        this.hostView.backBtn.onclick = () => {
            this.app.tracks.jumpTo(0);
            this.app.automationController.applyAllAutomations();
        }
    }

    /**
     * Define the listener for the play button. It plays or pauses the host.
     */
    definePlayListener() {
        this.hostView.playBtn.onclick = () => {
            this.clickOnPlayButton();
        }
    }

    defineSongs() {
        songs.forEach((song) => {
            let name = song.name;
            let el = this.hostView.createNewSongItem(name);
            el.onclick = () => {
                for (let trackSong of song.songs) {
                    this.app.tracks.newTrackUrl(trackSong)
                        .then(track => {
                            if (track !== undefined) {
                                this.app.tracksController.initTrackComponents(track);
                            }
                        });
                }
            }
        })
    }

    defineMenuListeners() {

        this.hostView.importSongs.addEventListener('click', () => {
            this.hostView.newTrackInput.click();
        });
        this.hostView.newTrackInput.addEventListener('change', (e) => {
            // @ts-ignore
            for (let i = 0; i < e.target.files.length; i++) {
                // @ts-ignore
                let file = e.target.files[i];
                if (file !== undefined) {
                    this.app.tracks.newTrackWithFile(file)
                        .then(track => {
                            if (track !== undefined) {
                                this.app.tracksController.initTrackComponents(track);
                            }
                        });
                }

            }
        });
        this.app.pluginsView.mainTrack.addEventListener("click", () => {
            this.app.pluginsController.selectHost();
        });
        this.app.hostView.saveProject.onclick = async () => {
            await this.app.projectController.openSaveProject();
        }
        this.app.hostView.loadProject.onclick = async () => {
            this.app.projectController.openLoadProject();
        }
        this.app.hostView.importProject.onclick = async () => {
            await this.hostView.importInput.click();
        }
        this.app.hostView.exportProject.onclick = async () => {
            let project = await this.app.loader.saveProject();
            let date = new Date().toISOString().slice(0, 10);
            let fileName = `WAM-Project_${date}.json`;
            let blob = new Blob([JSON.stringify(project)], {type: "application/json"});
            let url = URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            a.click();
            a.remove();
        }
        this.app.hostView.importInput.onchange = async (e) => {
            // @ts-ignore
            let file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    let json = JSON.parse(e.target!.result as string);
                    await this.app.loader.loadProject(json);
                }
                reader.readAsText(file);
            }
        }
    }

    /**
     * Pause the timer interval. Used when the user is jumping to a specific beat.
     */
    pauseUpdateInterval() {
        this.pauseInterval = true;
    }

    /**
     * Resume the timer interval. Used when the user is jumping to a specific beat.
     */
    resumeUpdateInteravel() {
        this.pauseInterval = false;
    }

    initVuMeter() {
        this.vuMeter = new VuMeter(this.app.hostView.vuMeterCanvas, 30, 157);
    }

    clickOnPlayButton() {
        if (this.playing) {
            this.app.tracks.trackList.forEach((track) => {
                //@ts-ignore
                track.node.parameters.get("playing").value = 0;
                clearInterval(this.timerInterval!!);
                if (track.isArmed && this.app.recorderController.recording) {
                    this.app.recorderController.stopRecording(track);
                    this.hostView.pressRecordingButton(false);
                }
            });
            //@ts-ignore
            this.app.host.hostNode.parameters.get("playing").value = 0;
            this.audioCtx.suspend();
        }
        else {
            this.app.automationController.applyAllAutomations();
            this.app.tracks.trackList.forEach(async (track) => {
                if (track.modified) track.updateBuffer(this.audioCtx, this.app.host.playhead);
                //@ts-ignore
                track.node.parameters.get("playing").value = 1;
                this.defineTimerListener();
            });
            //@ts-ignore
            this.app.host.hostNode.parameters.get("playing").value = 1;
            this.audioCtx.resume();
        }
        this.playing = !this.playing;
        this.hostView.pressPlayButton(this.playing);
    }

    stopAll() {
        this.app.tracks.trackList.forEach(async (track) => {
            //@ts-ignore
            track.node.parameters.get("playing").value = 0;
            track.node?.port.postMessage({playhead: 0});
        });
    }
}


class VuMeter {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, height: number, width: number) {
        this.canvas = canvas;
        this.canvas.height = height;
        this.canvas.width = width;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

        let gradient = this.ctx.createLinearGradient(0,0, width, height);
        gradient.addColorStop(0, "#08ff00");
        gradient.addColorStop(0.33, "#fffb00");
        gradient.addColorStop(0.66, "#ff7300");
        gradient.addColorStop(1, "#ff0000");

        this.ctx.fillStyle = gradient;
        this.ctx.clearRect(0,0,width,height);
    }

    update(value: number) {
        value = Math.min(value, 1);
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, value*this.canvas.width, this.canvas.height);
    }
}