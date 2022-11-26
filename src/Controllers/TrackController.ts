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
            }
        }
    }

    removeTrack(track: Track) {
        this.trackView.removeTrack(track.element);
        this.app.audios.removeTrack(track);
    }

    defineTrackListener(track: Track) {
        track.element.closeBtn.onclick = () => {
            this.removeTrack(track);
        }

        track.element.soloBtn.onclick = () => {
            console.log("Solo btn: TODO");
        }

        track.element.muteBtn.onclick = () => {
            console.log("Mute btn: TODO");
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