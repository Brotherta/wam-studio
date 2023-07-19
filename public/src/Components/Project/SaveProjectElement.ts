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
    max-width: 305px;
}

.form-element {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    margin: 5px;
}

.confirm-div {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
    margin: 5px;
    gap: 10px;
}

button {
    margin: 5px;
    border-radius: 4px;
    width: max-content;
}

#log {
    color: white;
    margin: 5px;
    padding: 5px;
    border-radius: 4px;
}

</style>

<div class="main">
    <div class="form-element">
        <label for="user">User Name</label>
        <input id="user-input" type="text" placeholder="Username..." name="user">
    </div>
    
    <div class="form-element">
        <label for="project">Project Name</label>
        <input id="project-input" type="text" placeholder="Project Name..." name="project">
    </div>
    
    <div id="log">
        <br>
    </div>
    
    <div class="confirm-div" id="confirm" style="display: none" >
        <button id="yes" type="button">Yes</button>
        <button id="no" type="button">No</button>
    </div>
    
    <button id="save-project" type="button">Save Project</button>
</div>    
`

export default class SaveProjectElement extends HTMLElement {
    initialized: Boolean;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        if (!this.initialized) {
            this.shadowRoot?.appendChild(template.content.cloneNode(true));

            this.no.addEventListener("click", () => {
                this.confirm.style.display = "none";
                this.saveProjectButton.style.display = "";
                this._placeHolderErrorLog();
            });
            this.yes.addEventListener("click", () => {
                this.confirm.style.display = "none";
                this.saveProjectButton.style.display = "";
                this._placeHolderErrorLog();
            });
        }
    }

    get user() {
        return this.shadowRoot?.getElementById("user-input") as HTMLInputElement;
    }

    get project() {
        return this.shadowRoot?.getElementById("project-input") as HTMLInputElement;
    }

    get log() {
        return this.shadowRoot?.getElementById("log") as HTMLDivElement;
    }

    get saveProjectButton() {
        return this.shadowRoot?.getElementById("save-project") as HTMLButtonElement;
    }

    get confirm() {
        return this.shadowRoot?.getElementById("confirm") as HTMLDivElement;
    }

    get confirmLabel() {
            return this.shadowRoot?.getElementById("confirm-label") as HTMLLabelElement;
    }

    get yes() {
        return this.shadowRoot?.getElementById("yes") as HTMLButtonElement;
    }

    get no() {
        return this.shadowRoot?.getElementById("no") as HTMLButtonElement;
    }

    private _placeHolderErrorLog() {
        this.log.innerHTML = "<br>";
    }

    private _showLog(message: string, color: string) {
        this.log.innerHTML = message;
        this.log.style.backgroundColor = color;
        this.log.style.transition = "opacity 1s ease-in-out"; // add transition property
        setTimeout(() => {
            this.log.style.opacity = "0"; // fade out the element
            setTimeout(() => {
                this._placeHolderErrorLog();
                this.log.style.backgroundColor = "transparent";
                this.log.style.opacity = "1"; // reset opacity for future use
            }, 1000); // wait for 1s before hiding the element
        }, 3000);
    }

    // Method animate error log with red background, fade out after few seconds
    showError(message: string) {
        this._showLog(message, "red");
    }

    showInfo(message: string) {
        this._showLog(message, "green");
    }

    showConfirm(message: string, yesCallback: ()=>void) {
        this.log.innerHTML = message;
        this.saveProjectButton.style.display = "none";
        this.confirm.style.display = "";
        this.yes.onclick = yesCallback;
    }

    disableUserInput() {
        this.user.disabled = true;
    }
}

