import App from "../App";
import Track from "../Models/Track";
import Host from "../Models/Host";
import {audioCtx} from "../index";
import PluginsView from "../Views/PluginsView";

/**
 * Controller for the plugins view. This controller is responsible for selecting and removing plugins.
 * It also defines the listeners for the plugins view.
 */
export default class PluginsController {
    app: App;
    view: PluginsView;

    selectedTrack: Track | undefined;
    hostTrack: Host;

    constructor(app: App) {
        this.app = app;
        this.view = this.app.pluginsView;

        this.hostTrack = this.app.host;
        this.selectedTrack = undefined;

        this.hideAllControllers();

        this.selectPlugins();
        this.defineMinimizeMaximizeListener();
        this.defineNewPluginBtnListener();
        this.view.mainTrack.addEventListener("click", () => {
            this.selectHost();
        });
    }


    /**
     * Define the listeners for the minimize and maximize buttons.
     */
    defineMinimizeMaximizeListener() {
        this.view.maximized = false;
        this.view.maxMinBtn.addEventListener("click", () => {
            if (this.view.maximized) {
                this.view.minimize();
                this.view.maximized = false;
                this.app.editorView.resizeCanvas();
            }
            else {
                this.view.maximize();
                this.view.maximized = true;
                this.app.editorView.resizeCanvas();
            }
        });
    }

    /**
     * Define the listeners for all the buttons in the plugins view.
     */
    defineNewPluginBtnListener() {
        this.view.newPlugin.addEventListener("click", async () => {
            if (!this.selectedTrack) return;
            this.view.hideNew();
            await this.selectedTrack.plugin.initPlugin(this.app.host.pluginWAM, audioCtx);
            this.app.pluginsController.connectPlugin(this.selectedTrack);
            this.selectPlugins();
        });

        this.view.removePlugin.addEventListener("click", () => {
            if (this.selectedTrack !== undefined) {
                this.removePlugins(this.selectedTrack);
            }
        });

        this.view.showPlugin.addEventListener("click", () => {
            this.showPedalboard();
        });

        this.view.hidePlugin.addEventListener("click", () => {
            this.hidePedalBoard();
        });

        this.view.closeWindowButton.addEventListener("click", () => {
            this.hidePedalBoard();
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
            this.view.unselectHost();
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
            this.view.selectHost();
            this.selectPlugins();
        }
        else if (this.selectedTrack.id !== host.id) {
            this.selectedTrack.element.unSelect();
            this.selectedTrack = host;
            this.view.selectHost();
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
            this.view.showNew();
        }
        else {
            this.app.tracksController.trackList.forEach(track => {
                this.view.movePluginLoadingZone(track);
            })
            this.view.showPlugins(this.selectedTrack);
            if (this.view.floating.hidden) {
                this.hideAllControllers();
                this.view.showShowPlugin();
            }
            else {
                this.hideAllControllers();
                this.view.showFloatingWindow();
                this.view.showHidePlugin();
            }
            this.view.showRemovePlugin();
        }
    }

    /**
     * Hide all the controllers in the plugins view.
     */
    hideAllControllers() {
        this.view.hideNew();
        this.view.hideFloatingWindow();
        this.view.hideShowPlugin();
        this.view.hideRemovePlugin();
        this.view.hideHidePlugin();
    }

    /**
     * Remove the plugins of the given track.
     * @param track
     */
    removePlugins(track: Track) {
        track.plugin.instance?._audioNode.clearEvents();
        this.app.pluginsController.disconnectPlugin(track);
        track.plugin.unloadPlugin();
        this.view.deletePluginView();
        if (this.selectedTrack === track) {
            this.selectPlugins();
        }
    }

    /**
     * Connects the plugin to the track. If the track is the host, it connects the plugin to the host gain node.
     * @param track
     */
    connectPlugin(track: Track) {
        if (track.id === -1) {
            let host = track as Host;
            host.gainNode.disconnect(audioCtx.destination);
            host.gainNode
                .connect(host.plugin.instance!._audioNode)
                .connect(audioCtx.destination);
        }
        else {
            track.node!.disconnect(track.pannerNode);
            track.node!
                .connect(track.plugin.instance!._audioNode)
                .connect(track.pannerNode);
            if (track.monitored) {
                track.mergerNode.disconnect(track.pannerNode);
                track.mergerNode.connect(track.plugin.instance?._audioNode!);
            }
        }
    }

    /**
     * Disconnects the plugin from the track. If the track is the host, it disconnects the plugin from the host gain node.
     * @param track
     */
    disconnectPlugin(track: Track) {
        if (track.plugin.initialized && track.id === -1) {
            let host = track as Host;
            host.gainNode.disconnect(host.plugin.instance!._audioNode);
            host.gainNode.connect(audioCtx.destination);
        }
        else if (track.plugin.initialized) {
            track.node!.disconnect(track.plugin.instance!._audioNode);
            track.node!.connect(track.pannerNode);
            if (track.monitored) {
                track.mergerNode.disconnect(track.plugin.instance?._audioNode!);
                track.mergerNode.connect(track.pannerNode);
            }
        }
    }

    async addPedalboard() {
        if (!this.selectedTrack) return;
        this.view.hideNew();
        await this.selectedTrack.plugin.initPlugin(this.app.host.pluginWAM, audioCtx);
        this.app.pluginsController.connectPlugin(this.selectedTrack);
        this.selectPlugins();
        this.showPedalboard();
    }

    showPedalboard() {
        this.view.showHidePlugin();
        this.view.hideShowPlugin();
        this.view.showFloatingWindow();
    }

    hidePedalBoard() {
        this.view.showShowPlugin();
        this.view.hideHidePlugin();
        this.view.hideFloatingWindow();
    }


    async handleFxClick(track: Track) {
        this.selectTrack(track);
        if (track.plugin.initialized) {
            if (this.view.windowOpened) {
                this.hidePedalBoard();
            }
            else {
                this.showPedalboard();
            }
        }
        else {
            await this.addPedalboard();
        }
    }
}