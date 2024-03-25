import Track from "../Models/Track";
import DraggableWindow from "../Utils/DraggableWindow";


export default class PluginsView extends DraggableWindow {

    maxMinBtn = document.getElementById("min-max-btn") as HTMLDivElement;
    audioLoop = document.getElementById("sound-loop") as HTMLAudioElement;
    rack = document.getElementById("plugin-editor") as HTMLDivElement;
    newPlugin = document.getElementById("add-plugins") as HTMLDivElement;
    mount = document.getElementById("mount") as HTMLDivElement;
    floating = document.getElementById("plugin-window") as HTMLDivElement;
    showPlugin = document.getElementById("show-pedalboard") as HTMLDivElement;
    hidePlugin = document.getElementById("hide-pedalboard") as HTMLDivElement;
    removePlugin = document.getElementById("remove-plugins") as HTMLDivElement;
    closeWindowButton = document.getElementById("plugin-close-button") as HTMLDivElement;
    mainTrack = document.getElementById("main-track") as HTMLDivElement;
    minMaxIcon = document.getElementById("min-max-icon") as HTMLImageElement;
    loadingZone = document.getElementById("loading-zone") as HTMLDivElement;

    constructor() {
        super(document.getElementById("plugin-header") as HTMLDivElement, document.getElementById("plugin-window") as HTMLDivElement);
    }

    /**
     * If the window is opened or not.
     */
    public windowOpened: boolean = false;
    /**
     * If the rack is maximized or not.
     */
    public maximized: boolean;

    /**
     * The maximum height of the rack.
     */
    private readonly MAX_HEIGHT: number = 25;
    /**
     * The minimum height of the rack.
     */
    private readonly MIN_HEIGHT: number = 180;

    /**
     * Maximizes the rack to the maximum height and change the icon to minimize.
     */
    maximize() {
        this.minMaxIcon.className = "arrow-down-icon";
        this.rack.style.minHeight = this.MAX_HEIGHT + "px";
    }

    /**
     * Minimizes the rack to the minimum height and change the icon to maximize.
     */
    minimize() {
        this.minMaxIcon.className = "arrow-up-icon";
        this.rack.style.minHeight = this.MIN_HEIGHT+"px";
    }

    /**
     * Mounts the plugin's view in the DOM.
     * @param track - The track whom plugin will be mounted.
     */
    showPlugins(track: Track) {
        this.mount.appendChild(track.plugin.dom);
    }

    /**
     * Removes the plugin's view from the DOM.
     */
    deletePluginView() {
        this.mount.innerHTML = '';
    }

    /**
     * Hides the new plugins button.
     */
    hideNewButton() {
        this.newPlugin.hidden = true;
    }

    /**
     * Shows the new plugins button.
     */
    showNew() {
        this.newPlugin.hidden = false;
    }

    /**
     * Shows the floating window with the plugin's view.
     */
    showFloatingWindow() {
        this.floating.hidden = false;
        this.windowOpened = true;
    }

    /**
     * Hides the floating window with the plugin's view.
     */
    hideFloatingWindow() {
        this.floating.hidden = true;
        this.windowOpened = false;
    }

    /**
     * Shows the show plugin button.
     */
    showShowPlugin() {
        this.showPlugin.hidden = false;
    }

    /**
     * Hides the show plugin button.
     */
    hideShowButton() {
        this.showPlugin.hidden = true;
    }

    /**
     * Shows the hide plugin button.
     */
    showHidePlugin() {
        this.hidePlugin.hidden = false;
    }

    /**
     * Hides the hide plugin button.
     */
    hideHideButton() {
        this.hidePlugin.hidden = true;
    }

    /**
     * Shows the remove plugin button.
     */
    showRemovePlugin() {
        this.removePlugin.hidden = false;
    }

    /**
     * Hides the remove plugin button.
     */
    hideRemoveButton() {
        this.removePlugin.hidden = true;
    }

    /**
     * Selects the main track and set the border to lightgrey.
     */
    selectHost() {
        this.mainTrack.style.border = "1px solid lightgrey";
    }

    /**
     * Unselects the main track and set the border to black.
     */
    unselectHost() {
        this.mainTrack.style.border = "1px solid black";
    }

    /**
     * Moves the plugin's view of the given track to the loading zone.
     * @param track - The track to move the plugin's view from.
     */
    movePluginLoadingZone(track: Track) {
        if (track.plugin.initialized) {
            this.loadingZone.appendChild(track.plugin.dom);
        }
    }
}