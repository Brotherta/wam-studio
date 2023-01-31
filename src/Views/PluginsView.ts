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

    maxHeight: number;
    minHeight: number;
    originalHeight: number;
    originalY: number;
    originalMouseY: number;
    event: MouseEvent;

    private dragging: boolean;
    private maximized: boolean;
    private currentSize: number;

    constructor() {
        this.minHeight = 25;
        this.maxHeight = document.body.getBoundingClientRect().height * 2/3;
        this.currentSize = 180;
        this.maximize();
    }

    resize() {
        this.resizeBtn.addEventListener("mousedown", (e) => {
            this.minHeight = 25;
            this.maxHeight = document.body.getBoundingClientRect().height * 3/4;
            this.dragging = true;
            let rackDiv = this.rack;
            this.originalHeight = parseFloat(getComputedStyle(rackDiv, null).getPropertyValue('height').replace("px",''));
            this.originalY = rackDiv.getBoundingClientRect().top;
            this.originalMouseY = e.pageY;
            this.event = e;
        });

        document.body.addEventListener("mouseup", () => {
            if (this.dragging) {
                this.dragging = false;
                this.currentSize = parseFloat(getComputedStyle(this.rack, null).getPropertyValue('height').replace("px",''));
            }
        });

        document.body.addEventListener("mousemove", (e) => {
            if (this.dragging) {
                let height = this.originalHeight - (e.pageY - this.originalMouseY);
                if (height < this.maxHeight) {
                    this.rack.style.minHeight = height+"px";
                }

                if (height < this.minHeight) {
                    this.minimize();
                }
                else {
                    this.maximized = true;
                    let icon = document.getElementById("min-max-btn-icon") as HTMLImageElement;
                    icon.src = "icons/chevron-compact-down.svg";
                }
            }
        });

        window.addEventListener("resize", () => {
            this.maxHeight = document.body.getBoundingClientRect().height * 3/4;
            this.originalHeight = parseFloat(getComputedStyle(this.rack, null).getPropertyValue('height').replace("px",''));
            if (this.originalHeight > this.maxHeight) {
                this.rack.style.minHeight = this.maxHeight+"px";
            }
        })
    }

    controlRackWindow() {
        this.maximized = false;
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

    maximize() {
        let icon = document.getElementById("min-max-btn-icon") as HTMLImageElement;
        icon.src = "icons/chevron-compact-down.svg";
        this.rack.style.minHeight = this.currentSize + "px";
    }

    minimize() {
        let icon = document.getElementById("min-max-btn-icon") as HTMLImageElement;
        icon.src = "icons/chevron-compact-up.svg";
        this.rack.style.minHeight = this.minHeight+"px";
    }

    showPlugins(track: Track) {
        this.deletePluginView()
        this.mount.appendChild(track.plugin.dom);
    }

    deletePluginView() {
        this.mount.innerHTML = '';
    }

    hideNew() {
        this.newPlugin.hidden = true;
    }

    showNew() {
        this.newPlugin.hidden = false;
    }

    /**
     * Show and Hide the floating plugin's view
     */
    showFloatingWindow() {
        this.floating.hidden = false;
    }

    hideFloatingWindow() {
        this.floating.hidden = true;
    }

    /**
     * Show and Hide the button that shows the plugin's view
     */
    showShowPlugin() {
        this.showPlugin.hidden = false;
    }

    hideShowPlugin() {
        this.showPlugin.hidden = true;
    }

    /**
     * Show and Hide the button that hides the plugin's view
     */
    showHidePlugin() {
        this.hidePlugin.hidden = false;
    }

    hideHidePlugin() {
        this.hidePlugin.hidden = true;
    }

    /**
     * Show and Hide buttons to remove the current plugin.
     */
    showRemovePlugin() {
        this.removePlugin.hidden = false;
    }

    hideRemovePlugin() {
        this.removePlugin.hidden = true;
    }
}