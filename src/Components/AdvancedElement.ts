const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>
#advanced-buttons {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 10px;
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

.parameter-item {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    padding: 5px;
}

.btn-advanced {
    margin: 5px;
    border-radius: 6px;
}

.select-advanced {
    margin: 5px;
    border-radius: 4px;
    width: 190px;
    text-overflow: ellipsis;
}
</style>

<div id="advanced-buttons">
    <button class="btn-advanced" id="clarity-btn" type="button">Clarity</button>
    <button class="btn-advanced" id="weight-btn" type="button">Weight</button>
    <button class="btn-advanced" id="new-bind-btn" type="button">New bind</button>
</div>

<div class="dropdown-container">
    <div class="parameter-item">
        <select class="select-advanced" id="options">
            <option value="" disabled selected>Select a plugin</option>
            <option value="Option 1">Option 1</option>
            <option value="Option 2">Option 2</option>
            <option value="Option 3">Option 3</option>
        </select>
        
        <select class="select-advanced" id="choices">
            <option value="" disabled selected>Select a parameter</option>
        </select>
        
        <button class="btn-advanced" id="delete-bind" type="button">X</button>
    </div>
</div>
`

export default class AdvancedElement extends HTMLElement {

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
