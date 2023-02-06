const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

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

</style>

<div class="track-utils">
    <div class="track-header">
        <input id="name-input" class="track-name">
    
        <div id="close-btn" class="track-close">
            <img src="/icons/x-circle-fill.svg">
        </div>
    </div>
    <div class="track-volume">
        <div class="icon">
            <img src="icons/volume-down-track.svg">
        </div>
        <input type="range" class="form-range tracko" id="volume-slider">
        <div class="icon">
            <img src="icons/volume-up-track.svg">
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
        <div id="mute-btn" class="mute-icon">Mute</div>
        <div id="solo-btn" class="solo-icon">Solo</div>
    </div>
</div>
<div id="color-div" class="track-color">
</div>

`

export default class TrackElement extends HTMLElement {

    trackId: number | undefined;
    name: string;

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

    defineTrackNameListener() {
        this.trackNameInput.value = this.name;

        this.trackNameInput.addEventListener("keyup", (ev: KeyboardEvent) => {
            if (ev.code === "Enter" && ev.target !== null) {
                ev.preventDefault;
                (document.activeElement as HTMLElement).blur();
            }
        });
    }

    mute() {
        this.muteBtn.style.color = "red";
        this.muteBtn.style.backgroundColor = "#767373";
    }
    unmute() {
        this.muteBtn.style.color = "black"
        this.muteBtn.style.backgroundColor = "";
    }

    solo() {
        this.soloBtn.style.color = "#78ff82";
        this.soloBtn.style.backgroundColor = "#767373";
    }
    unsolo() {
        this.soloBtn.style.color = "black";
        this.soloBtn.style.backgroundColor = "";
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
}
