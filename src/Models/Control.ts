import ControlElement from "../Views/Components/ControlElement";
import AdvancedElement from "../Views/Components/AdvancedElement";


export default class Control {

    trackId: number;
    controlElement: ControlElement;
    advancedElement: AdvancedElement;

    constructor(trackId: number, element: ControlElement, advancedElement: AdvancedElement) {
        this.trackId = trackId;
        this.controlElement = element;
        this.advancedElement = advancedElement;
    }


}