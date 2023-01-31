import Track from "../Models/Track";


export default class PluginsView {

    resizeBtn = document.getElementById("resize-btn") as HTMLDivElement;
    maxMinBtn = document.getElementById("min-max-btn") as HTMLDivElement;
    rack = document.getElementById("rack") as HTMLDivElement;
    newPlugin = document.getElementById("add-plugins") as HTMLDivElement;
    mount = document.getElementById("mount") as HTMLDivElement;
    floating = document.getElementById("resizableWindow") as HTMLDivElement;
    showPlugin = document.getElementById("show-pedalboard") as HTMLDivElement;
    hidePlugin = document.getElementById("hide-pedalboard") as HTMLDivElement;
    removePlugin = document.getElementById("remove-plugins") as HTMLDivElement;
    closeWindowButton = document.getElementById("closeButtonResizeWindow") as HTMLDivElement;
    mainTrack = document.getElementById("main-track") as HTMLDivElement;

    maxHeight: number;
    minHeight: number;
    originalHeight: number;
    originalY: number;
    originalMouseY: number;
    event: MouseEvent;

    // private dragging: boolean;
    private maximized: boolean;
    private currentSize: number;

    constructor() {
        this.minHeight = 25;
        this.maxHeight = document.body.getBoundingClientRect().height * 2/3;
        this.currentSize = 180;
        this.maximize();
    }

    /**
     * Minimize the rack to the minimum height and change the icon to maximize.
     */
    resize() {
        // this.resizeBtn.addEventListener("mousedown", (e) => {
        //     this.minHeight = 25;
        //     this.maxHeight = document.body.getBoundingClientRect().height * 3/4;
        //     this.dragging = true;
        //     let rackDiv = this.rack;
        //     this.originalHeight = parseFloat(getComputedStyle(rackDiv, null).getPropertyValue('height').replace("px",''));
        //     this.originalY = rackDiv.getBoundingClientRect().top;
        //     this.originalMouseY = e.pageY;
        //     this.event = e;
        // });
        //
        // document.body.addEventListener("mouseup", () => {
        //     if (this.dragging) {
        //         this.dragging = false;
        //         this.currentSize = parseFloat(getComputedStyle(this.rack, null).getPropertyValue('height').replace("px",''));
        //     }
        // });
        //
        // document.body.addEventListener("mousemove", (e) => {
        //     if (this.dragging) {
        //         let height = this.originalHeight - (e.pageY - this.originalMouseY);
        //         if (height < this.maxHeight) {
        //             this.rack.style.minHeight = height+"px";
        //         }
        //
        //         if (height < this.minHeight) {
        //             this.minimize();
        //         }
        //         else {
        //             this.maximized = true;
        //             let icon = document.getElementById("min-max-btn-icon") as HTMLImageElement;
        //             icon.src = "icons/chevron-compact-down.svg";
        //         }
        //     }
        // });

        window.addEventListener("resize", () => {
            this.maxHeight = document.body.getBoundingClientRect().height * 3/4;
            this.originalHeight = parseFloat(getComputedStyle(this.rack, null).getPropertyValue('height').replace("px",''));
            if (this.originalHeight > this.maxHeight) {
                this.rack.style.minHeight = this.maxHeight+"px";
            }
        })
    }

    /**
     * Add the event listener to the button that maximizes and minimizes the rack.
     */
    controlRackWindow() {
        this.maximized = true;
        this.maxMinBtn.addEventListener("click", () => {
            if (this.maximized) {
                this.minimize();
                this.maximized = false;
            }
            else {
                this.maximize();
                this.maximized = true;
            }
        });
    }

    /**
     * Maximize the rack to the maximum height and change the icon to minimize.
     */
    maximize() {
        let icon = document.getElementById("min-max-btn-icon") as HTMLImageElement;
        icon.src = "icons/chevron-compact-down.svg";
        this.rack.style.minHeight = this.currentSize + "px";
    }

    /**
     * Minimize the rack to the minimum height and change the icon to maximize.
     */
    minimize() {
        let icon = document.getElementById("min-max-btn-icon") as HTMLImageElement;
        icon.src = "icons/chevron-compact-up.svg";
        this.rack.style.minHeight = this.minHeight+"px";
    }

    /**
     * Remove the plugin's view from the DOM and mount the current track's plugin's view.
     * @param track
     */
    showPlugins(track: Track) {
        this.deletePluginView()
        this.mount.appendChild(track.plugin.dom);
    }

    /**
     * Remove the plugin's view from the DOM.
     */
    deletePluginView() {
        this.mount.innerHTML = '';
    }

    /**
     * Hide the new plugins button.
     */
    hideNew() {
        this.newPlugin.hidden = true;
    }

    /**
     * Show the new plugins button.
     */
    showNew() {
        this.newPlugin.hidden = false;
    }

    /**
     * Show the floating window with the plugin's view.
     */
    showFloatingWindow() {
        this.floating.hidden = false;
    }

    /**
     * Hide the floating window with the plugin's view.
     */
    hideFloatingWindow() {
        this.floating.hidden = true;
    }

    /**
     * Show the show plugin button.
     */
    showShowPlugin() {
        this.showPlugin.hidden = false;
    }

    /**
     * Hide the show plugin button.
     */
    hideShowPlugin() {
        this.showPlugin.hidden = true;
    }

    /**
     * Show the hide plugin button.
     */
    showHidePlugin() {
        this.hidePlugin.hidden = false;
    }

    /**
     * Hide the hide plugin button.
     */
    hideHidePlugin() {
        this.hidePlugin.hidden = true;
    }

    /**
     * Show the remove plugin button.
     */
    showRemovePlugin() {
        this.removePlugin.hidden = false;
    }

    /**
     * Hide the remove plugin button.
     */
    hideRemovePlugin() {
        this.removePlugin.hidden = true;
    }

    /**
     * Select the main track and set the border to lightgrey.
     */
    selectHost() {
        this.mainTrack.style.border = "1px solid lightgrey";
    }

    /**
     * Unselect the main track and set the border to black.
     */
    unselectHost() {
        this.mainTrack.style.border = "1px solid black";
    }
}