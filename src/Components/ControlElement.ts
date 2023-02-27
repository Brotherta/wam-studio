const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>

.control-item {
    height: 100%;
    width: 200px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: space-evenly;
    align-items: center;
    border-left: 1px solid black;
    border-right: 1px solid black;
}

.special-control-slider {
    transform: scale(1.5);
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

<div class="control-item">
    <label class="special-control-label">CLARITY</label>
    <input class="special-control-slider" type="range">
    <label class="special-control-value">100</label>
</div>

<div class="control-item">
    <label class="special-control-label">WEIGHT</label>
    <input class="special-control-slider" type="range">
    <label class="special-control-value">100</label>
</div>

<button type="button" class="btn btn-light adv-btn">Advanced</button>
`

export default class ControlElement extends HTMLElement {

    trackId: number;
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

    defineTrackNameListener() {

    }
}
