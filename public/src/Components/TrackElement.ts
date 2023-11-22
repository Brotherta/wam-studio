import { audioCtx } from "..";


const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>
.icon {
    padding-left: 5px;
    padding-right: 5px;
    -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
       -khtml-user-select: none; /* Konqueror HTML */
         -moz-user-select: none; /* Old versions of Firefox */
          -ms-user-select: none; /* Internet Explorer/Edge */
              user-select: none;
    pointer-events: none;
}

.track-utils {
    display: flex;
    width: 95%;
    height: 100%;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
}

.track-color {
    width: 5%;
    height: 100%;
    cursor: pointer;
}

.track-vu-meter {
    width: 35px;
    height: 100%;
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

.track-volume {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center; 
    max-height: 20px;
}

.track-balance {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
    max-height: 20px;
}

.track-controls {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    max-height: 20px;
    padding-top: 10px;
}

.track-name {
    color: lightgrey;
    font-familiy: Helvetica, monospace;
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

.track-name:hover {
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

.letter-icon {
    color: lightgrey;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 15px;
    font-weight: bold;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; 
}

.mute-icon, .solo-icon {
    color: grey;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 15px;
    font-weight: bold;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;  
}

.mute-icon:hover, .solo-icon:hover {
    cursor: pointer;
}

.control {
    padding-left: 5px;
    padding-right: 5px;
    color: grey;
}

.control:hover {
    cursor: pointer;
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
        <input id="name-input" class="track-name">
        
        <div id="hand-btn" class="track-close">
            <i class="hand-icon" style="width: 14px"></i>
        </div>
        <div id="close-btn" class="track-close">
            <i class="close-icon" style="width: 14px"></i>
        </div>
    </div>

    <div class="track-main">
        <div id="loading-container">
            <div id="loading-bar"></div>
        </div>
        <div id="progress-bar-text"></div>
    
        <div class="track-volume">
            <div class="icon">
    <!--            <img src="icons/volume-down-track.svg">-->
                <i class="volume-down-icon" style="width: 20px"></i>
            </div>
            <input type="range" class="form-range tracko" id="volume-slider">
            <div class="icon">
    <!--            <img src="icons/volume-up-track.svg">-->
                <i class="volume-up-icon" style="width: 20px"></i>
            </div>
        </div>
        <div class="track-balance">
            <div class="letter-icon">
                L
            </div>
            <input type="range" min="-1" max="1" step=".1" value="0" class="form-range tracko" id="balance-slider">
            <div class="letter-icon">
                R
            </div>
        </div>
        <div class="track-controls">
            <div id="mute-btn" class="mute-icon">M</div>
            <div id="solo-btn" class="solo-icon">S</div>
            <div id="monitoring" class="control" style="padding-top: 6px">
                <i class="monitor-icon"></i>
            </div>
            <div id="arm" class="control" style="padding-top: 3px">
                <i class="mic-icon" style="width: 15px"></i>
            </div>
            <div id="automation" class="control" style="padding-top: 1px">
                <i class="automation-icon" style="width: 15px"></i>
            </div>
        </div>
        <div class="track-controls" style="padding-top: 5px">
            <div id="mode" class="toggle-control active">mono ⇉ stereo</div>
            <div id="left" class="toggle-control active">L</div>
            <div id="right" class="toggle-control">R</div>
            <div id="merge" class="toggle-control active">merge L / R</div>
            <div id="fx" class="control" style="padding-top: 1px">
                <i class="fx-icon" style="width: 15px"></i>
            </div>
        </div>
    </div>
</div>

<div id="color-div" class="track-color"></div>

`

export default class TrackElement extends HTMLElement {

    trackId: number | undefined;
    name: string;

    isArmed: boolean = false;
    isSolo: boolean = false;
    isMuted: boolean = false;
    isMonitoring: boolean = false;
    isLoading: boolean = false;
    vuMeterDiv: HTMLDivElement;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.name = "";
    }

    connectedCallback() {
        //console.log("TrackElement connectedCallback");

        if (this.shadowRoot !== null) {
            //console.log("TrackElement shadowRoot not null")
            this.shadowRoot.innerHTML = template.innerHTML;
            
            this.defineTrackElementListeners();
            this.shadowRoot.querySelectorAll(".track-volume, .track-balance, .track-controls").forEach((element) => {
                element.classList.add("hidden");
            });
            this.isLoading = true;

            this.vuMeterDiv = this.shadowRoot.querySelector("#vu-meter-div") as HTMLDivElement;
            //console.log(this.vuMeterDiv);

        }
    }

    

    defineTrackElementListeners() {
        this.trackNameInput.value = this.name;

        this.trackNameInput.addEventListener("keyup", (ev: KeyboardEvent) => {
            if (ev.code === "Enter" && ev.target !== null) {
                ev.preventDefault;
                (document.activeElement as HTMLElement).blur();
            }
        });

        this.soloBtn.addEventListener("mouseenter", () => {
            if (!this.isSolo) {
                this.soloBtn.style.color = "lightgrey";
            }
        });
        this.soloBtn.addEventListener("mouseleave", () => {
            if (!this.isSolo) {
                this.soloBtn.style.color = "grey";
            }
        });

        this.muteBtn.addEventListener("mouseenter", () => {
            if (!this.isMuted) {
                this.muteBtn.style.color = "lightgrey";
            }
        });
        this.muteBtn.addEventListener("mouseleave", () => {
            if (!this.isMuted) {
                this.muteBtn.style.color = "grey";
            }
        });

        this.armBtn.addEventListener("mouseenter", () => {
            if (!this.isArmed) {
                this.armBtn.style.filter = "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)";
            }
        });
        this.armBtn.addEventListener("mouseleave", () => {
            if (!this.isArmed) {
                this.armBtn.style.filter = "none";
            }
        });

        this.automationBtn.addEventListener("mouseenter", () => {
            this.automationBtn.style.filter = "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)";
        });
        this.automationBtn.addEventListener("mouseleave", () => {
            this.automationBtn.style.filter = "none";
        });

        this.fxBtn.addEventListener("mouseenter", () => {
            this.fxBtn.style.filter = "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)";
        });
        this.fxBtn.addEventListener("mouseleave", () => {
            this.fxBtn.style.filter = "none";
        });

        this.monitoringBtn.addEventListener("mouseenter", () => {
            if (!this.isMonitoring) {
                this.monitoringBtn.style.filter = "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)";
            }
        });
        this.monitoringBtn.addEventListener("mouseleave", () => {
            if (!this.isMonitoring) {
                this.monitoringBtn.style.filter = "none";
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


    mute() {
        this.muteBtn.style.color = "red";
        this.isMuted = true;
    }
    unmute() {
        this.muteBtn.style.color = "lightgrey"
        this.isMuted = false;
    }

    setMute(mute:boolean) {
        if(mute) this.mute()
        else this.unmute();
    }

    solo() {
        this.soloBtn.style.color = "lightgreen";
        this.isSolo = true;
    }
    unsolo() {
        this.soloBtn.style.color = "lightgrey";
        this.isSolo = false;
    }

    setSolo(solo:boolean) {
        if(solo) this.solo()
        else this.unsolo();
    }

    setName(arg0: string) {
        this.name = arg0;
        this.trackNameInput.value = arg0;
    }

    select() {
        this.style.borderColor = "lightgray";
    }

    unSelect() {
        this.style.borderColor = "black";
    }

    arm() {
        this.armBtn.style.filter = "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)";
        this.isArmed = true;
    }

    unArm() {
        this.armBtn.style.filter = "none";
        this.isArmed = false;
    }

    monitorOn() {
        this.monitoringBtn.style.filter = "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)";
        this.isMonitoring = true;
    }

    monitorOff() {
        this.monitoringBtn.style.filter = "none";
        this.isMonitoring = false;
    }

    setMono() {
        this.modeBtn.innerText = "mono ⇉ stereo";
        this.mergeBtn.hidden = true;
        this.leftBtn.hidden = false;
        this.rightBtn.hidden = false;
    }

    setStereo() {
        this.modeBtn.innerText = "stereo";
        this.mergeBtn.hidden = false;
        this.leftBtn.hidden = true;
        this.rightBtn.hidden = true;
    }

    clickMerge() {
        this.mergeBtn.classList.toggle("active");
    }

    clickLeft() {
        this.leftBtn.classList.toggle("active");
    }

    clickRight() {
        this.rightBtn.classList.toggle("active");
    }

    get closeBtn() {
        return this.shadowRoot?.getElementById("close-btn") as HTMLDivElement;
    }

    get trackNameInput() {
        return this.shadowRoot?.getElementById("name-input") as HTMLInputElement;
    }

    get soloBtn() {
        return this.shadowRoot?.getElementById("solo-btn") as HTMLDivElement;
    }

    get muteBtn() {
        return this.shadowRoot?.getElementById("mute-btn") as HTMLDivElement;
    }
 
    get volumeSlider() {
        return this.shadowRoot?.getElementById("volume-slider") as HTMLInputElement;
    }

    get balanceSlider() {
        return this.shadowRoot?.getElementById("balance-slider") as HTMLInputElement;
    }

    get color() {
        return this.shadowRoot?.getElementById("color-div") as HTMLDivElement;
    }

    get automationBtn() {
        return this.shadowRoot?.getElementById("automation") as HTMLDivElement;
    }

    get armBtn() {
        return this.shadowRoot?.getElementById("arm") as HTMLDivElement;
    }

    get monitoringBtn() {
        return this.shadowRoot?.getElementById("monitoring") as HTMLDivElement;
    }

    get fxBtn() {
        return this.shadowRoot?.getElementById("fx") as HTMLDivElement;
    }

    get modeBtn() {
        return this.shadowRoot?.getElementById("mode") as HTMLDivElement;
    }
    get leftBtn() {
        return this.shadowRoot?.getElementById("left") as HTMLDivElement;
    }

    get rightBtn() {
        return this.shadowRoot?.getElementById("right") as HTMLDivElement;
    }

    get mergeBtn() {
        return this.shadowRoot?.getElementById("merge") as HTMLDivElement;
    }
}
