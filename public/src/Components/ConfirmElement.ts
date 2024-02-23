const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>

.main {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    color: lightgrey;
    margin: 10px;
}

.element {
    width: 100%;
}

.form-element {
	width: 100%;
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: space-evenly;
	align-items: center;
	margin: 5px;
	max-width: 300px;
}

button {
    margin: 5px;
    border-radius: 4px;
    width: max-content;
}

.message {
    color: lightgray;
}

</style>

<div class="main">
    <div class="form-element">
        <div class="message">
        
        </div>
    </div>
    
    <div class="form-element">
        <button id="confirm">Confirm</button>
        <button id="cancel">Cancel</button>
    </div>
</div>    
`

export default class ConfirmElement extends HTMLElement {

    private initialized: boolean = false;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        if (!this.initialized) {
            this.shadowRoot?.appendChild(template.content.cloneNode(true));
            this.initialized = true;
        }
    }

    get confirmButton(): HTMLButtonElement {
        return this.shadowRoot?.querySelector("#confirm") as HTMLButtonElement;
    }

    get cancelButton(): HTMLButtonElement {
        return this.shadowRoot?.querySelector("#cancel") as HTMLButtonElement;
    }

    setMessage(message: string) {
        // tzfeng: clear the message before appending a new one
        (this.shadowRoot?.querySelector(".message") as HTMLDivElement).innerHTML = "";
        this.shadowRoot?.querySelector(".message")?.append(message);
    }
}

