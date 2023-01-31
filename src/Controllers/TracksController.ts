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

        this.defineNewtrackCallback();
    }

    defineNewtrackCallback() {
        this.tracksView.newTrackDiv.onclick = () => {
            // this.addNewTrack();
        }
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
                
                this.app.tracksController.addNewTrackInit(element);
                this.app.editorController.addWaveFormToTrack(element);
            }
        }
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
        this.app.editorController.removeWafeFormOfTrack(track);
    }

    defineTrackListener(track: Track) {
        track.element.addEventListener("click", () => {
            if (!track.removed) {
                this.app.pluginsController.selectTrack(track);
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
    }

    connectPlugin(track: Track) {
        if (track.id === -1) {
            let host = track as Host;
            host.gainNode.disconnect(audioCtx.destination);
            host.gainNode
                .connect(host.plugin.instance!._audioNode)
                .connect(host.audioCtx.destination);
        }
        else {
            track.node.disconnect(track.pannerNode);
            track.node
                .connect(track.plugin.instance!._audioNode)
                .connect(track.pannerNode);
        }
    }

    disconnectPlugin(track: Track) {
        if (track.plugin.initialized && track.id === -1) {
            let host = track as Host;
            host.gainNode.disconnect(host.plugin.instance!._audioNode);
            host.gainNode.connect(host.audioCtx.destination);
        }
        else if (track.plugin.initialized) {
            track.node.disconnect(track.plugin.instance!._audioNode);
            track.node.connect(track.pannerNode);
        }
    }
}