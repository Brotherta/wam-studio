import TrackElement from "../Components/TrackElement";
import Track from "../Models/Track";

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
        let newColor = getRandomColor();
        track.color = newColor;
        track.element.color.style.background = newColor;
    }

    reorderTracks(trackList: Track[]) {
        for (let node of this.trackContainerDiv.childNodes) {
            if (node instanceof TrackElement) {
                node.remove();
            }
        }
        trackList = trackList.sort((a, b) => a.id - b.id);
        for (let i = 0; i < trackList.length; i++) {
            const track = trackList[i];
            this.addTrack(track.element);
        }
    }
}