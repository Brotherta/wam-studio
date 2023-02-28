import HostView from "../Views/HostView";
import App from "../App";

/**
 * Interface for the song info. Number is the number of the song and songs is the list of songs.
 */
export interface SongInfo {
    number: number;
    songs: string[];
}

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
    recording: boolean = false;
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
        this.defineSongsDemoListener();
        this.defineTimerListener();
        this.defineImportSongListener();
        this.app.pluginsView.mainTrack.addEventListener("click", () => {
            this.app.pluginsController.selectHost();
        });
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
            if (this.recording) {
                // TODO: change processor
            }
            else {
                // TODO
            }
            this.recording = !this.recording;
            this.hostView.pressRecordingButton(this.recording);
        }
    }

    /**
     * Define the listener for the back button. It goes back to the first beat.
     * 
     */
    defineBackListener() {
        this.hostView.backBtn.onclick = () => {
            this.app.tracks.jumpTo(1);
            this.app.automationController.applyAllAutomations();
        }
    }

    /**
     * Define the listener for the play button. It plays or pauses the host.
     */
    definePlayListener() {
        this.hostView.playBtn.onclick = () => {
            if (this.playing) {
                this.app.tracks.trackList.forEach((track) => {
                    //@ts-ignore
                    track.node.parameters.get("playing").value = 0;
                    clearInterval(this.timerInterval!!);
                    if (track.isArmed) {
                        console.log("stop Recording");
                        this.app.recorderController.stopRecording(track);
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
                    if (track.isArmed) {
                        await this.app.recorderController.setupRecording(track, this.app.host.playhead);
                    }
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
    }

    /**
     * Define the listeners for the demo songs in the menu.
     */
    defineSongsDemoListener() {
        this.hostView.song1.onclick = async () => {
            let newTrackList = await this.app.tracks.newTrackWithAudio(
                "/songs/AdmiralCrumple_KeepsFlowing", 
                {
                    number: 9,
                    songs: [
                        "01_Kick1.mp3",
                        "02_Kick2.mp3",
                        "03_Snare.mp3",
                        "04_Hat1.mp3",
                        "05_Hat2.mp3",
                        "06_Sample.mp3",
                        "07_LeadVox.mp3",
                        "08_LeadVoxDouble1.mp3",
                        "09_LeadVoxDouble2.mp3"
                    ]
                }
            ); 
            this.app.tracksController.addNewTrackList(newTrackList)
        };
        this.hostView.song2.onclick  = async () => {
            let newTrackList = await this.app.tracks.newTrackWithAudio(
                "/songs/Londres Appelle",
                {
                    number: 6,
                    songs: [
                        "Bass.mp3",
                        "DRUMS.mp3",
                        "GUITAR.mp3",
                        "GUITAR2.mp3",
                        "KICK.mp3",
                        "VOCALS.mp3"
                    ]
                }
            ); 
            this.app.tracksController.addNewTrackList(newTrackList)
        };
        this.hostView.song3.onclick = async () => {
            let newTrackList = await this.app.tracks.newTrackWithAudio(
                "/songs/Monopiste", 
                {
                    number: 1,
                    songs: [
                        "guitar.ogg"
                    ]
                }
            ); 
            this.app.tracksController.addNewTrackList(newTrackList)
        };
        this.hostView.song4.onclick = async () => {
            let newTrackList = await this.app.tracks.newTrackWithAudio(
                "/songs/Street Noise - Revelations", 
                {
                    number: 11,
                    songs: [
                        "01_Kick.mp3",
                        "02_Snare.mp3",
                        "03_Overheads.mp3",
                        "03-Overheads-130729_0912.mp3",
                        "04_Cymbals.mp3",
                        "05_Bass.mp3",
                        "06_Congas.mp3",
                        "07_ElecGtr1.mp3",
                        "08_ElecGtr2.mp3",
                        "09_LeadVox.mp3",
                        "10_HammondLeslieHi.mp3",
                        "11_HammondLeslieLo.mp3",
                    ]
                }
            ); 
            this.app.tracksController.addNewTrackList(newTrackList)
        };
        this.hostView.song5.onclick = async () => {
            let newTrackList = await this.app.tracks.newTrackWithAudio(
                "/songs/Tarte a la cerise", 
                {
                    number: 6,
                    songs: [
                        "bass.ogg",
                        "cymbals.ogg",
                        "guitar.ogg",
                        "kick.ogg",
                        "snaretoms.ogg",
                        "song.ogg"
                    ]
                }
            ); 
            this.app.tracksController.addNewTrackList(newTrackList)
        };
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

    defineImportSongListener() {
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