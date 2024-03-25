import i18n from "../i18n";

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

button {
    margin: 5px;
    border-radius: 4px;
    width: max-content;
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
    
    <div id="error-log">
        <br>
    </div>
    
    <button id="load-project" type="button">Save Project</button>
</div>    
`

export default class DialogElement extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(template.content.cloneNode(true));
        this.loadProjectButton.addEventListener("click", () => {
            if (this.user.value === "" || this.project.value === "") {
                this.showError(i18n.t("pleaseFillInAllFields"));
                return;
            }
        });
    }

    get user() {
        return this.shadowRoot?.getElementById("user-input") as HTMLInputElement;
    }

    get project() {
        return this.shadowRoot?.getElementById("project-input") as HTMLInputElement;
    }

    get errorLog() {
        return this.shadowRoot?.getElementById("error-log") as HTMLDivElement;
    }

    get loadProjectButton() {
        return this.shadowRoot?.getElementById("load-project") as HTMLButtonElement;
    }

    private _placeHolderErrorLog() {
        this.errorLog.innerHTML = "<br>";
    }

    // Method animate error log with red background, fade out after few seconds
    showError(message: string) {
        this.errorLog.innerHTML = message;
        this.errorLog.style.backgroundColor = "red";
        this.errorLog.style.transition = "opacity 1s ease-in-out"; // add transition property
        setTimeout(() => {
            this.errorLog.style.opacity = "0"; // fade out the element
            setTimeout(() => {
                this._placeHolderErrorLog();
                this.errorLog.style.backgroundColor = "transparent";
                this.errorLog.style.opacity = "1"; // reset opacity for future use
            }, 1000); // wait for 1s before hiding the element
        }, 3000);
    }
}

