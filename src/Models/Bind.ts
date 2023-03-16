import BindParameterElement from "../Components/BindParameterElement";
import TrackBindControlElement from "../Components/TrackBindControlElement";


export default class Bind {

    bindName: string;
    bindParameters: BindParameterElement[];
    trackBindElement: TrackBindControlElement;
    bindButton: HTMLButtonElement;

    constructor(name: string, trackBindElement: TrackBindControlElement, bindButton: HTMLButtonElement) {
        this.bindName = name;
        this.bindParameters = [];
        this.trackBindElement = trackBindElement;
        this.bindButton = bindButton
    }


}