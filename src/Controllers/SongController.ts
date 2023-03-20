import App from "../App";
import HostView from "../Views/HostView";


export default class SongController {

    app: App;
    hostView: HostView;

    constructor(app: App) {
        this.app = app;
        this.hostView = this.app.hostView;
        this.defineSongs();
    }

    defineSongs() {
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
}