import MenuView from "../Views/MenuView";
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
export default class AudioController {

    app: App;
    audioCtx: AudioContext;
    menuView: MenuView;

    playing: boolean = false;
    looping: boolean = false;
    muted: boolean = false;
    recording: boolean = false;
    pauseInterval = false;

    timerInterval: NodeJS.Timer | undefined;

    constructor(app: App) {
        this.app = app;
        this.menuView = app.menuView;
        this.audioCtx = app.audios.audioCtx;
        
        this.defineControls();
    }

    /**
     * Define all the listeners for the audio controls.
     */
    defineControls() {
        this.defineAutomationListener();
        this.definePlayListener();
        this.defineBackListener();
        this.defineRecordListener();
        this.defineLoopListener();
        this.defineVolumeListener();
        this.defineMuteListener();
        this.defineSongsDemoListener();
        this.defineTimerListener();
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
                    this.app.canvasView.movePlayhead(newPos);
                    this.app.menuView.updateTimer(newPos);
                }
            }
        }, 1000/60)
    }

    /**
     * Define the listener for the mute button.
     * It mutes or unmutes the host.
     */
    defineMuteListener() {
        this.menuView.muteBtn.onclick = () => {
            if (this.muted) {
                this.app.host.unmuteHost();
            }
            else {
                this.app.host.muteHost();
            }
            this.muted = !this.muted;
            this.menuView.pressMuteButton(this.muted);
        }
    }

    /**
     * Define the listener for the volume slider. It controls the volume of the host.
     */
    defineVolumeListener() {
        this.menuView.volumeSlider.oninput = () => {
            
            let value = parseInt(this.menuView.volumeSlider.value) / 100;
            console.log(value);
            
            this.app.host.setVolume(value);
        }
    }

    /**
     * Define the listener for the loop button. It loops or unloops the host.
     */
    defineLoopListener() {
        this.menuView.loopBtn.onclick = () => {
            if (this.looping) {
                this.app.audios.trackList.forEach((track) => {
                    //@ts-ignore
                    track.node.parameters.get("loop").value = 0;
                });
                //@ts-ignore
                this.app.host.hostNode.parameters.get("loop").value = 0;
            }
            else {
                this.app.audios.trackList.forEach((track) => {
                    //@ts-ignore
                    track.node.parameters.get("loop").value = 1;
                });
                //@ts-ignore
                this.app.host.hostNode.parameters.get("loop").value = 1;
            }
            this.looping = !this.looping;
            this.menuView.pressLoopButton(this.looping);
        }
    }

    /**
     * TODO : Not implemented yet.
     */
    defineRecordListener() {
        this.menuView.recordBtn.onclick = () => {
            if (this.recording) {
                // TODO: change processor
            }
            else {
                // TODO
            }
            this.recording = !this.recording;
            this.menuView.pressRecordingButton(this.recording); 
        }
    }

    /**
     * Define the listener for the back button. It goes back to the first beat.
     * 
     */
    defineBackListener() {
        this.menuView.backBtn.onclick = () => {
            this.app.audios.jumpTo(1);
        }
    }

    /**
     * Define the listener for the play button. It plays or pauses the host.
     */
    definePlayListener() {
        this.menuView.playBtn.onclick = () => {
            if (this.playing) {
                this.app.audios.trackList.forEach((track) => {
                    //@ts-ignore
                    track.node.parameters.get("playing").value = 0;
                    clearInterval(this.timerInterval!!);
                }); 
                //@ts-ignore
                this.app.host.hostNode.parameters.get("playing").value = 0;
                this.audioCtx.suspend();
            }
            else {
                this.app.audios.trackList.forEach((track) => {
                    //@ts-ignore
                    track.node.parameters.get("playing").value = 1;
                    this.defineTimerListener();
                });
                //@ts-ignore
                this.app.host.hostNode.parameters.get("playing").value = 1;
                this.audioCtx.resume();
            }
            this.playing = !this.playing;
            this.menuView.pressPlayButton(this.playing);
        }
    }
    
    /**
     * TODO : Not implemented yet.
     */
    defineAutomationListener() {
        this.menuView.automationBtn.onclick = () => {
            console.log("Automation Button : TODO");
        }
    }

    /**
     * Define the listeners for the demo songs in the menu.
     */
    defineSongsDemoListener() {
        this.menuView.song1.onclick = async () => { 
            let newTrackList = await this.app.audios.newTrackWithAudio( 
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
            this.app.trackController.addNewTrackList(newTrackList)
        };
        this.menuView.song2.onclick  = async () => { 
            let newTrackList = await this.app.audios.newTrackWithAudio( 
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
            this.app.trackController.addNewTrackList(newTrackList)
        };
        this.menuView.song3.onclick = async () => { 
            let newTrackList = await this.app.audios.newTrackWithAudio( 
                "/songs/Monopiste", 
                {
                    number: 1,
                    songs: [
                        "guitar.ogg"
                    ]
                }
            ); 
            this.app.trackController.addNewTrackList(newTrackList)
        };
        this.menuView.song4.onclick = async () => { 
            let newTrackList = await this.app.audios.newTrackWithAudio( 
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
            this.app.trackController.addNewTrackList(newTrackList)
        };
        this.menuView.song5.onclick = async () => { 
            let newTrackList = await this.app.audios.newTrackWithAudio( 
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
            this.app.trackController.addNewTrackList(newTrackList)
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

}