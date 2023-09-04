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

    /**
     * App instance.
     */
    private _app: App;
    /**
     * Plugins view.
     */
    private _view: PluginsView;

    /**
     * Selected track. It is undefined if the host is selected.
     */
    public selectedTrack: Track | undefined;

    constructor(app: App) {
        this._app = app;
        this._view = this._app.pluginsView;

        this.selectedTrack = undefined;

        this.bindEvents();
        this.hideAllButtons();

        this._view.maximized = true;
        this.updateRackSize();
    }

    /**
     * Adds a new pedalboard to the selected track.
     */
    public async addPedalBoard(): Promise<void> {
        if (!this.selectedTrack) return;
        this._view.hideNewButton();
        await this.selectedTrack.plugin.initPlugin(this._app.host.pluginWAM, audioCtx);
        this._app.pluginsController.connectPedalBoard(this.selectedTrack);
        this.selectPlugins();
        this.showPedalBoard();
    }

    /**
     * Remove the plugins of the given track.
     * @param track
     */
    public removePedalBoard(track: Track): void {
        track.plugin.instance?._audioNode.clearEvents();
        this._app.pluginsController.disconnectPedalBoard(track);
        track.plugin.unloadPlugin();
        this._view.deletePluginView();
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
            this._view.unselectHost();
            this.selectedTrack = track;
            this.selectedTrack.element.select();
            this.selectPlugins();
        }
    }

    /**
     * Selects the main track and show the plugins of the main track.
     */
    public selectHost(): void {
        let host = this._app.host;
        if (this.selectedTrack === undefined) {
            this.selectedTrack = host;
            this._view.selectHost();
            this.selectPlugins();
        }
        else if (this.selectedTrack.id !== host.id) {
            this.selectedTrack.element.unSelect();
            this.selectedTrack = host;
            this._view.selectHost();
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
            if (this._view.windowOpened) {
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
        this._view.newPlugin.addEventListener("click", async () => {
            if (!this.selectedTrack) return;
            this._view.hideNewButton();
            await this.selectedTrack.plugin.initPlugin(this._app.host.pluginWAM, audioCtx);
            this._app.pluginsController.connectPedalBoard(this.selectedTrack);
            this.selectPlugins();
        });
        this._view.removePlugin.addEventListener("click", () => {
            if (this.selectedTrack !== undefined) {
                this.removePedalBoard(this.selectedTrack);
            }
        });
        this._view.showPlugin.addEventListener("click", () => {
            this.showPedalBoard();
        });
        this._view.hidePlugin.addEventListener("click", () => {
            this.hidePedalBoard();
        });
        this._view.closeWindowButton.addEventListener("click", () => {
            this.hidePedalBoard();
        })
        this._view.maxMinBtn.addEventListener("click", () => {
            this.updateRackSize();
        });
        this._view.mainTrack.addEventListener("click", () => {
            this.selectHost();
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
            this._view.showNew();
        }
        else { // Track selected and plugin initialized
            this._app.tracksController.trackList.forEach(track => { // Hide all plugins to the loading zone
                this._view.movePluginLoadingZone(track);
            })
            this._view.movePluginLoadingZone(this._app.host); // Hide the host plugin to the loading zone
            this._view.showPlugins(this.selectedTrack); // Show the plugins of the selected track
            if (this._view.floating.hidden) { // If the floating window is hidden, show the show button
                this.hideAllButtons();
                this._view.showShowPlugin();
            }
            else { // If the floating window is shown, show the hide button
                this.hideAllButtons();
                this._view.showFloatingWindow();
                this._view.showHidePlugin();
            }
            this._view.showRemovePlugin();
        }
    }

    /**
     * Hides all the buttons in the plugins view.
     */
    private hideAllButtons(): void {
        this._view.hideNewButton();
        this._view.hideFloatingWindow();
        this._view.hideShowButton();
        this._view.hideRemoveButton();
        this._view.hideHideButton();
    }

    /**
     * Shows the pedalboard.
     * @private
     */
    private showPedalBoard(): void {
        this._view.showHidePlugin();
        this._view.hideShowButton();
        this._view.showFloatingWindow();
        this._app.hostController.focus(this._view);
    }

    /**
     * Hides the pedalboard.
     * @private
     */
    private hidePedalBoard(): void {
        this._view.showShowPlugin();
        this._view.hideHideButton();
        this._view.hideFloatingWindow();
    }


    /**
     * Shows or hides the plugins rack.
     * @private
     */
    private updateRackSize(): void {
        const maximized = !this._view.maximized;
        this._view.maximized = maximized;
        if (maximized) {
            this._view.maximize();
            this._app.editorView.resizeCanvas();
        } else {
            this._view.minimize();
            this._app.editorView.resizeCanvas();
        }
    }

}