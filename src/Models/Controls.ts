import Control from "./Control";
import App from "../App";


export default class Controls {

    controls: Control[];
    app: App;

    constructor(app: App) {
        this.app = app;
        this.controls = [];
    }

    addControl(control: Control) {
        this.controls.push(control);
    }

    removeControl(trackId: number) {
        let index = this.controls.findIndex(control => control.trackId === trackId);
        this.controls.splice(index, 1);
    }
}