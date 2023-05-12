import TrackBindElement from "../Components/Binds/TrackBindElement";
import Track from "../Models/Track";
import AdvancedElement from "../Components/Binds/AdvancedElement";


export default class BindsView {

    controlsContainer = document.getElementById("special-controls-container") as HTMLDivElement;
    advancedWindow = document.getElementById("advanced-window") as HTMLDivElement;
    advancedMount = document.getElementById("advanced-mount") as HTMLDivElement;
    closeAdvancedBtn = document.getElementById("advanced-close-button") as HTMLButtonElement;
    advancedTitle = document.getElementById("advanced-title") as HTMLDivElement;
    loadingZone = document.getElementById("loading-zone") as HTMLDivElement;

    currentAdvancedElement: AdvancedElement | null = null;

    constructor() {
        this.closeAdvancedBtn.onclick = () => this.hideAdvancedWindow();
        this.advancedWindow.hidden = true;
    }

    showAdvancedWindow(track: Track) {
        if (this.currentAdvancedElement !== track.bindControl.advElement) {
            if (this.currentAdvancedElement !== null) {
                this.loadingZone.appendChild(this.currentAdvancedElement);
            }
            this.currentAdvancedElement = track.bindControl.advElement;
            this.advancedTitle.innerText = "Advanced Settings - " + track.element.name + " - type : " + track.bindControl.tag;
            this.advancedMount.appendChild(this.currentAdvancedElement)
        }
        this.advancedWindow.hidden = false;
    }

    hideAdvancedWindow() {
        this.advancedWindow.hidden = true;
    }

    addTrackBindElement(trackBindElement: TrackBindElement) {
        this.controlsContainer.appendChild(trackBindElement);
    }

    removeTrackBindElement(trackId: number) {
        let element = document.getElementById("track-bind-" + trackId);
        if (element !== null) {
            element.remove();
        }
    }

    reorderControls(track: Track[]) {
        this.controlsContainer.innerHTML = "";
        let tracks = track.sort((a, b) => a.id - b.id);
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            this.controlsContainer.appendChild(track.bindControl.trackBindElement);
        }
    }
}