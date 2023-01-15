

export default class PluginsView {

    resizeBtn = document.getElementById("resize-btn") as HTMLDivElement;
    maxMinBtn = document.getElementById("min-max-btn") as HTMLDivElement;
    rack = document.getElementById("rack") as HTMLDivElement;
    newPlugin = document.getElementById("add-plugins") as HTMLDivElement;

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
            this.maxHeight = document.body.getBoundingClientRect().height * 2/3;
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
            this.maxHeight = document.body.getBoundingClientRect().height * 2/3;
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
}