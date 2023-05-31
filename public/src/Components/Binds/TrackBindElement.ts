import BindSliderElement from "./BindSliderElement";
import Preset from "../../Models/Preset";

const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>

bind-slider-element {
    height: 100%;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: space-evenly;
    align-items: center;
    border-left: 1px solid black;
    border-right: 1px solid black;
    margin-left: 30px;
}

.special-control-slider {
    transform: scale(1.5);
    width: 125px;
}

.special-control-label {
    color: lightgray;
    font-weight: bold;
    font-size: 20px;
}

.special-control-value {
    color: lightgray;
    font-weight: bold;
    font-size: 15px;
}

.main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
}

#controls {
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    overflow: auto;
}

#presets-control {
	height: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	align-items: center;
	/*justify-content: center;*/
	/*gap: 10px;*/
	padding-right: 20px;
	padding-left: 20px;
	border-left: solid 1px black;
}

</style>

<div class="main">
    <div id="controls">
    
    </div>
    <div id="presets-control">
        <div class="special-control-value" style="padding: 10px">
            Presets
        </div>
        <select id="presets-select">
            <option value="Default" selected>Default</option>
        </select>
    </div>
</div>
`

export default class TrackBindElement extends HTMLElement {

    trackId: number;
    initialized: boolean = false;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        if (this.shadowRoot !== null && !this.initialized) {
            this.shadowRoot.innerHTML = template.innerHTML;
            this.initialized = true;
        }
    }

    get controlsContainer(): HTMLDivElement {
        return this.shadowRoot?.getElementById("controls") as HTMLDivElement;
    }

    addBindSliderElement(slider: BindSliderElement) {
        this.controlsContainer.appendChild(slider);
    }

    removeBindSliderElement(name: string) {
        let slider = this.shadowRoot!.getElementById("slider-"+name);
        if (slider !== null) {
            slider.remove();
        }
    }

    selectPresets(name: string) {
        this.presetsSelect.value = name;
    }

    refreshPresetsOptions(presets: Preset[]) {
        let selected = this.presetsSelect.value;

        this.presetsSelect.innerHTML = "";
        let firstOption = document.createElement("option");
        firstOption.value = "none";
        firstOption.innerText = "Select a preset";
        firstOption.disabled = true;
        this.presetsSelect.appendChild(firstOption);

        if (selected === "none") {
            firstOption.selected = true;
        }

        for (let preset of presets) {
            let option = document.createElement("option");
            option.value = preset.name;
            option.innerText = preset.name;
            this.presetsSelect.appendChild(option);
            if (selected === preset.name) {
                option.selected = true;
            }
        }

    }

    get presetsSelect(): HTMLSelectElement {
        return this.shadowRoot?.getElementById("presets-select") as HTMLSelectElement;
    }
}
