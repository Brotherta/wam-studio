const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>

track-bind-control-element {
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

#controls {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    overflow: auto;
}

</style>

<div id="controls">

</div>
`

export default class TrackControlElement extends HTMLElement {

    trackId: number;
    name: string;
    initialized: boolean = false;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.name = "";
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
}
