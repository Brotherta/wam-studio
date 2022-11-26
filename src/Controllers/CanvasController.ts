import CanvasView from "../Views/CanvasView";
import App from "../App";


export default class CanvasController {

    canvas: CanvasView;
    app: App;

    constructor(app: App) {
        this.canvas = app.canvasView;
        this.app = app;
    }

}