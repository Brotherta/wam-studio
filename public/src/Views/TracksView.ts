import TrackElement from "../Components/TrackElement";

/**
 * Class that is responsible for the view of the tracks.
 * It is responsible for adding and removing tracks from the track view.
 */
export default class TracksView {

    trackContainerDiv: HTMLDivElement = document.getElementById("track-container") as HTMLDivElement;
    newTrackDiv: HTMLDivElement = document.getElementById("new-track") as HTMLDivElement;

    /**
     * Adds a track to the track view.
     * @param trackElement
     */
    public addTrack(trackElement: TrackElement): void {
        this.trackContainerDiv.insertBefore(trackElement, this.newTrackDiv);
    }

    /**
     * Removes a track from the track view.
     * @param el - The track to remove.
     */
    public removeTrack(el: TrackElement): void {
        el.remove();
    }
}