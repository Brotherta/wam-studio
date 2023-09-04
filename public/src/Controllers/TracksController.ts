import Track from "../Models/Track";
import TracksView from "../Views/TracksView";
import App from "../App";
import {audioCtx} from "../index";
import WamEventDestination from "../Audio/WAM/WamEventDestination";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import TrackElement from "../Components/TrackElement";
import Plugin from "../Models/Plugin";
import {BACKEND_URL, RATIO_MILLS_BY_PX} from "../Env";

/**
 * Class that controls the tracks view. It creates, removes and manages the tracks. It also defines the listeners for the tracks.
 */
export default class TracksController {
    
    /**
     * The app instance.
     */
    private _app: App;
    /**
     * The tracks view instance.
     */
    private _view: TracksView;
    
    /**
     * The account of tracks' id.
     */
    public trackIdCount: number;
    /**
     * The list of tracks.
     */ 
    public trackList: Track[];

    constructor(app: App) {
        this._app = app;
        this._view = app.tracksView;
        this.trackIdCount = 1;
        this.trackList = [];

        this.bindEvents();
    }

    /**
     * Initializes the track view with the given track.
     * It also initializes the waveforms and the automations.
     * 
     * @param track - The track to be initialized.
     */
    public initializeTrack(track: Track): void {
        this._view.addTrack(track.element);
        this._view.changeColor(track);
        this.bindTrackEvents(track);
        this._app.recorderController.clickMode(track);

        this._app.automationView.initializeAutomation(track.id);
        this._app.waveformController.initializeWaveform(track);
    }

    /**
     * Removes a track from the track view. It also removes the track from the audio controller.
     * 
     * @param track - Track to be removed from the track view.
     */
    public removeTrack(track: Track): void {
        track.deleted = true; // Used to stop the track to be loaded on xhr request
        this._app.pluginsController.removePedalBoard(track);
        this._view.removeTrack(track.element);
        this._app.tracksController.deleteTrack(track);
        this._app.waveformController.removeWaveformOfTrack(track);
        this._app.automationView.removeAutomationBpf(track.id);
        track.deleted = true;
    }

    

    /**
     * Gets the track with the given id.
     * @param trackId - The id of the track.
     * @returns the track with the given id if it exists, undefined otherwise.
     */
    public getTrackById(trackId: number): Track | undefined {
        return this.trackList.find(track => track.id === trackId);
    }

    /**
     * Clears all tracks.
     * It removes all tracks from the track list and disconnects the audio nodes.
     */
    public clearAllTracks(): void {
        for (let track of this.trackList) {
            this._app.pluginsController.removePedalBoard(track);
            this._view.removeTrack(track.element);
            this._app.waveformController.removeWaveformOfTrack(track);
            this._app.automationView.removeAutomationBpf(track.id);
            track.node!.removeAudio();
            track.node!.disconnectEvents();
            track.node!.disconnect();
        }
        this.trackList = [];
    }

    /**
     * Creates a new empty track. It creates the audio node and the track.
     * 
     * @param url - The url of the track.
     * @returns the created track
     */
    public async newEmptyTrack(url?: string): Promise<Track> {
        let wamInstance = await WamEventDestination.createInstance(this._app.host.hostGroupId, audioCtx);
        let node = wamInstance.audioNode as WamAudioWorkletNode;

        let track = this.createTrack(node);
        if (url) {
            let urlSplit = url.split("/");
            track.element.name = urlSplit[urlSplit.length - 1];
        } else {
            track.element.name = `Track ${track.id}`;
        }
        return track;
    }

    /**
     * Creates the track with the given file. It verifies the type of the file and then create the track.
     *
     * It returns undefined if the file is not an audio file and if the duration of the file is too long.
     *
     * @param file - The file to create the track.
     */
    public async newTrackWithFile(file: File): Promise<Track | undefined> {
        if (file.type === "audio/ogg" || file.type === "audio/wav" || file.type === "audio/mpeg" || file.type === "audio/x-wav") {
            let wamInstance = await WamEventDestination.createInstance(this._app.host.hostGroupId, audioCtx);
            let node = wamInstance.audioNode as WamAudioWorkletNode;

            let audioArrayBuffer = await file.arrayBuffer();
            let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
            let operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;
            operableAudioBuffer = operableAudioBuffer.makeStereo();

            node.setAudio(operableAudioBuffer.toArray());

            let track = this.createTrack(node);
            track.setAudioBuffer(operableAudioBuffer);
            track.element.name = file.name;
            return track;
        }
        else {
            console.warn("File type not supported");
            return undefined;
        }
    }

    /**
     * Jumps audio to the given position in px.
     *
     * @param pos - The position in px
     */
    public jumpTo(pos: number): void {
        this._app.host.playhead = (pos * RATIO_MILLS_BY_PX) /1000 * audioCtx.sampleRate
        this.trackList.forEach((track) => {
            track.node!.port.postMessage({playhead: this._app.host.playhead+1})
        });

        this._app.host.hostNode?.port.postMessage({playhead: this._app.host.playhead+1});
    }

    /**
     * Bind the events of the track view.
     * @private
     */ 
    private bindEvents(): void {
        this._view.newTrackDiv.addEventListener('click', () => {
            this._app.tracksController.newEmptyTrack()
                .then(track => {
                    this.initializeTrack(track);
                    track.element.progressDone();
                });
        });
    }

    /**
     * Binds all events of the given track. It defines the listeners for the close, solo, mute, volume and balance sliders etc.
     * 
     * @param track - Track to be binded.
     * @private
     */
    private bindTrackEvents(track: Track): void {
        track.element.addEventListener("click", () => { // Select the track when it is clicked.
            if (!track.deleted) {
                this._app.pluginsController.selectTrack(track);
            }
        })
        track.element.closeBtn.addEventListener('click', () => { // Remove the track when the close button is clicked.
            this.removeTrack(track);
        });
        track.element.soloBtn.addEventListener('click', () => { // Solo the track when the solo button is clicked.
            this.solo(track);
        });
        track.element.muteBtn.addEventListener('click', () => { // Mute the track when the mute button is clicked.
           this.mute(track);
        });
        track.element.volumeSlider.addEventListener('input', () => { // Change the volume of the track when the volume slider is changed.
            track.setVolume(parseInt(track.element.volumeSlider.value) / 100);
        });
        track.element.balanceSlider.addEventListener('input', () => { // Change the balance of the track when the balance slider is changed.
            track.setBalance(parseFloat(track.element.balanceSlider.value));
        });
        track.element.color.addEventListener('click', () => { // Change the color of the track when the color button is clicked.
            this.changeColor(track);
        });
        track.element.automationBtn.addEventListener('click',  async (e) => { // Open the automation menu when the automation button is clicked.
            this.automationMenu(e, track);
        });
        track.element.armBtn.addEventListener('click', () => { // Arm the track when the arm button is clicked.
            this._app.pluginsController.selectTrack(track);
            this._app.recorderController.clickArm(track);
        });
        track.element.monitoringBtn.addEventListener('click', () => { // Change the monitoring of the track when the monitoring button is clicked.
            this._app.pluginsController.selectTrack(track);
            this._app.recorderController.clickMonitoring(track);
        });
        track.element.modeBtn.addEventListener('click', () => { // Change the mode of the track when the mode button is clicked.
            this._app.pluginsController.selectTrack(track);
            this._app.recorderController.clickMode(track);
        });
        track.element.leftBtn.addEventListener('click', () => {
            this._app.pluginsController.selectTrack(track);
            this._app.recorderController.clickLeft(track);
        });
        track.element.rightBtn.addEventListener('click', () => { 
            this._app.pluginsController.selectTrack(track);
            this._app.recorderController.clickRight(track);
        });
        track.element.mergeBtn.addEventListener('click', () => { 
            this._app.pluginsController.selectTrack(track);
            this._app.recorderController.clickMerge(track);
        });
        track.element.fxBtn.addEventListener('click', () => { // Open the fx menu when the fx button is clicked.
            this._app.pluginsController.fxButtonClicked(track);
        });
    }

    /**
     * Handles the automation button of the given track.
     * @param track - The track to open the automation menu.
     * @private
     */
    private async automationMenu(e: Event, track: Track): Promise<void> {
        this._app.pluginsController.selectTrack(track);
        await this._app.automationController.openAutomationMenu(track);
        e.stopImmediatePropagation();
    }

    /**
     * Handles the color button of the given track.
     * @param track - The track to change the color.
     * @private
     */ 
    private changeColor(track: Track): void {
        this._app.pluginsController.selectTrack(track);
        this._view.changeColor(track);
        this._app.editorView.changeWaveFormColor(track);
    }

    /**
     * Handles the mute button of the given track.
     * @param track - The track to mute.
     * @private
     */
    private mute(track: Track): void {
        this._app.pluginsController.selectTrack(track);
        if (track.muted) {
            track.unmute();
            track.element.unmute();
        }
        else {
            track.mute();
            track.element.mute();
        }
        track.muted = !track.muted;
    }

    /**
     * Handles the solo button of the given track.
     * @param track - The track to solo.
     * @private
     */
    private solo(track: Track): void {
        this._app.pluginsController.selectTrack(track);
        track.solo = !track.solo;

        if (track.solo) { // Solo the track

            this.trackList.forEach((other) => { // Mute all other tracks except the soloed one
                if (other !== track && !other.solo) {
                    other.muteSolo();
                }
            });
            if (!track.muted) { // Unmute the soloed track if it is not muted
                track.unmute();
            }
            track.element.solo();
        }
        else {  // Un-solo the track
            let otherSolo = false; // Check if there is another soloed track

            this.trackList.forEach(other => {
                if (other.solo) {
                    otherSolo = true;
                }
            });

            if (!otherSolo) { // Unmute all tracks if there is no other soloed track
                this.trackList.forEach(other => {
                    if (!other.solo) {
                        if (other.muted) {
                            other.muteSolo();
                        }
                        else {
                            other.unmute();
                        }
                    }
                });
            } else { // Else only unmute the track.
                track.muteSolo();
            }

            track.element.unsolo();
        }
    }

    /**
     * Creates a new TracksView with the given audio node. Initializes the audio nodes and the canvas.
     *
     * @param node - The audio node of the track.
     * @returns the created track
     * @private
     */
    private createTrack(node: WamAudioWorkletNode): Track {
        let trackElement = document.createElement("track-element") as TrackElement;
        trackElement.trackId = this.trackIdCount;

        let track = new Track(this.trackIdCount, trackElement, node);
        track.plugin  = new Plugin(this._app);
        track.gainNode.connect(this._app.host.gainNode);

        this.trackList.push(track);

        this.trackIdCount++;
        return track;
    }

    /**
     * Removes the given track from the track list and disconnects the audio node.
     *
     * @param track - The track to remove
     * @private
     */
    private deleteTrack(track: Track): void {
        let trackIndex = this.trackList.indexOf(track);
        this.trackList.splice(trackIndex, 1);
        track.node!.removeAudio();
        track.node!.disconnectEvents();
        track.node!.disconnect();
    }
}
