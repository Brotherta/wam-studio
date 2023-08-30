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

        this.hideAllButtons();
        this.selectPlugins();
        this.bindEvents();
        this.view.mainTrack.addEventListener("click", () => {
            this.selectHost();
        });
        this.view.minimize();
    }

    /**
     * Adds a new pedalboard to the selected track.
     */
    public async addPedalBoard(): Promise<void> {
        if (!this.selectedTrack) return;
        this.view.hideNewButton();
        await this.selectedTrack.plugin.initPlugin(this.app.host.pluginWAM, audioCtx);
        this.app.pluginsController.connectPedalBoard(this.selectedTrack);
        this.selectPlugins();
        this.showPedalBoard();
    }

    /**
     * Remove the plugins of the given track.
     * @param track
     */
    public removePedalBoard(track: Track): void {
        track.plugin.instance?._audioNode.clearEvents();
        this.app.pluginsController.disconnectPedalBoard(track);
        track.plugin.unloadPlugin();
        this.view.deletePluginView();
        if (this.selectedTrack === track) {
            this.selectPlugins();
        }
    }

    /**
     * Connects the plugin to the track. If the track is the host, it connects the plugin to the host gain node.
     * @param track - The track to connect.
     */
    public connectPedalBoard(track: Track): void {
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
     *
     * @param track - The track where the plugin is connected.
     */
    public disconnectPedalBoard(track: Track): void {
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


    /**
     * Selects the clicked track and show the plugins of the track.
     *
     * @param track - The track that was clicked.
     */
    public selectTrack(track: Track): void {
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
     * Selects the main track and show the plugins of the main track.
     */
    public selectHost(): void {
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
     * Handler for the FX button. It shows the plugins of the track or hides them if they are already shown.
     *
     * @param track - The track that was clicked.
     */
    public fxButtonClicked(track: Track): void {
        this.selectTrack(track);
        if (track.plugin.initialized) {
            if (this.view.windowOpened) {
                this.hidePedalBoard();
            }
            else {
                this.showPedalBoard();
            }
        }
        else {
            this.addPedalBoard();
        }
    }

    /**
     * Binds the events of the plugins view.
     * @private
     */
    private bindEvents(): void {
        this.view.newPlugin.addEventListener("click", async () => {
            if (!this.selectedTrack) return;
            this.view.hideNewButton();
            await this.selectedTrack.plugin.initPlugin(this.app.host.pluginWAM, audioCtx);
            this.app.pluginsController.connectPedalBoard(this.selectedTrack);
            this.selectPlugins();
        });
        this.view.removePlugin.addEventListener("click", () => {
            if (this.selectedTrack !== undefined) {
                this.removePedalBoard(this.selectedTrack);
            }
        });
        this.view.showPlugin.addEventListener("click", () => {
            this.showPedalBoard();
        });
        this.view.hidePlugin.addEventListener("click", () => {
            this.hidePedalBoard();
        });
        this.view.closeWindowButton.addEventListener("click", () => {
            this.hidePedalBoard();
        })
        this.view.maxMinBtn.addEventListener("click", () => {
            if (this.view.maximized) {
                this.view.minimize();
                this.view.maximized = false;
                this.app.editorView.resizeCanvas();
            } else {
                this.view.maximize();
                this.view.maximized = true;
                this.app.editorView.resizeCanvas();
            }
        });
    }

    /**
     * Selects the plugins of the selected track.
     */
    private selectPlugins(): void {
        if (this.selectedTrack === undefined) { // No track selected
            this.hideAllButtons();
        }
        else if (!this.selectedTrack.plugin.initialized) { // Track selected but no plugin initialized
            this.hideAllButtons();
            this.view.showNew();
        }
        else { // Track selected and plugin initialized
            this.app.tracksController.trackList.forEach(track => { // Hide all plugins to the loading zone
                this.view.movePluginLoadingZone(track);
            })
            this.view.showPlugins(this.selectedTrack); // Show the plugins of the selected track
            if (this.view.floating.hidden) { // If the floating window is hidden, show the show button
                this.hideAllButtons();
                this.view.showShowPlugin();
            }
            else { // If the floating window is shown, show the hide button
                this.hideAllButtons();
                this.view.showFloatingWindow();
                this.view.showHidePlugin();
            }
            this.view.showRemovePlugin();
        }
    }

    /**
     * Hides all the buttons in the plugins view.
     */
    private hideAllButtons(): void {
        this.view.hideNewButton();
        this.view.hideFloatingWindow();
        this.view.hideShowButton();
        this.view.hideRemoveButton();
        this.view.hideHideButton();
    }

    /**
     * Shows the pedalboard.
     * @private
     */
    private showPedalBoard(): void {
        this.view.showHidePlugin();
        this.view.hideShowButton();
        this.view.showFloatingWindow();
    }

    /**
     * Hides the pedalboard.
     * @private
     */
    private hidePedalBoard(): void {
        this.view.showShowPlugin();
        this.view.hideHideButton();
        this.view.hideFloatingWindow();
    }
}