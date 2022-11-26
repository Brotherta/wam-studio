import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import TrackElement from "../Components/TrackElement";

export default class Track {

    id: number;
    element: TrackElement
    color: string;

    node: WamAudioWorkletNode;

    constructor(id: number, element: TrackElement, node: WamAudioWorkletNode) {
        this.id = id;
        this.element = element;
        this.color = "";
        this.node = node;
    }
}