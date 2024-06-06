import TrackElement from "../Components/TrackElement";
import TrackOf from "../Models/Track/Track.js";

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

    /**
     * Changes the color of a track.
     * @param track - The track to change the color.
     */
    public changeColor(track: TrackOf<any>): void {
        let newColor = this.getRandomColor();
        track.color = newColor;
        track.element.color.style.background = newColor;
    }

    /**
     * Sets the color of a track.
     * @param track - The track to change the color.
     * @param color - The new color.
     */
    public setColor(track: TrackOf<any>, color: string): void {
        track.color = color;
        track.element.color.style.background = color;
    }

    /**
     * Gets a random color in string format.
     * @return {string} - The random color.
     * @private
     */
    private getRandomColor(): string {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}