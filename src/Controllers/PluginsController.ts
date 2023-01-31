import App from "../App";
import Track from "../Models/Track";
import Host from "../Models/Host";
// import AudioPlugin from "../Models/AudioPlugin";


export default class PluginsController {
    app: App;

    selectedTrack: Track | undefined;
    hostTrack: Host;

    constructor(app: App) {
        this.app = app;

        this.hostTrack = this.app.host;
        this.selectedTrack = undefined;

        this.hideAllControllers();

        this.selectPlugins();
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
                await this.selectedTrack.plugin.initPlugin();
                this.app.tracksController.connectPlugin(this.selectedTrack);
                this.selectPlugins();
            }
        });

        this.app.pluginsView.removePlugin.addEventListener("click", () => {
            if (this.selectedTrack !== undefined) {
                this.removePlugins(this.selectedTrack);
            }
        });
        this.app.pluginsView.showPlugin.addEventListener("click", () => {
            this.app.pluginsView.showHidePlugin();
            this.app.pluginsView.hideShowPlugin();
            this.app.pluginsView.showFloatingWindow();
        });
        this.app.pluginsView.hidePlugin.addEventListener("click", () => {
            this.app.pluginsView.showShowPlugin();
            this.app.pluginsView.hideHidePlugin();
            this.app.pluginsView.hideFloatingWindow();
        });
        this.app.pluginsView.closeWindowButton.addEventListener("click", () => {
            this.app.pluginsView.showShowPlugin();
            this.app.pluginsView.hideHidePlugin();
            this.app.pluginsView.hideFloatingWindow();
        })
    }

    selectTrack(track: Track) {
        if (this.selectedTrack === undefined) {
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
        if (this.selectedTrack === undefined) {
            this.hideAllControllers();
        }
        else if (!this.selectedTrack.plugin.initialized) {
            this.hideAllControllers();
            this.app.pluginsView.showNew();
        }
        else {
            this.hideAllControllers();
            this.app.pluginsView.showPlugins(this.selectedTrack);
            this.app.pluginsView.showShowPlugin();
            this.app.pluginsView.showRemovePlugin();
        }
    }

    hideAllControllers() {
        this.app.pluginsView.hideNew();
        this.app.pluginsView.hideFloatingWindow();
        this.app.pluginsView.hideShowPlugin();
        this.app.pluginsView.hideRemovePlugin();
        this.app.pluginsView.hideHidePlugin();
    }

    removePlugins(track: Track) {
        if (this.selectedTrack === track) {
            this.selectedTrack = undefined;
            this.selectPlugins();
        }
        this.app.tracksController.disconnectPlugin(track);
        track.plugin.unloadPlugin();
        this.app.pluginsView.deletePluginView();
    }
}