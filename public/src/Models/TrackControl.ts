import TrackControlElement from "../Components/TrackControlElement";
import AdvancedControlElement from "../Components/AdvancedControlElement";
import Bind from "./Bind";


export default class TrackControl {

    trackId: number;
    controlElement: TrackControlElement;
    advancedElement: AdvancedControlElement;

    binds: Bind[];

    constructor(trackId: number, element: TrackControlElement, advancedElement: AdvancedControlElement) {
        this.trackId = trackId;
        this.controlElement = element;
        this.advancedElement = advancedElement;
        this.binds = [];
    }
}