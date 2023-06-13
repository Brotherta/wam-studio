import TrackElement from "../Components/TrackElement";
import Track from "../Models/Track";
import {SongTagEnum} from "../Utils/SongTagEnum";

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Class that is responsible for the view of the tracks.
 * It is responsible for adding and removing tracks from the track view.
 */
export default class TracksView {

    trackContainerDiv: HTMLDivElement = document.getElementById("track-container") as HTMLDivElement;
    newTrackDiv: HTMLDivElement = document.getElementById("new-track") as HTMLDivElement;

    constructor() {
        // TODO
    }

    /**
     * Add a track to the track view.
     * @param trackElement
     */
    addTrack(trackElement: TrackElement) {
        this.trackContainerDiv.insertBefore(trackElement, this.newTrackDiv);
    }

    /**
     * Remove a track from the track view.
     * @param el
     */
    removeTrack(el: TrackElement) {
        el.remove();
    }

    /**
     * Change the color of a track.
     * @param track
     */
    changeColor(track: Track) {
        let color = "#000000";
        switch (track.tag) {
            case SongTagEnum.LEAD_VOCAL:
                color = "#BDB2FF";
                break;
            case SongTagEnum.BACKING_VOCAL:
                color = "#FFC6FF";
                break;
            case SongTagEnum.ELECTRIC_GUITAR:
                color = "#94D2BD";
                break;
            case SongTagEnum.ACOUSTIC_GUITAR:
                color = "#0A9396";
                break;
            case SongTagEnum.BASS:
                color = "#005F73";
                break;
            case SongTagEnum.DRUMS:
                color = "#9B2226";
                break;
            case SongTagEnum.PIANO:
                color = "#036666";
                break;
            case SongTagEnum.SYNTH:
                color = "#248277";
                break;
            case SongTagEnum.STRINGS:
                color = "#56AB91";
                break;
            case SongTagEnum.BRASS:
                color = "#88D4AB";
                break;
            case SongTagEnum.SNARES:
                color = "#BB3E03";
                break;
            case SongTagEnum.KICKS:
                color = "#AE2012";
                break;
            case SongTagEnum.OTHER:
                color = "#001219";
                break;
        }
        // let newColor = getRandomColor();
        track.color = color;
        track.element.color.style.background = color;
    }
}