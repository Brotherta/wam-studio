import ControlElement from "../Views/Components/ControlElement";


export default class ControlsController {

    trackId: number;
    element: ControlElement;

    constructor(trackId: number, element: ControlElement) {
        this.trackId = trackId;
        this.element = element;
    }
}