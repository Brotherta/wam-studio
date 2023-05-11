import App from "../App";
import Track from "../Models/Track";
import Host from "../Models/Host";

/**
 * Controller for the plugins view. This controller is responsible for selecting and removing plugins.
 * It also defines the listeners for the plugins view.
 */
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

    /**
     * define the listeners when the window is resized.
     */
    defineResizeListener() {
        this.app.pluginsView.resize();
    }

    /**
     * Define the listeners for the minimize and maximize buttons.
     */
    defineMinimizeMaximizeListener() {
        this.app.pluginsView.controlRackWindow();
    }

    /**
     * Define the listeners for all the buttons in the plugins view.
     */
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
            // if (this.selectedTrack !== undefined) {
            //     this.removePlugins(this.selectedTrack);
            // }
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

    /**
     * Select the clicked track and show the plugins of the track.
     * @param track
     */
    selectTrack(track: Track) {
        if (this.selectedTrack === undefined) {
            this.selectedTrack = track;
            this.selectedTrack.element.select();
            this.selectPlugins();
        }
        else if (this.selectedTrack.id !== track.id) {
            this.selectedTrack.element.unSelect();
            this.app.pluginsView.unselectHost();
            this.selectedTrack = track;
            this.selectedTrack.element.select();
            this.selectPlugins();
        }
    }

    /**
     * Select the main track and show the plugins of the main track.
     */
    selectHost() {
        let host = this.app.host;
        if (this.selectedTrack === undefined) {
            this.selectedTrack = host;
            this.app.pluginsView.selectHost();
            this.selectPlugins();
        }
        else if (this.selectedTrack.id !== host.id) {
            this.selectedTrack.element.unSelect();
            this.selectedTrack = host;
            this.app.pluginsView.selectHost();
            this.selectPlugins();
        }
    }

    /**
     * Select the plugins of the selected track.
     */
    selectPlugins() {
        if (this.selectedTrack === undefined) {
            this.hideAllControllers();
        }
        else if (!this.selectedTrack.plugin.initialized) {
            this.hideAllControllers();
            this.app.pluginsView.showNew();
        }
        else {
            for (let track of this.app.tracks.trackList) {
                if (track.plugin.initialized) {
                    document.getElementById("loading-zone")!.appendChild(track.plugin.dom);
                }
            }
            this.app.pluginsView.showPlugins(this.selectedTrack);
            if (this.app.pluginsView.floating.hidden) {
                this.hideAllControllers();
                this.app.pluginsView.showShowPlugin();
            }
            else {
                this.hideAllControllers();
                this.app.pluginsView.showFloatingWindow();
                this.app.pluginsView.showHidePlugin();
            }
            this.app.pluginsView.showRemovePlugin();
        }
    }

    /**
     * Hide all the controllers in the plugins view.
     */
    hideAllControllers() {
        this.app.pluginsView.hideNew();
        this.app.pluginsView.hideFloatingWindow();
        this.app.pluginsView.hideShowPlugin();
        this.app.pluginsView.hideRemovePlugin();
        this.app.pluginsView.hideHidePlugin();
    }

    /**
     * Remove the plugins of the given track.
     * @param track
     */
    removePlugins(track: Track) {
        track.plugin.instance?._audioNode.clearEvents();
        this.app.tracksController.disconnectPlugin(track);
        track.plugin.unloadPlugin();
        this.app.pluginsView.deletePluginView();
        if (this.selectedTrack === track) {
            this.selectPlugins();
        }
        track.plugin.dom.remove();
    }
}