import TrackControlElement from "../Components/TrackControlElement";
import AdvancedControlElement from "../Components/AdvancedControlElement";
import BindOld from "./BindOld";
import Preset from "./Preset";


export default class TrackControl {

    trackId: number;
    controlElement: TrackControlElement;
    advancedElement: AdvancedControlElement;

    activePreset: Preset | undefined;
    binds: BindOld[];

    constructor(trackId: number, element: TrackControlElement, advancedElement: AdvancedControlElement) {
        this.trackId = trackId;
        this.controlElement = element;
        this.advancedElement = advancedElement;
        this.binds = [];
    }
}