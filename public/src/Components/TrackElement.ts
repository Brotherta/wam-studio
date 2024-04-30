import { translateHTMLString } from "../i18n";

const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<link rel="stylesheet" href="style/instruments-icons.css">

<style>

.icon {
    padding-left: 23px;
    padding-right: 23px;
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

.track-header {
    display: flex;
    width: 100%;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
    min-height: 30px;
    font-family: Helvetica, monospace;
    color: pink;
}

.track-volume {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center; 
    min-height: 30px;
}

.track-balance {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
    min-height: 30px;
}

.track-controls {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    min-height: 30px;
}

.track-name {
    color: lightgrey;
    font-familiy: Helvetica, monospace;
    font-weight: bold;
    max-width: 146px;
    min-width: 146px;
    overflow: hidden;
    font-size: large;
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
    width: 90px !important;
    transform: scale(1.5);
}

.letter-icon {
    color: lightgrey;
    padding-left: 28px;
    padding-right: 28px;
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
    color: black;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 17px;
    font-weight: bold;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;  
    background-color: lightgrey;
    border-radius: 5px;
}

.mute-icon:hover, .solo-icon:hover {
    background-color: #afafaf;
    cursor: pointer;
}

.control {
    padding-left: 10px;
    padding-right: 10px;
    color: grey;
}

.control:hover {
    cursor: pointer;
}

#settings-btn:hover {
    cursor: pointer;
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

.icon-instrument {
    width: 100%;
    height: 30px;
    display: flex;
    flex-direction: row-reverse;
    padding-right: 10px;
}

</style>

<link rel="stylesheet" href="/style/icons.css">

<div class="track-utils">
    <div class="track-header">
        <input id="name-input" class="track-name">
        
        <div id="settings-btn" class="advanced">
            <img class="settings-icon">
        </div>
        
        <div id="close-btn" class="track-close advanced">
            <img src="/icons/x-circle-fill.svg">
        </div>
      
    </div>
    
    <div id="loading-container">
        <div id="loading-bar"></div>
    </div>
    <div id="progress-bar-text"></div>
  
    
<!--    <div class="track-volume">-->
<!--        <div class="icon">-->
<!--            <img src="icons/volume-down-track.svg">-->
<!--        </div>-->
<!--        <input type="range" class="form-range tracko" id="volume-slider">-->
<!--        <div class="icon">-->
<!--            <img src="icons/volume-up-track.svg">-->
<!--        </div>-->
<!--    </div>-->
<!--    <div class="icon-instrument">-->
<!--        <div class="other"></div>-->
<!--    </div>-->
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
        <div id="mute-btn" class="mute-icon" hidden data-i18n="Mute">Mute</div>
        <div id="solo-btn" class="solo-icon" data-i18n="solo">Solo</div>
        <div id="instrument-icon" class="other"></div>
        <div id="arm" class="control" hidden>
            <img src="icons/mic-fill.svg">
        </div>
        <div id="automation" class="control" hidden>
            <img src="icons/graph_6.svg">
        </div>
    </div>
</div>
<div id="color-div" class="track-color">
</div>

`

export default class TrackElement extends HTMLElement {

    trackId: number | undefined;
    name: string;

    isArmed: boolean = false;
    isSolo: boolean = false;
    isMuted: boolean = false;
    isLoading: boolean = false;
    private initialized: Boolean;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.name = "";
    }

    connectedCallback() {
        if (this.shadowRoot !== null && !this.initialized) {
            this.shadowRoot.innerHTML = translateHTMLString(template.innerHTML);
            this.initialized = true;
            this.defineTrackNameListener();
            this.shadowRoot.querySelectorAll(".track-volume, .track-balance, .track-controls").forEach((element) => {
                element.classList.add("hidden");
            });
            this.isLoading = true;
        }
    }



    defineTrackNameListener() {
        this.trackNameInput.value = this.name;

        // @tzfeng 5/29/2024
        // Hacky way to prevent the user from editing the track name 
        // only advanced users can edit the track name
        if (localStorage.getItem("advancedMode") === "false") {
            this.trackNameInput.readOnly = true;
        }

        this.trackNameInput.addEventListener("keyup", (ev: KeyboardEvent) => {
            if (ev.code === "Enter" && ev.target !== null) {
                ev.preventDefault;
                (document.activeElement as HTMLElement).blur();
            }
        });

        this.trackNameInput.addEventListener("change", () => {
            this.name = this.trackNameInput.value;
        });

        this.settingsBtn.addEventListener("mouseenter", () => {
            this.settingsBtn.style.filter = "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)";
        });

        this.settingsBtn.addEventListener("mouseleave", () => {
            this.settingsBtn.style.filter = "none";
        });

        this.soloBtn.addEventListener("mouseenter", () => {
            if (!this.isSolo) {
                this.soloBtn.style.backgroundColor = "white";
            }
        });
        this.soloBtn.addEventListener("mouseleave", () => {
            if (!this.isSolo) {
                this.soloBtn.style.backgroundColor = "lightgrey";
            }
        });

        this.muteBtn.addEventListener("mouseenter", () => {
            if (!this.isMuted) {
                this.muteBtn.style.backgroundColor = "white";
            }
        });
        this.muteBtn.addEventListener("mouseleave", () => {
            if (!this.isMuted) {
                this.muteBtn.style.backgroundColor = "lightgrey";
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
        this.muteBtn.style.backgroundColor = "#767373";
        this.isMuted = true;
    }
    unmute() {
        this.muteBtn.style.color = "black";
        this.muteBtn.style.backgroundColor = "white";
        this.isMuted = false;
    }

    solo() {
        this.soloBtn.style.backgroundColor = "#767373";
        this.soloBtn.style.color = "lightgreen";
        this.isSolo = true;
    }
    unsolo() {
        this.soloBtn.style.color = "black";
        this.soloBtn.style.backgroundColor = "white";
        this.isSolo = false;
    }

    setName(arg0: string) {
        this.trackNameInput.value = arg0;
        this.name = arg0;
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

    switchMode(advancedMode: boolean) {
        let advancedControls = this.shadowRoot?.querySelectorAll(".advanced");
        if (advancedControls === undefined) {
            return;
        }
        for (let element of advancedControls) {
            if (advancedMode) {
                // element.removeAttribute("hidden");
                element.setAttribute("style", "")
            } else {
                element.setAttribute("style", "display: none;");
            }
        }
    }


    get settingsBtn() {
        return this.shadowRoot?.getElementById("settings-btn") as HTMLDivElement;
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

    get instrumentIcon() {
        return this.shadowRoot?.getElementById("instrument-icon") as HTMLDivElement;
    }
}
