import Track from "../Models/Track";
import TracksView from "../Views/TracksView";
import App from "../App";
import Host from "../Models/Host";
import {audioCtx} from "../index";

/**
 * Controller for the track view. This controller is responsible for adding and removing tracks from the track view.
 */
export default class TracksController {
    
    app: App;
    tracksView: TracksView;

    constructor(app: App) {
        this.app = app;
        this.tracksView = this.app.tracksView;

        this.defineNewTrackCallback();
    }

    defineNewTrackCallback() {
        this.tracksView.newTrackDiv.addEventListener('click', () => {
            this.app.tracks.newEmptyTrack()
                .then(track => {
                    this.initTrackComponents(track);
                });
        });
    }

    /**
     * It adds a new track to the track view. the color of the track is also changed.
     * It also defines the listeners for the track.
     * 
     * @param track Track to be added to the track view.
     */
    addNewTrackInit(track: Track) {
        this.tracksView.addTrack(track.element);
        this.tracksView.changeColor(track);
        this.defineTrackListener(track);
        track.element.switchMode(this.app.hostController.advancedMode);
    }

    /**
     * Used to add a list of tracks to the track view. It calls the addNewTrackInit() for each track.
     * 
     * @param tracks List of tracks to be added to the track view.
     */
    addNewTrackList(tracks: Track[]) {
        for (const track in tracks) {
            if (Object.prototype.hasOwnProperty.call(tracks, track)) {
                const element = tracks[track];
                this.initTrackComponents(element);
            }
        }
    }

    async initTrackComponents(track: Track) {
        await track.plugin.initPlugin(this.app.host.pluginWAM);
        document.getElementById("loading-zone")!.appendChild(track.plugin.dom);
        this.app.tracksController.connectPlugin(track);

        this.app.tracksController.addNewTrackInit(track);
        this.app.automationView.addAutomationBpf(track.id);
        this.app.waveFormController.addWaveformToTrack(track);
        // this.app.trackControlController.addTrackControl(track);
        this.app.recorderController.addRecordListener(track);
        this.app.bindsController.addBindListener(track);
    }

    /**
     * Removes a track from the track view. It also removes the track from the audio controller.
     * 
     * @param track Track to be removed from the track view.
     */
    removeTrack(track: Track) {
        this.app.pluginsController.removePlugins(track);
        this.tracksView.removeTrack(track.element);
        this.app.tracks.removeTrack(track);
        this.app.bindsController.removeBindControl(track);
        this.app.waveFormController.removeWaveformOfTrack(track);
        this.app.automationView.removeAutomationBpf(track.id);
    }

    /**
     * Defines the listeners for the track. It defines the listeners for the close, solo, mute, volume and balance sliders.
     * @param track
     */
    defineTrackListener(track: Track) {
        track.element.addEventListener("click", () => {
            if (!track.removed) {
                this.app.pluginsController.selectTrack(track);
                if (!this.app.bindsView.advancedWindow.hidden) {
                    if (track.bindControl.advElement.firstOpen) {
                        this.app.presetsController.refreshPresetList(track.tag);
                        track.bindControl.advElement.selectPreset("Default");
                        track.bindControl.advElement.firstOpen = false;
                    }
                    this.app.bindsView.showAdvancedWindow(track);
                }
            }
        })

        track.element.closeBtn.onclick = () => {
            track.removed = true;
            this.removeTrack(track);
        }

        track.element.soloBtn.onclick = () => {
            track.isSolo = !track.isSolo;

            if (track.isSolo) {
                this.app.tracks.setSolo(track);
                track.element.solo();
            }
            else {
                this.app.tracks.unsetSolo(track);
                track.element.unsolo();
            }
        }

        track.element.muteBtn.onclick = () => {
            if (track.isMuted) {
                track.unmute();
                track.element.unmute();
            }
            else {
                track.mute();
                track.element.mute();
            }
            track.isMuted = !track.isMuted;
        }

        track.element.volumeSlider.oninput = () => {
            let value = parseInt(track.element.volumeSlider.value) / 100;
            track.setVolume(value);
        }

        track.element.balanceSlider.oninput = () => {
            let value = parseFloat(track.element.balanceSlider.value);
            track.setBalance(value);
        }

        track.element.color.onclick = () => {
            this.tracksView.changeColor(track);
            this.app.editorView.changeWaveFormColor(track);
        }
        track.element.automationBtn.onclick = async (e) => {
            await this.app.automationController.openAutomationMenu(track);
            e.stopImmediatePropagation();
        }
        track.element.armBtn.onclick = () => {
            this.app.recorderController.clickArm(track);
        }
        track.element.settingsBtn.onclick = () => {
            if (track.bindControl.advElement.firstOpen) {
                this.app.presetsController.refreshPresetList(track.tag);
                track.bindControl.advElement.selectPreset("Default");
                track.bindControl.advElement.firstOpen = false;
            }
            this.app.bindsView.showAdvancedWindow(track);
        }
    }

    /**
     * Connects the plugin to the track. If the track is the host, it connects the plugin to the host gain node.
     * @param track
     */
    connectPlugin(track: Track) {
        if (track.id === -1) {
            let host = track as Host;
            host.gainNode.disconnect(audioCtx.destination);
            host.gainNode
                .connect(host.plugin.instance!._audioNode)
                .connect(host.audioCtx.destination);
        }
        else {
            track.node!.disconnect(track.pannerNode);
            track.node!
                .connect(track.plugin.instance!._audioNode)
                .connect(track.pannerNode);
        }
    }

    /**
     * Disconnects the plugin from the track. If the track is the host, it disconnects the plugin from the host gain node.
     * @param track
     */
    disconnectPlugin(track: Track) {
        if (track.plugin.initialized && track.id === -1) {
            let host = track as Host;
            host.gainNode.disconnect(host.plugin.instance!._audioNode);
            host.gainNode.connect(host.audioCtx.destination);
        }
        else if (track.plugin.initialized) {
            track.node!.disconnect(track.plugin.instance!._audioNode);
            track.node!.connect(track.pannerNode);
        }
    }

    clearAllTracks() {
        for (let track of this.app.tracks.trackList) {
            this.app.pluginsController.removePlugins(track);
            this.tracksView.removeTrack(track.element);
            this.app.bindsController.removeBindControl(track);
            this.app.waveFormController.removeWaveformOfTrack(track);
            this.app.automationView.removeAutomationBpf(track.id);
            track.node!.removeAudio();
            track.node!.disconnectEvents();
            track.node!.disconnect();
        }
        this.app.tracks.trackList = [];
    }

    openSong(song:any, name: string) {
        this.app.tracksController.clearAllTracks();
        this.app.hostView.headerTitle.innerHTML = name;
        this.app.hostController.maxTime = 0;
        for (let trackSong of song.songs) {
            this.app.tracks.newTrackUrl(trackSong)
                .then(async track => {
                    if (track !== undefined) {
                        await this.app.tracksController.initTrackComponents(track);
                        this.app.hostController.maxTime = Math.max(this.app.hostController.maxTime, track.audioBuffer!.duration*1000);
                    }
                });
        }

        this.app.bindsView.reorderControls(this.app.tracks.trackList);
    }
}