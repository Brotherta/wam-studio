

const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`
<style id="style">
:host{
    display: flex;
    width: 100%;
    min-height: 120px;
    max-height: 120px;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    background: rgb(44, 44, 44);
    border: solid 1px black;
}
/* ICONS: Small lightgrey visual elements */
    .icon {
        width: 20px;
        padding: auto;
        text-align: center;
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
            -moz-user-select: none; /* Old versions of Firefox */
            -ms-user-select: none; /* Internet Explorer/Edge */
                user-select: none;
    }
    /* LETTER ICONS */
        .icon._letter {
            padding-left: 5px;
            padding-right: 5px;
            font-size: 15px;
            font-weight: bold;
            color: lightgrey;
        }

        .icon._letter._green:not(:hover){
            color: lightgreen;
            filter: none;
        }

        .icon._letter._red:not(:hover){
            color: red;
            filter: none;
        }

        .icon._letter._yellow:not(:hover){
            color: yellow;
            filter: none;
        }
    /* */
/* */

/* CONTROLS: Togglables elements */
    .control {
        padding-left: 5px;
        padding-right: 5px;
    }

    .control:not(._toggled){
        opacity: 0.4;
    }

    .control:hover{
        filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
    }


    .control:hover {
        cursor: pointer;
    }
/* */

/* SLIDERS: Sliders input looking like [==0----] */
    .slider{
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-around;
        align-items: center; 
        max-height: 20px;
    }
/* */

/* CONTROL LINEs : A line of control in the sound provider interface */
    .control-line{
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        padding-left:5px;
        padding-right:5px;
        height: 20px;
        margin-top: 5px;
    }
/* */

/* TRACK ORGANISATION */
    .track-utils {
        display: flex;
        height: 100%;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;

        width:0;
        flex-grow:1;
    }
    .track-header {
        display: flex;
        width: 100%;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-around;
        align-items: center;
        min-height: 24px;
        font-family: Helvetica, monospace;
        color: pink;
    }
    .track-main{
        width:100%;
    }
/* */

.track-color {
    width: 5%;
    height: 100%;
    cursor: pointer;
}

.track-vu-meter {
    width: 35px;
    height: 100%;
}

.track-name {
    color: lightgrey;
    font-family: Helvetica, monospace;
    font-weight: bold;
    max-width: 100px;
    min-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 2s linear;
    text-align: center;
    background-color: transparent;
    padding: 0;
    transition: none;
    border: solid 1px transparent;
}

.track-name[!disabled]:hover {
    border: solid 1px lightgrey;
}
.track-name:focus {
    border: none;
    padding: 0;
    outline: none;
    border: solid 1px lightgrey;
}

.track-close {
    padding-right: 5px;
    padding-left: 5px;
}

.track-close:hover {
    filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
    cursor: pointer;
}

.form-range.tracko {
    width: 80px !important;
}

.toggle-control {
    border: 1px solid grey;
    border-radius: 2px;
    background-color: transparent;
    color: grey;
    font-size: 8px;
    font-family: "Helvetica Neue", sans-serif;
    font-weight: bold;
    text-transform: uppercase;
    padding: 1px 3px;
    transition: all 0.2s ease;
    cursor: pointer;
    margin-bottom: 3px;
}

.toggle-control:hover, .toggle-control.active {
    background-color: #5c69cc;
    color: white;
    border-color: #5c69cc;
}

.toggle-control:active {
    background-color: #444fa6;
    border-color: #444fa6;
    color: white;
}

.toggle-control.disabled {
    background-color: #bbb;
    color: #666;
    border-color: #bbb;
    cursor: default;
}

.toggle-control.disabled:hover, .toggle-control.disabled:active {
    background-color: #bbb;
    color: #666;
    border-color: #bbb;
}

.toggle-control:hover.active {
  background-color: #5c69cc;
  color: white;
  border-color: #5c69cc;
  box-shadow: 0 0 5px #5c69cc;
}

#loading-container {
    width: 80%;
    height: 20px;
    background: #E0E0E0;
    border-radius: 5px;
    overflow: hidden;
}

#loading-bar {
    padding: 10px;
    height: 100%;
    width: 0%;
    background: rgb(92, 105, 204);
    transition: width 0.3s ease-in-out;
}

#progress-bar-text {
    width: 100%;
    text-align: center;
    color: #FFFFFF;
    font-size: 14px;
    line-height: 20px;
    margin-top: 10px;
}


.hidden {
    display: none;
}

</style>

<link rel="stylesheet" href="style/icons.css">
<div id="vu-meter-div" class="track-vu-meter"></div>

<div class="track-utils">

    <div class="track-header">
        <input id="name-input" disabled="disabled" class="track-name">
        
        <div id="hand-btn" class="track-close">
            <i class="icon hand-icon" style="width: 14px"></i>
        </div>
    </div>

    <div class="track-main">
        <div id="loading-container">
            <div id="loading-bar"></div>
        </div>
        <div id="progress-bar-text"></div>
    
        <div class="slider">
            <div class="icon">
                <i class="icon volume-down-icon" style="width: 20px"></i>
            </div>
            <input type="range" class="form-range tracko" id="volume-slider">
            <div class="icon">
                <i class="icon volume-up-icon" style="width: 20px"></i>
            </div>
        </div>
        <div class="slider">
            <div class="icon _letter">
                L
            </div>
            <input type="range" min="-1" max="1" step=".1" value="0" class="form-range tracko" id="balance-slider">
            <div class="icon _letter">
                R
            </div>
        </div>
        <div class="control-line" id="track-controls1">
            <div id="mute-btn" class="icon _letter control">M</div>
            <div id="monitoring" class="control" style="padding-top: 6px">
                <i class="icon monitor-icon"></i>
            </div>
            <div id="fx" class="control" style="padding-top: 6px">
                <i class="fx-icon" style="width: 18px"></i>
            </div>
        </div>
        <div class="control-line" id="track-controls2">
        </div>
    </div>
</div>

<div id="color-div" class="track-color"></div>
`

/**
 * An HTMLElement that represents a track panel.
 */
export default class SoundProviderElement extends HTMLElement {

    trackId: number | undefined;

    isLoading: boolean = false;
    vuMeterDiv: HTMLDivElement;

    private on(id: string, callback?: (element:Element)=>void): HTMLElement|undefined{
        const fetched=this.shadowRoot?.getElementById(id)
        if(fetched && callback)callback(fetched)
        return fetched ?? undefined
    }

    private updateMuted(){
        if(this._isMuted){
            this.muteBtn.classList.remove("_yellow")
            this.muteBtn.classList.add("_red","_toggled")
        }
        else if(this._isSoloMuted){
            this.muteBtn.classList.remove("_red")
            this.muteBtn.classList.add("_yellow","_toggled")
        }
        else{
            this.muteBtn.classList.remove("_red","_yellow","_toggled")
        }
    }

    private _isMuted=false
    set isMuted(value: boolean){
        this._isMuted=value
        this.updateMuted()
    }

    private _isSoloMuted=false
    set isSoloMuted(value: boolean){
        this._isSoloMuted=value
        this.updateMuted()
    }

    set name(value:string){ this.trackNameInput.value=value }
    get name(){ return this.trackNameInput.value ?? "" }

    set volume(value: number){ this.volumeSlider.valueAsNumber=value }
    get volume(){ return this.volumeSlider.valueAsNumber }

    set balance(value: number){ this.balanceSlider.valueAsNumber=value }
    get balance(){ return this.balanceSlider.valueAsNumber }

    set color(value: string){ this.colorLine.style.backgroundColor=value }
    get color(){ return this.colorLine.style.backgroundColor }

    set isMonitoring(value:boolean) { this.monitoringBtn.classList.toggle("_toggled",value)}

    constructor() {
        super()
        this.attachShadow({mode: "open"});
        if (this.shadowRoot !== null) {
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            this.name = "";
            
            this.defineTrackElementListeners();
            this.shadowRoot.querySelectorAll(".track-volume, .track-balance, .track-controls").forEach((element) => {
                element.classList.add("hidden");
            });
            this.isLoading = true;
            this.vuMeterDiv = this.shadowRoot.querySelector("#vu-meter-div") as HTMLDivElement;
        }
        this.name="SoundProvider"
    }

    defineTrackElementListeners() {
        this.trackNameInput.value = this.name;

        this.trackNameInput.addEventListener("keyup", (ev: KeyboardEvent) => {
            if (ev.code === "Enter" && ev.target !== null) {
                ev.preventDefault;
                (document.activeElement as HTMLElement).blur();
            }
        });

    }

    getPeakMeterParentElement():HTMLDivElement {
        return this.vuMeterDiv;
    }
    
    // Progress method that accepts a percentage and updates the width of the loading bar
    progress(percent: number, loaded: number, total: number) {
        if (!this.isLoading) return;
        if (this.shadowRoot === null) return;

        const loadingBar = this.shadowRoot.getElementById("loading-bar");
        const progressBarText = this.shadowRoot.getElementById("progress-bar-text");
        if (loadingBar === null || progressBarText === null) return;

        loadingBar.style.width = `${percent}%`;
        progressBarText.textContent = `${(loaded / (1024 * 1024)).toFixed(2)} MB of ${(total / (1024 * 1024)).toFixed(2)} MB`;
    }

    // Method to be called when progress is done
    progressDone() {
        if (!this.isLoading) return;
        if (this.shadowRoot === null) return;

        const progressBarText = this.shadowRoot.getElementById("progress-bar-text");
        const loadingBar = this.shadowRoot.getElementById("loading-container");

        if (loadingBar === null || progressBarText === null) return;

        loadingBar.remove();
        progressBarText.remove();

        // Show the other elements
        this.shadowRoot.querySelectorAll(".track-volume, .track-balance, .track-controls").forEach((element) => {
            element.classList.remove("hidden");
        });

        this.isLoading = false;
    }

    select() { this.style.borderColor = "lightgray" }

    unSelect() { this.style.borderColor = "black" }

    get trackNameInput() { return this.shadowRoot?.getElementById("name-input") as HTMLInputElement }
    get handBtn() { return this.shadowRoot?.getElementById("hand-btn") as HTMLDivElement }

    get volumeSlider() { return this.shadowRoot?.getElementById("volume-slider") as HTMLInputElement }
    get balanceSlider() { return this.shadowRoot?.getElementById("balance-slider") as HTMLInputElement }

    get muteBtn() { return this.shadowRoot?.getElementById("mute-btn") as HTMLDivElement }
    get monitoringBtn() { return this.shadowRoot?.getElementById("monitoring") as HTMLDivElement }

    get fxBtn() { return this.shadowRoot?.getElementById("fx") as HTMLDivElement }

    get colorLine() { return this.shadowRoot?.getElementById("color-div") as HTMLDivElement }

    get controls() { return this.shadowRoot?.getElementById("track-controls1") as HTMLDivElement }
    get controls2() { return this.shadowRoot?.getElementById("track-controls2") as HTMLDivElement }
    get styleTag(){ return this.shadowRoot?.getElementById("style") as HTMLStyleElement}
}

customElements.define("sound-provider-element", SoundProviderElement)