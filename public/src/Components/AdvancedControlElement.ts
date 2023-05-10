import {WamParameterInfoMap} from "@webaudiomodules/api";
import TrackControl from "../Models/TrackControl";
import {app} from "../index";
import Bind from "../Models/Bind";
import Preset from "../Models/Preset";
import {SongTagEnum} from "../Utils/SongTagEnum";

const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>
.bind-buttons {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    flex-basis: content;
    align-items: center;
    width: 100%;
    padding-top: 10px;
    padding-bottom: 10px;
    overflow-x: visible;
    overflow-y: hidden;
}

.dropdown-container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    overflow-y: scroll;
    align-items: flex-start;
    width: 100%;
    height: 100%;
    border: solid 1px lightgray;
    border-radius: 3px;
}

bind-parameter-element {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    padding: 5px;
}

.btn-advanced {
    margin: 5px;
    border-radius: 2px;
    height: 30px;
}

.btn-advanced-close {
    margin: 5px;
    border-radius: 2px;
}

.select-advanced {
    margin: 5px;
    border-radius: 4px;
    width: 190px;
    text-overflow: ellipsis;
}

.active {
    background-color: gray;
}

.tag-header {
    color: lightgrey;
    font-size: 15px;
    font-weight: bold;
}

div {
    color: lightgrey;
}

</style>

<div class="tag-header" id="tag" style="padding-left: 5px">
    TAG: OTHER
</div>

<div class="bind-buttons" style="padding-left: 5px">
    <div>Presets :</div>
    <select class="select-advanced" id="presets-select">
        <option value="none" disabled selected>Select a preset</option>
    </select>
</div>

<div class="bind-buttons" style="padding-left: 5px">
    <input type="text" id="preset-name" placeholder="preset name">
    <button class="btn-advanced" id="save-preset" type="button">Save preset</button>
    <button class="btn-advanced" id="delete-preset" type="button">Delete preset</button>
</div>

<div class="bind-buttons" style="margin-bottom: 15px">
    <button class="btn-advanced" id="new-bind-btn" type="button">New bind</button>
    <button class="btn-advanced" id="remove-bind-btn" type="button">Remove bind</button>
    <button class="btn-advanced" id="add-param-btn" type="button">Add parameter</button>
    <button class="btn-advanced" id="refresh-param-btn" type="button">Refresh parameters</button>
</div>

<div class="bind-buttons" id="bind-buttons">

</div>

<div class="dropdown-container" id="parameters-container">

</div>
`


export default class AdvancedControlElement extends HTMLElement {

    name: string;
    control: TrackControl;
    initialized: boolean = false;

    presetsOptions: string[];
    selectedPreset: Preset | null;
    activeBind: Bind | null;
    tag: SongTagEnum;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.name = "";
        this.presetsOptions = [];
        this.selectedPreset = null;
        this.activeBind = null;
    }

    connectedCallback() {
        if (!this.initialized && this.shadowRoot !== null) {
            this.initialized = true;
            this.shadowRoot.innerHTML = template.innerHTML;
            app.trackControlController.defineAdvancedControlListeners(this.control);
            app.trackControlController.defineTrackControlListeners(this.control);
        }
        this.updatePresetsOptions();
    }

    get newBindButton() {
        return this.shadowRoot?.getElementById("new-bind-btn") as HTMLButtonElement;
    }

    get removeBindButton() {
        return this.shadowRoot?.getElementById("remove-bind-btn") as HTMLButtonElement;
    }

    get addParamButton() {
        return this.shadowRoot?.getElementById("add-param-btn") as HTMLButtonElement;
    }

    get bindsButtons() {
        return this.shadowRoot?.getElementById("bind-buttons") as HTMLDivElement;
    }

    get parametersContainer() {
        return this.shadowRoot?.getElementById("parameters-container") as HTMLDivElement;
    }

    get refreshParamButton() {
        return this.shadowRoot?.getElementById("refresh-param-btn") as HTMLButtonElement;
    }

    get tagHeader() {
        return this.shadowRoot?.getElementById("tag") as HTMLDivElement;
    }

    get presetsSelect() {
        return this.shadowRoot?.getElementById("presets-select") as HTMLSelectElement;
    }

    get presetName() {
        return this.shadowRoot?.getElementById("preset-name") as HTMLInputElement;
    }

    get savePresetButton() {
        return this.shadowRoot?.getElementById("save-preset") as HTMLButtonElement;
    }

    get deletePresetButton() {
        return this.shadowRoot?.getElementById("delete-preset") as HTMLButtonElement;
    }

    addBindButton(name: string) {
        const btn = document.createElement("button");
        btn.classList.add("btn-advanced");
        btn.id = name;
        btn.textContent = name;
        this.shadowRoot!.getElementById("bind-buttons")!.appendChild(btn);
        return btn;
    }

    updatePresetsOptions() {
        this.tagHeader.innerHTML = "TAG: " + this.tag;
        if (this.selectedPreset !== null) {
            this.unSelectAllPresets();
            this.selectPreset(this.selectedPreset.name);
            this.presetName.value = this.selectedPreset.name;
        }
        for (let preset of this.presetsOptions) {
            this.addPresetOption(preset);
        }
    }

    refreshBindParams(params: WamParameterInfoMap) {
        if (this.selectedPreset !== null) {
            for (let bind of this.selectedPreset.binds) {
                for (let bindParam of bind.bindParameters) {
                    bindParam.refreshParam(params);
                }
            }
        }
    }

    unselectAllBinds() {
        for (let bindBtn of this.shadowRoot?.querySelectorAll(".btn-advanced")!) {
            bindBtn.classList.remove("active");
        }
    }

    clickBind(btn: HTMLButtonElement, bind: Bind) {
        this.unselectAllBinds();
        btn.classList.add("active");
        this.activeBind = bind;

        this.parametersContainer.innerHTML = "";
        for (let bindParam of bind.bindParameters) {
            this.parametersContainer.appendChild(bindParam);
        }
    }

    addPresetOption(preset: string) {
        for (let option of this.presetsSelect.options) {
            if (option.value === preset) {
                return;
            }
        }
        const option = document.createElement("option");
        option.value = preset;
        option.textContent = preset;
        this.presetsSelect.appendChild(option);
    }

    removePresetOption(preset: string) {
        for (let option of this.presetsSelect.options) {
            if (option.value === preset) {
                this.presetsSelect.removeChild(option);
                return;
            }
        }
    }

    unSelectAllPresets() {
        for (let option of this.presetsSelect.options) {
            option.selected = false;
        }
    }

    private selectPreset(name: string) {
        for (let option of this.presetsSelect.options) {
            if (option.value === name) {
                option.selected = true;
                return;
            }
        }
    }
}
