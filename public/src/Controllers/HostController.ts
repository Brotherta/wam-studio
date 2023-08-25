import HostView from "../Views/HostView";
import App from "../App";
import {audioCtx} from "../index";
import {SONGS_FILE_URL} from "../Env";

/**
 * Class to control the audio. It contains all the listeners for the audio controls.
 * It also contains the audio context and the list of tracks. It is used to play, pause, record, mute, loop, etc.
 */
export default class HostController {

    app: App;
    hostView: HostView;

    playing: boolean = false;
    muted: boolean = false;
    pauseInterval = false;

    timerInterval: NodeJS.Timer | undefined;
    vuMeter: VuMeter;
    maxTime: number; // The maximum time of the song in milliseconds.
    advancedMode: boolean = false;

    constructor(app: App) {
        this.app = app;
        this.hostView = app.hostView;
        this.maxTime = 300000;

        this.defineControls();
        this.advancedMode = localStorage.getItem("advancedMode") === "true";
        localStorage.setItem("advancedMode", this.advancedMode.toString());
        console.log(this.advancedMode)
        this.switchToAdvancedMode();
    }

    /**
     * Define all the listeners for the audio controls.
     */
    defineControls() {
        this.definePlayListener();
        this.defineBackListener();
        this.defineVolumeListener();
        this.defineMuteListener();
        this.defineTimerListener();
        this.searchUserSongs();
        this.defineMenuListeners();
        this.app.hostView.updateTimer(0)
        this.app.hostView.volumeSlider.value = "75";
    }

    /**
     * Define the listener for the timer.
     * It updates the playhead position and the timer.
     */
    defineTimerListener() {
        let lastPos = this.app.host.playhead;

        let updateFrame = () => {
            let newPos = this.app.host.playhead;
            if (lastPos !== newPos) {
                lastPos = newPos;
                if (!this.pauseInterval) {
                    this.app.hostView.updateTimer(newPos);
                    let value = Math.min(((newPos / audioCtx.sampleRate) * 1000) / this.maxTime * 100, 100);
                    this.app.hostView.playbackSlider.value = value.toString();
                }
            }
            requestAnimationFrame(updateFrame);
        }
        requestAnimationFrame(updateFrame);
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
     * Define the listener for the back button. It goes back to the first beat.
     * 
     */
    defineBackListener() {
        this.hostView.backBtn.onclick = () => {
            this.app.tracksController.jumpTo(0);
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

    searchUserSongs() {
        fetch(SONGS_FILE_URL)
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else {
                    throw new Error("Error while loading songs");
                }
            })
            .then((songFile) => {
                let songs = songFile.songs;
                let predefinedUser = this.app.projectController.predefinedUser;
                if (predefinedUser !== "") {
                    // switch to user mode if a user is defined (before set to true because of the switchMode() function)
                    this.advancedMode = true;
                    this.switchMode();
                    let users = songFile.users;
                    let user = users.find((u: any) => { return u.name === predefinedUser });
                    if (user) {
                        songs = songs.filter((song: any) => { return user.songs.includes(song.id) });
                    }
                    else {
                        console.warn("User " + predefinedUser + " not found");
                        this.app.projectController.predefinedUser = "";
                        alert("User " + predefinedUser + " not found, redirecting to home page");
                        window.location.replace("/");
                    }
                }
                this.defineSongs(songs);
            })
    }

    defineSongs(songs: any[]) {
        songs.forEach((song) => {
            let name = song.name;
            let el = this.hostView.createNewSongItem(name);
            el.onclick = async () => {
                if (!this.app.projectController.saved) {
                    this.app.projectController.openConfirm(
                        "If you open a new project, you will lose all your unsaved changes. Do you want to continue ?",
                        async () => {
                            await this.app.tracksController.openSong(song, name);
                            this.app.projectController.saved = false;
                        },
                        () => { }
                    )
                }
                else {
                    await this.app.tracksController.openSong(song, name);
                    this.app.projectController.saved = false;
                }
            }
        })
    }

    defineMenuListeners() {
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
        this.app.hostView.login.onclick = async () => {
            await this.app.projectController.openLogin();
        }
        this.app.hostView.syncPresets.onclick = async () => {
            await this.app.presetsController.syncPresets();
        }
        this.app.hostView.exportProject.onclick = () => {
            this.app.projectController.openExportProject();
            // let project = await this.app.loader.saveProject();
            // let date = new Date().toISOString().slice(0, 10);
            // let fileName = `WAM-Project_${date}.json`;
            // let blob = new Blob([JSON.stringify(project)], {type: "application/json"});
            // let url = URL.createObjectURL(blob);
            // let a = document.createElement("a");
            // a.href = url;
            // a.download = fileName;
            // a.click();
            // a.remove();
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
        this.app.hostView.switchMode.onclick = () => {
            this.switchMode();
        }
        this.app.hostView.presetsBtn.onclick = () => {
            this.app.presetsController.updateGlobalPresetList();
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
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        if (this.playing) {
            this.app.tracksController.trackList.forEach((track) => {
                //@ts-ignore
                track.node.parameters.get("playing").value = 0;
                clearInterval(this.timerInterval!!);
            });
            //@ts-ignore
            this.app.host.hostNode.parameters.get("playing").value = 0;
        }
        else {
            this.app.tracksController.trackList.forEach(async (track) => {
                //@ts-ignore
                track.node.parameters.get("playing").value = 1;
            });
            //@ts-ignore
            this.app.host.hostNode.parameters.get("playing").value = 1;
        }
        this.playing = !this.playing;
        this.hostView.pressPlayButton(this.playing);
    }

    stop() {
        if (this.app.host.node) {
            // @ts-ignore
            this.app.host.node.parameters.get("playing").value = 0;
            this.app.host.node?.port.postMessage({playhead: 0});
        }
        this.app.tracksController.trackList.forEach(async (track) => {
            //@ts-ignore
            track.node.parameters.get("playing").value = 0;
            track.node?.port.postMessage({playhead: 0});
        });
    }

    play() {
        // @ts-ignore
        this.app.host.hostNode.parameters.get("playing").value = 0;
        this.app.tracksController.trackList.forEach(async (track) => {
            //@ts-ignore
            track.node.parameters.get("playing").value = 1;
        });
    }

    switchMode() {
        this.advancedMode = !this.advancedMode;
        localStorage.setItem('advancedMode', this.advancedMode.toString());
        this.switchToAdvancedMode();
    }

    switchToAdvancedMode() {
        console.log("Swithing mode ", this.advancedMode);
        let advanced = document.getElementsByClassName('advanced');
        for (let element of advanced) {
            if (this.advancedMode) {
                // element.removeAttribute('hidden')
                element.setAttribute('style', '');
            }
            else {
                // element.setAttribute('hidden', "")
                element.setAttribute('style', 'display: none;');
            }
        }
        for (let track of this.app.tracksController.trackList) {
            track.element.switchMode(this.advancedMode);
        }
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