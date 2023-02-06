import App from "../App";
import SpecialsControls from "../Models/Controls";
import Track from "../Models/Track";
import ControlElement from "../Views/Components/ControlElement";


export default class ControlsController {

    app: App;
    controls: SpecialsControls[];

    constructor(app: App) {
        this.app = app;
        this.controls = [];
    }

    addSpecialControlToTrack(track: Track) {
        let element = document.createElement('control-element') as ControlElement;
        element.trackId = track.id;
        element.id = "control-" + track.id;
        let control = new SpecialsControls(track.id, element);
        this.controls.push(control);

    }

    removeSpecialControlFromTrack(track: Track) {
        let index = this.controls.findIndex(control => control.trackId === track.id);
        this.controls.splice(index, 1);
    }


}