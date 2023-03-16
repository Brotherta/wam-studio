const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>

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

</style>

<label class="special-control-label" id="name">BIND</label>
<input class="special-control-slider" type="range" id="slider" min="0" max="100" step="1">
<label class="special-control-value" id="value">50</label>

`

export default class TrackBindControlElement extends HTMLElement {

    initialized: boolean = false;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        if (!this.initialized && this.shadowRoot !== null) {
            this.initialized = true;
            this.shadowRoot.innerHTML = template.innerHTML;
            this.defineSliderListener();
        }
    }

    get valueLabel(): HTMLLabelElement {
        return this.shadowRoot?.getElementById("value") as HTMLLabelElement;
    }

    get slider(): HTMLInputElement {
        return this.shadowRoot?.getElementById("slider") as HTMLInputElement;
    }

    get nameLabel(): HTMLLabelElement {
        return this.shadowRoot?.getElementById("name") as HTMLLabelElement;
    }

    setNameLabel(name: string) {
        this.nameLabel.innerText = name;
    }

    defineSliderListener() {
        this.slider.addEventListener("input", () => {
            this.valueLabel.innerText = this.slider.value;
        });
    }
}