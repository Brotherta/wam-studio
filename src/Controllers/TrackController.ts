import Track from "../Models/Track";
import TrackView from "../Views/TrackView";
import App from "../App";

export default class TrackController {
    
    app: App;
    trackView: TrackView;

    constructor(app: App) {
        this.app = app;
        this.trackView = this.app.trackView;

        this.defineNewtrackCallback();
    }

    defineNewtrackCallback() {
        this.trackView.newTrackDiv.onclick = () => {
            // this.addNewTrack();
        }
    }

    // addNewTrack() {
    //     let track = this.app.audios.newTrack();
    //     this.trackView.addTrack(track.element);
    //     this.trackView.changeColor(track);
    //     this.defineTrackListener(track);
    // }

    addNewTrackInit(track: Track) {
        this.trackView.addTrack(track.element);
        this.trackView.changeColor(track);
        this.defineTrackListener(track); 
    }

    addNewTrackList(tracks: Track[]) {
        for (const track in tracks) {
            if (Object.prototype.hasOwnProperty.call(tracks, track)) {
                const element = tracks[track];
                
                this.app.trackController.addNewTrackInit(element);
                this.app.canvasController.addWaveFormToTrack(element);
            }
        }
    }

    removeTrack(track: Track) {
        this.trackView.removeTrack(track.element);
        this.app.audios.removeTrack(track);
        this.app.canvasController.removeWafeFormOfTrack(track);
    }

    defineTrackListener(track: Track) {
        track.element.closeBtn.onclick = () => {
            this.removeTrack(track);
        }

        track.element.soloBtn.onclick = () => {
            track.isSolo = !track.isSolo;

            if (track.isSolo) {
                this.app.audios.setSolo(track);
                track.element.solo();
            }
            else {
                this.app.audios.unsetSolo(track);
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
            console.log("Volume change: TODO");
        }

        track.element.balanceSlider.oninput = () => {
            console.log("Balance change: TODO");
        }

        track.element.color.onclick = () => {
            this.trackView.changeColor(track);
        }
    }

}