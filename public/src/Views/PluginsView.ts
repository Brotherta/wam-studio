import Track from "../Models/Track/Track";
import DraggableWindow from "../Utils/DraggableWindow";


export default class PluginsView extends DraggableWindow {

    onPluginClick: (name:string)=>void = ()=>{}

    maxMinBtn = document.getElementById("min-max-btn") as HTMLDivElement;
    rack = document.getElementById("plugin-editor") as HTMLDivElement;
    private newPluginMarker = document.getElementById("add-plugins") as HTMLDivElement;
    private newPlugins: HTMLDivElement[] = []
    mount = document.getElementById("mount") as HTMLDivElement;
    floating = document.getElementById("plugin-window") as HTMLDivElement;
    showPlugin = document.getElementById("show-pedalboard") as HTMLDivElement;
    hidePlugin = document.getElementById("hide-pedalboard") as HTMLDivElement;
    removePlugin = document.getElementById("remove-plugins") as HTMLDivElement;
    loadingPlugin = document.getElementById("loading-pedalboard") as HTMLDivElement;
    closeWindowButton = document.getElementById("plugin-close-button") as HTMLDivElement;
    mainTrack = document.getElementById("main-track") as HTMLDivElement;
    minMaxIcon = document.getElementById("min-max-icon") as HTMLImageElement;
    loadingZone = document.getElementById("loading-zone") as HTMLDivElement;

    constructor() {
        super(document.getElementById("plugin-header") as HTMLDivElement, document.getElementById("plugin-window") as HTMLDivElement);
        this.newPluginMarker.hidden = true;
    }

    /** If the window is opened or not. */
    public windowOpened: boolean = false;

    /** If the rack is maximized or not. */
    public maximized: boolean;

    /** The maximum height of the rack. */
    private readonly MAX_HEIGHT: number = 25;

    /** The minimum height of the rack. */
    private readonly MIN_HEIGHT: number = 180;

    /** Maximizes the rack to the maximum height and change the icon to minimize. */
    maximize() {
        this.minMaxIcon.className = "arrow-down-icon";
        this.rack.style.minHeight = this.MAX_HEIGHT + "px";
    }

    /** Minimizes the rack to the minimum height and change the icon to maximize. */
    minimize() {
        this.minMaxIcon.className = "arrow-up-icon";
        this.rack.style.minHeight = this.MIN_HEIGHT + "px";
    }

    /**
     * Set the plugin's view in the DOM.
     * @param track - The track whom plugin will be mounted or null for no plugin.
     */
    setPluginView(element: Element | null) {
        this.mount.innerHTML = '';
        if (element != null) this.mount.appendChild(element);
    }

    /** Show the new plugin buttons. */
    setNewPlugins(names: string[]) {
        // Hide the previous
        for (const plugin of this.newPlugins) {
            plugin.remove();
            console.log("removing",plugin)
        }
        this.newPlugins = [];

        // Show the new
        for (const name of names) {
            const element = document.createElement("div");
            element.className="new-track"
            element.innerHTML =/*html*/`
                <div class="new-track-text">
                    Add ${name}
                </div>
                <div class="icon">
                    <i class="plus-icon"></i>
                </div>
            `
            this.newPluginMarker.after(element);
            this.newPlugins.push(element);
            element.onclick= ()=>{ this.onPluginClick(name) }
        }
    }

    /**
     * Show or hide the floating window
     * @param doShow Do show the floating window or hide it
     */
    showFloatingWindow(doShow: boolean){
        this.floating.hidden= !doShow
        this.windowOpened= doShow
    }


    /**
     * Shows or hide the show plugin button.
     * @param name The plugin name or null for hiding
     */
    setShowPlugin(name: string|null) {
        this.showPlugin.hidden = !name;
        if(name)this.showPlugin.querySelector(".new-track-text")!.innerHTML=`Show ${name}`
    }

    /**
     * Shows or hide the hide plugin button.
     * @param name The plugin name or null for hiding
     */
    setHidePlugin(name: string|null) {
        this.hidePlugin.hidden = !name;
        if(name)this.hidePlugin.querySelector(".new-track-text")!.innerHTML=`Hide ${name}`
    }

    /**
     * Shows or hide the remove plugin button.
     * @param name The plugin name or null for hiding
     */
    setRemovePlugin(name: string|null) {
        this.removePlugin.hidden =  !name;
        if(name)this.removePlugin.querySelector(".new-track-text")!.innerHTML=`Remove ${name}`
    }

    /**
     * Shows or hide the remove plugin button.
     * @param name The plugin name or null for hiding
     */
    setLoadingPlugin(name: string|null) {
        this.loadingPlugin.hidden = !name;
        if(name)this.loadingPlugin.querySelector(".new-track-text")!.innerHTML=`Loading ${name}`
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
        if (track.plugin?.instance) {
            this.loadingZone.appendChild(track.plugin.dom);
        }
    }
}