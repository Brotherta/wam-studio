import TrackControlElement from "../Components/TrackControlElement";


export default class TrackControlView {

    controlsContainer = document.getElementById("special-controls-container") as HTMLDivElement;
    advancedWindow = document.getElementById("advanced-window") as HTMLDivElement;
    advancedMount = document.getElementById("advanced-mount") as HTMLDivElement;
    closeAdvancedBtn = document.getElementById("advanced-close-button") as HTMLButtonElement;
    advancedTitle = document.getElementById("advanced-title") as HTMLDivElement;

    constructor() {
        this.closeAdvancedBtn.onclick = () => this.closeAdvanced();
    }

    showAdvancedWindow() {
        this.advancedMount.innerHTML = "";
        this.advancedWindow.hidden = false;
    }

    addControl(control: TrackControlElement) {
        this.controlsContainer.appendChild(control);
    }

    removeControl(trackId: number) {
        let control = document.getElementById("control-" + trackId) as TrackControlElement;
        control.remove();
    }

    closeAdvanced() {
        this.advancedWindow.hidden = true;
    }

}