import TrackControlElement from "../Components/TrackControlElement";
import TrackControl from "../Models/TrackControl";


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

    reorderControls(controls: TrackControl[]) {
        this.controlsContainer.innerHTML = "";
        controls = controls.sort((a, b) => a.trackId - b.trackId);
        for (let i = 0; i < controls.length; i++) {
            const control = controls[i];
            this.controlsContainer.appendChild(control.controlElement);
        }
    }

    hideAllAdvanced() {
        for (let i = 0; i < this.advancedMount.children.length; i++) {
            const element = this.advancedMount.children[i] as HTMLDivElement;
            element.hidden = true;
        }
    }
}