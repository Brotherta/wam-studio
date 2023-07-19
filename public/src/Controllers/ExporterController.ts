import App from "../App";


export default class ExporterController {

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async exportSongs() {
        this.app.hostController.stop();
        this.app.tracksController.jumpTo(0);
        this.app.hostController.play();
    }

    async exportProject() {

    }
}