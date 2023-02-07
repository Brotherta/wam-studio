import ControlElement from "./Components/ControlElement";


export default class ControlsView {

    controlsContainer = document.getElementById("special-controls-container") as HTMLDivElement;

    addControl(control: ControlElement) {
        this.controlsContainer.appendChild(control);
    }

    removeControl(trackId: number) {
        let control = document.getElementById("control-" + trackId) as ControlElement;
        control.remove();
    }

}