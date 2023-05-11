import AdvancedElement from "../Components/new/AdvancedElement";
import Bind from "./Bind";
import {SongTagEnum} from "../Utils/SongTagEnum";
import TrackBindElement from "../Components/new/TrackBindElement";


export default class BindControl {

    trackId: number;
    advElement: AdvancedElement;
    trackBindElement: TrackBindElement;
    binds: Bind[];
    tag: SongTagEnum;

    constructor(trackId: number, advElement: AdvancedElement, trackBindElement: TrackBindElement, tag: SongTagEnum) {
        this.trackId = trackId;
        this.advElement = advElement;
        this.trackBindElement = trackBindElement;
        this.binds = [];
        this.tag = tag;
    }

    addBind(bind: Bind) {
        this.binds.push(bind);
    }

    removeBind(bind: Bind) {
        this.binds = this.binds.filter((b) => {
            return b.name != bind.name;
        });
    }
}