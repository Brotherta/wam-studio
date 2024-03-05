import ParameterElement from "./ParameterElement";
import Preset from "../../Models/Preset";
import i18n from "../../i18n";

const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>

parameter-element {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    padding: 5px;
}

.advanced-container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    width: max-content;
    height: max-content;
    padding: 10px;
    color: lightgray;
}

section {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    margin: 7px;
}

.horizontal-grp {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.sep-line {
    width: 100%;
    height: 1px;
    background-color: lightgray;
    margin-top: 15px;
}

.btn-advanced {
    margin: 5px;
    border-radius: 2px;
    height: 30px;
}

#parameters-container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    max-height: 300px;
    min-height: 200px;
    overflow-y: scroll;
    border: solid 1px lightgray;
    border-radius: 3px;
    gap: 4px;
}

select {
    width: 200px;
}

</style>

<div class="advanced-container">
    <section>
        <div class="horizontal-grp">
            <label for="presets-select">Presets :</label>
            <select id="presets-select" class="select-advanced">
                <option value="none" selected disabled>Select a preset</option>
            </select>
        </div>
        <div class="horizontal-grp">
            <label for="preset-name">Preset name :</label>
            <input type="text" id="preset-name" placeholder="preset name">
            <button class="btn-advanced" id="save-preset" type="button">Save preset</button>
            <button class="btn-advanced" id="delete-preset" type="button">Delete preset</button>
        </div>
        <div class="horizontal-grp">
            <button class="btn-advanced" id="copy-preset-btn" type="button">Copy preset</button>
            <button class="btn-advanced" id="paste-preset-btn" type="button">Paste preset</button>
        </div>
        <div class="sep-line"></div>
    </section>
    
    <section>  
        <div class="horizontal-grp">
            <label for="binds">Binds :</label>
            <select id="binds" class="select-advanced">
                <option value="none" selected disabled>Select a bind</option>
            </select>
        </div>
        <div class="horizontal-grp">
            <button class="btn-advanced" id="new-bind-btn" type="button">New bind</button>
            <button class="btn-advanced" id="remove-bind-btn" type="button">Remove bind</button>
            <button class="btn-advanced" id="add-param-btn" type="button">Add parameter</button>
            <button class="btn-advanced" id="refresh-param-btn" type="button">Refresh parameters</button>
        </div>
    </section>
    <section>
        <div id="parameters-container">
        </div>
    </section>
</div>
`

export default class AdvancedElement extends HTMLElement {

    parameters: ParameterElement[] = [];
    initialized: boolean = false;
    firstOpen: boolean = true;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        if (!this.initialized) {
            this.shadowRoot!.appendChild(template.content.cloneNode(true));
            this.initialized = true;
        }
    }

    get presetsSelect(): HTMLSelectElement {
        return this.shadowRoot!.querySelector("#presets-select") as HTMLSelectElement;
    }

    get presetName(): HTMLInputElement {
        return this.shadowRoot!.querySelector("#preset-name") as HTMLInputElement;
    }

    get savePresetBtn(): HTMLButtonElement {
        return this.shadowRoot!.querySelector("#save-preset") as HTMLButtonElement;
    }

    get deletePresetBtn(): HTMLButtonElement {
        return this.shadowRoot!.querySelector("#delete-preset") as HTMLButtonElement;
    }

    get bindsSelect(): HTMLSelectElement {
        return this.shadowRoot!.querySelector("#binds") as HTMLSelectElement;
    }

    get newBindBtn(): HTMLButtonElement {
        return this.shadowRoot!.querySelector("#new-bind-btn") as HTMLButtonElement;
    }

    get removeBindBtn(): HTMLButtonElement {
        return this.shadowRoot!.querySelector("#remove-bind-btn") as HTMLButtonElement;
    }

    get addParamBtn(): HTMLButtonElement {
        return this.shadowRoot!.querySelector("#add-param-btn") as HTMLButtonElement;
    }

    get refreshParamBtn(): HTMLButtonElement {
        return this.shadowRoot!.querySelector("#refresh-param-btn") as HTMLButtonElement;
    }

    get parametersContainer(): HTMLDivElement {
        return this.shadowRoot!.querySelector("#parameters-container") as HTMLDivElement;
    }

    get copyPresetBtn(): HTMLButtonElement {
        return this.shadowRoot!.querySelector("#copy-preset-btn") as HTMLButtonElement;
    }

    get pastePresetBtn(): HTMLButtonElement {
        return this.shadowRoot!.querySelector("#paste-preset-btn") as HTMLButtonElement;
    }

    addBindOption(name: string) {
        const option = document.createElement("option");
        option.value = name;
        option.innerText = i18n.t(name); 
        this.bindsSelect.appendChild(option);
    }

    removeBindOption(name: string) {
        const option = this.bindsSelect.querySelector(`option[value="${name}"]`);
        if (option) {
            if (this.bindsSelect.value === name) {
                this.bindsSelect.value = "none";
            }
            this.bindsSelect.removeChild(option);
        }
    }

    addPresetsOption(name: string) {
        const option = document.createElement("option");
        option.value = name;
        option.innerText = i18n.t(name);
        this.presetsSelect.appendChild(option);
    }

    removePresetsOption(name: string) {
        const option = this.presetsSelect.querySelector(`option[value="${name}"]`);
        if (option) {
            if (this.presetsSelect.value === name) {
                this.presetsSelect.value = "none";
            }
            this.presetsSelect.removeChild(option);
        }
    }

    refreshPresetsOptions(presets: Preset[]) {
        let selected = this.presetsSelect.value;

        this.presetsSelect.innerHTML = "";
        let firstOption = document.createElement("option");
        firstOption.value = i18n.t("none");
        firstOption.innerText = i18n.t("selectAPreset");
        firstOption.disabled = true;
        this.presetsSelect.appendChild(firstOption);

        if (selected === "none") {
            firstOption.selected = true;
        }

        for (let preset of presets) {
            let option = document.createElement("option");
            option.value = preset.name;
            option.innerText = i18n.t(preset.name);
            this.presetsSelect.appendChild(option);
            if (selected === preset.name) {
                option.selected = true;
            }
        }

    }

    selectPreset(name: string) {
        this.presetsSelect.value = name;
    }

    addParameterElement(parameterElement: ParameterElement) {
        this.parameters.push(parameterElement);
        this.parametersContainer.appendChild(parameterElement);
    }

    removeParameterElement(parameterElement: ParameterElement) {
        this.parameters.splice(this.parameters.indexOf(parameterElement), 1);
        this.parametersContainer.removeChild(parameterElement);
    }

    hideAllParameters() {
        for (const parameter of this.parameters) {
            parameter.style.display = "none";
        }
    }

}