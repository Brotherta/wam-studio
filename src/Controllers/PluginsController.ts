import App from "../App";
import Track from "../Models/Track";
import Host from "../Models/Host";


export default class PluginsController {
    app: App;

    selectedTrack: Track | undefined;
    hostTrack: Host;

    constructor(app: App) {
        this.app = app;

        this.hostTrack = this.app.host;
        this.selectedTrack = undefined;

        this.defineResizeListener();
        this.defineMinimizeMaximizeListener();
        this.defineNewPluginBtnListener();
    }

    defineResizeListener() {
        this.app.pluginsView.resize();
    }

    defineMinimizeMaximizeListener() {
        this.app.pluginsView.controlRackWindow();
    }

    defineNewPluginBtnListener() {
        this.app.pluginsView.newPlugin.addEventListener("click", () => {
            console.log("new plugin !")
        });
    }

    selectTrack(track: Track) {
        if (this.selectedTrack == undefined) {
            this.selectedTrack = track;
            this.selectedTrack.element.select();
        }
        else if (this.selectedTrack.id !== track.id) {
            this.selectedTrack.element.unSelect();
            this.selectedTrack = track;
            this.selectedTrack.element.select();
        }
    }
}