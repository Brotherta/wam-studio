import TrackElement from "../Components/TrackElement";
import Track from "../Models/Track";
import {SongTagEnum} from "../Utils/SongTagEnum";

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
        let icon = "other";
        switch (track.tag) {
            case SongTagEnum.LEAD_VOCAL:
                color = "#BDB2FF";
                icon = "lead-vocal";
                break;
            case SongTagEnum.BACKING_VOCAL:
                color = "#FFC6FF";
                icon = "lead-vocal";
                break;
            case SongTagEnum.ELECTRIC_GUITAR:
                color = "#94D2BD";
                icon = "electric-guitar";
                break;
            case SongTagEnum.ACOUSTIC_GUITAR:
                color = "#0A9396";
                icon = "acoustic-guitar";
                break;
            case SongTagEnum.BASS:
                color = "#005F73";
                icon = "bass";
                break;
            case SongTagEnum.DRUMS:
                color = "#9B2226";
                icon = "drums";
                break;
            case SongTagEnum.PIANO:
                color = "#036666";
                icon = "piano";
                break;
            case SongTagEnum.SYNTH:
                color = "#248277";
                icon = "synth";
                break;
            case SongTagEnum.STRINGS:
                color = "#56AB91";
                icon = "strings";
                break;
            case SongTagEnum.BRASS:
                color = "#88D4AB";
                icon = "brass";
                break;
            case SongTagEnum.SNARES:
                color = "#BB3E03";
                icon = "snares";
                break;
            case SongTagEnum.KICKS:
                color = "#AE2012";
                icon = "kicks";
                break;
            case SongTagEnum.OTHER:
                color = "#001219";
                icon = "other";
                break;
        }
        // let newColor = getRandomColor();
        track.color = color;
        track.element.color.style.background = color;
        track.element.instrumentIcon.className = icon;
    }
}