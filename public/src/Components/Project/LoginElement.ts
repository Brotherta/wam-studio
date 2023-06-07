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
    min-width: 305px;
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
    <div id="username-form" class="form-element">
        <label for="user">User Name</label>
        <input id="user" type="text" placeholder="Username" name="user">
    </div>
    
    <div id="password-form" class="form-element">
        <label for="password">Password</label>
        <input id="password" type="password" placeholder="Password" name="password">
    </div>
    
    <div id="log">
        <br>
    </div>
    
    <button id="login-btn" type="button">Log in</button>
    <button id="logout-btn" type="button">Log out</button>
</div>    
`

export default class LoginElement extends HTMLElement {
    initialized: Boolean;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        if (!this.initialized) {
            this.shadowRoot?.appendChild(template.content.cloneNode(true));

        }
    }

    get user() {
        return this.shadowRoot?.getElementById("user") as HTMLInputElement;
    }

    get password() {
        return this.shadowRoot?.getElementById("password") as HTMLInputElement;
    }

    get log() {
        return this.shadowRoot?.getElementById("log") as HTMLDivElement;
    }

    get logInButton() {
        return this.shadowRoot?.getElementById("login-btn") as HTMLButtonElement;
    }

    get logOutButton() {
        return this.shadowRoot?.getElementById("logout-btn") as HTMLButtonElement;
    }

    get usernameForm() {
        return this.shadowRoot?.getElementById("username-form") as HTMLDivElement;
    }

    get passwordForm() {
        return this.shadowRoot?.getElementById("password-form") as HTMLDivElement;
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
}

