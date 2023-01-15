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

export default class TracksView {

    trackContainerDiv: HTMLDivElement = document.getElementById("track-container") as HTMLDivElement;
    newTrackDiv: HTMLDivElement = document.getElementById("new-track") as HTMLDivElement;

    constructor() {
        // TODO
    }

    addTrack(trackElement: TrackElement) {
        this.trackContainerDiv.insertBefore(trackElement, this.newTrackDiv);
    }

    removeTrack(el: TrackElement) {
        el.remove();
    }

    changeColor(track: Track) {
        let newColor = getRandomColor();
        track.color = newColor;
        track.element.color.style.background = newColor;
    }
}