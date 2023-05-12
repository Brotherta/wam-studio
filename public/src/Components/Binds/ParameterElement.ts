import {WamParameterInfoMap} from "@webaudiomodules/api";
import Parameter from "../../Models/Parameter";

const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>

.select-advanced {
    margin: 5px;
    border-radius: 4px;
    width: 220px;
    text-overflow: ellipsis;
}

.btn-advanced-close {
    margin: 5px;
    border-radius: 2px;
}

.input-number {
    width: 80px;
    margin-right: 5px;
    margin-left: 2px;
}

label {
    color: lightgrey;
}

</style>

<select class="select-advanced" id="options">
    <option value="none" selected>Select a parameter</option>
</select>

<label for="min-input">min</label>
<input class="input-number" id="min-input" type="number">
<label for="max-input">max</label>
<input class="input-number" id="max-input" type="number">

<button class="btn-advanced-close" id="delete-bind" type="button">X</button>
    
`

export default class ParameterElement extends HTMLElement {

    parameter: Parameter | undefined;

    initialized: boolean = false;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        if (!this.initialized && this.shadowRoot !== null) {
            this.initialized = true;
            this.shadowRoot.innerHTML = template.innerHTML;

            this.defineListeners();
        }
    }

    defineListeners() {

    }

    get deleteBtn() {
        return this.shadowRoot?.getElementById("delete-bind") as HTMLButtonElement;
    }

    get options() {
        return this.shadowRoot?.getElementById("options") as HTMLSelectElement;
    }

    get minInput() {
        return this.shadowRoot?.getElementById("min-input") as HTMLInputElement;
    }

    get maxInput() {
        return this.shadowRoot?.getElementById("max-input") as HTMLInputElement;
    }

    selectParam(param: Parameter) {
        this.parameter = param;
        this.options.value = param.parameterName;

        this.minInput.value = param.currentMin.toString();
        this.maxInput.value = param.currentMax.toString();

        this.minInput.min = param.currentMin.toString();
        this.maxInput.min = param.currentMin.toString();

        this.minInput.max = param.currentMax.toString();
        this.maxInput.max = param.currentMax.toString();

        this.minInput.step = param.discreteStep.toString();
        this.maxInput.step = param.discreteStep.toString();
    }

    refreshParam(params: WamParameterInfoMap) {
        let selected = this.options.value;

        this.options.innerHTML = "";
        let firstOption = document.createElement("option");
        firstOption.value = "none";
        firstOption.innerText = "Select a parameter";
        this.options.appendChild(firstOption);

        if (selected == "none") {
            firstOption.selected = true;
        }

        for (let param in params) {
            let option = document.createElement("option");
            option.value = param;
            option.innerText = param;
            this.options.appendChild(option);
            if (selected == param) {
                option.selected = true;
            }
        }
    }

    setMin(newMin: number) {
        this.parameter!.currentMin = newMin;
        this.minInput.value = newMin.toString();
    }

    setMax(newMax: number) {
        this.parameter!.currentMax = newMax;
        this.maxInput.value = newMax.toString();
    }
}
