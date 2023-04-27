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
    max-width: 118px;
    min-width: 118px;
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

/*.toggle-control {*/
/*  border: 1px solid grey;*/
/*  border-radius: 2px;*/
/*  background-color: transparent;*/
/*  color: grey;*/
/*  font-size: 8px;*/
/*  font-family: "Helvetica Neue", sans-serif;*/
/*  font-weight: bold;*/
/*  text-transform: uppercase;*/
/*  padding: 1px 3px;*/
/*  transition: all 0.2s ease;*/
/*  cursor: pointer;*/
/*  margin-bottom: 3px;*/
/*}*/

/*.toggle-control:hover, .toggle-control.active {*/
/*  background-color: #e74c3c;*/
/*  color: white;*/
/*  border-color: #c0392b;*/
/*}*/

/*.toggle-control:active {*/
/*  background-color: #c0392b;*/
/*}*/

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




</style>

<link rel="stylesheet" href="style/icons.css">

<div class="track-utils">
    <div class="track-header">
        <input id="name-input" class="track-name">
    
        <div id="close-btn" class="track-close">
<!--            <img src="/icons/x-circle-fill.svg">-->
            <i class="close-icon" style="width: 14px"></i>
        </div>
    </div>
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
        <div id="monitoring" class="control">
            <i class="monitor-icon" style="padding-top: 4px"></i>
        </div>
        <div id="arm" class="control">
            <i class="mic-icon" style="width: 15px"></i>
        </div>
        <div id="automation" class="control">
            <i class="automation-icon" style="width: 15px"></i>
        </div>
    </div>
<!--    <div class="track-controls" style="padding-top: 5px">-->
<!--        <div id="mono" class="toggle-control">mono</div>-->
<!--        <div id="stereo" class="toggle-control">stereo</div>-->
<!--        <div id="chan1" class="toggle-control">ch1</div>-->
<!--        <div id="chan2" class="toggle-control">ch2</div>-->
<!--    </div>-->
     <div class="track-controls" style="padding-top: 5px">
        <div id="mode" class="toggle-control">mono</div>
        <div id="left" class="toggle-control active">L</div>
        <div id="right" class="toggle-control">R</div>
        <div id="merge" class="toggle-control active">merge</div>
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
    isMonitoring: boolean = false;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.name = "";
    }

    connectedCallback() {
        if (this.shadowRoot !== null) {
            this.shadowRoot.innerHTML = template.innerHTML;
            
            this.defineTrackNameListener();
        }
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

    defineTrackNameListener() {
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

    mute() {
        this.muteBtn.style.color = "red";
        this.isMuted = true;
    }
    unmute() {
        this.muteBtn.style.color = "lightgrey"
        this.isMuted = false;
    }

    solo() {
        this.soloBtn.style.color = "lightgreen";
        this.isSolo = true;
    }
    unsolo() {
        this.soloBtn.style.color = "lightgrey";
        this.isSolo = false;
    }

    setName(arg0: string) {
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
        this.modeBtn.innerText = "mono";
        this.mergeBtn.hidden = true;
        this.leftBtn.hidden = false;
        this.rightBtn.hidden = false;
        // this.leftBtn.classList.add("active");
        // this.rightBtn.classList.remove("active");
    }

    setStereo() {
        this.modeBtn.innerText = "stereo";
        this.mergeBtn.hidden = false;
        this.leftBtn.hidden = true;
        this.rightBtn.hidden = true;
        // this.mergeBtn.classList.add("active");
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

}
