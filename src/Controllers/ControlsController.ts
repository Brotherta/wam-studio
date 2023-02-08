import App from "../App";
import Control from "../Models/Control";
import Track from "../Models/Track";
import ControlElement from "../Views/Components/ControlElement";
import AdvancedElement from "../Views/Components/AdvancedElement";


export default class ControlsController {

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    addSpecialControlToTrack(track: Track) {
        let controlElement = document.createElement('control-element') as ControlElement;
        controlElement.trackId = track.id;
        controlElement.id = "control-" + track.id;

        let advancedElement = document.createElement('advanced-element') as AdvancedElement;
        advancedElement.id = "advanced-" + track.id;

        let control = new Control(track.id, controlElement, advancedElement);
        this.app.controls.addControl(control);
        this.app.controlsView.addControl(control.controlElement);
    }

    removeSpecialControlFromTrack(track: Track) {
        this.app.controls.removeControl(track.id);
        this.app.controlsView.removeControl(track.id);
        this.app.controlsView.closeAdvanced();
    }
}