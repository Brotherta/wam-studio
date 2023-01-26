import App from "../App";
import Track from "../Models/Track";
import Host from "../Models/Host";
import AudioPlugin from "../Models/AudioPlugin";


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
        this.app.pluginsView.newPlugin.addEventListener("click", async () => {
            if (this.selectedTrack != undefined) {
                this.app.pluginsView.hideNew();
                await this.createPlugin();
                this.app.tracksController.connectPlugin(this.selectedTrack);
                this.selectPlugins();
            }
        });
    }

    selectTrack(track: Track) {
        if (this.selectedTrack == undefined) {
            this.selectedTrack = track;
            this.selectedTrack.element.select();
            this.selectPlugins();
        }
        else if (this.selectedTrack.id !== track.id) {
            this.selectedTrack.element.unSelect();
            this.selectedTrack = track;
            this.selectedTrack.element.select();
            this.selectPlugins();
        }
    }

    selectPlugins() {
        if (this.selectedTrack == undefined) {
            this.app.pluginsView.hideNew();
        }
        else if (this.selectedTrack.plugin == undefined) {
            this.app.pluginsView.showNew();
        }
        else {
            this.app.pluginsView.showPlugins(this.selectedTrack);
        }
    }

    async createPlugin() {
        let plugin = new AudioPlugin(this.app);
        await plugin.initPlugin();
        this.selectedTrack!.plugin = plugin;
    }
}