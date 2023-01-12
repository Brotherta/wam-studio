import App from "../App";


export default class PluginsController {
    app: App;

    constructor(app: App) {
        this.app = app;
        this.defineResizeListener();
        this.defineMinimizeMaximizeListener();
    }

    defineResizeListener() {
        this.app.pluginsView.resize();
    }

    defineMinimizeMaximizeListener() {
        this.app.pluginsView.controlRackWindow();
    }
}