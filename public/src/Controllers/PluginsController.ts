import App from "../App";
import Track from "../Models/Track/Track";
import PluginsView from "../Views/PluginsView";
import { audioCtx } from "../index";

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

    constructor(app: App) {
        this._app = app;
        this._view = this._app.pluginsView;

        this.selectedTrack = undefined;

        this.bindEvents();
        this.hideAllButtons();

        this._view.maximized = true;
        this.updateRackSize();
    }

    private get selectedTrack(){ return this._app.tracksController.selectedTrack }
    private set selectedTrack(value: Track|undefined){ this._app.tracksController.selectedTrack=value }

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
        track.connectPlugin(track.plugin.instance!)
    }

    /**
     * Disconnects the plugin from the track. If the track is the host, it disconnects the plugin from the host gain node.
     *
     * @param track - The track where the plugin is connected.
     */
    public disconnectPedalBoard(track: Track): void {
        track.connectPlugin(undefined)
    }


    /**
     * Selects a track and show the plugins of the track.
     *
     * @param track The track to select
     */
    public selectTrack(track: Track|undefined): void {
        if(this.selectedTrack !== undefined){
            this.selectedTrack.element.unSelect();
            this.selectedTrack = undefined;
        }
        if(track !==undefined){
            this.selectedTrack = track;
            this.selectedTrack.element.select();
        }
        this.selectPlugins();
        // TODO Check what is the purpose of this._view.unselectHost();
    }

    // TODO See if this can be removed, how it can be modified. And make it work again
    /**
     * Selects the main track and show the plugins of the main track.
     */
    public selectHost(): void {
        let host = this._app.host;
        if (this.selectedTrack === undefined) {
            this._view.selectHost();
            this.selectPlugins();
        }
        else if (this.selectedTrack.id !== host.id) {
            this.selectedTrack.element.unSelect();
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
            this._app.tracksController.tracks.forEach(track => { // Hide all plugins to the loading zone
                this._view.movePluginLoadingZone(track);
            })
            //TODO this._view.movePluginLoadingZone(this._app.host); // Hide the host plugin to the loading zone
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