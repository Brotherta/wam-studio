import SaveProjectElement from "../Components/Project/SaveProjectElement";
import LoadProjectElement from "../Components/Project/LoadProjectElement";
import LoginElement from "../Components/Project/LoginElement";
import ConfirmElement from "../Components/ConfirmElement";


export default class ProjectView {

    window: HTMLDivElement;
    mount: HTMLDivElement;
    closeBtn: HTMLButtonElement;
    title: HTMLDivElement;

    saveElement: SaveProjectElement;
    loadElement: LoadProjectElement;
    loginElement: LoginElement;
    newElement: HTMLDivElement;
    manageElement: HTMLDivElement;
    confirmElement: ConfirmElement;


    constructor() {
        this.window = document.getElementById("project-window") as HTMLDivElement;
        this.mount = document.getElementById("project-mount") as HTMLDivElement;
        this.closeBtn = document.getElementById("project-close-button") as HTMLButtonElement;
        this.title = document.getElementById("project-title") as HTMLDivElement;
        this.closeBtn.onclick = () => this.close();

        this.saveElement = new SaveProjectElement();
        this.loadElement = new LoadProjectElement();
        this.loginElement = new LoginElement();
    }

    show() {
        this.window.hidden = false;
    }

    close() {
        this.window.hidden = true;
        this.mount.innerHTML = "";
    }

    mountLoad() {
        this.title.innerText = "Load Project";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.loadElement);
    }

    mountSave() {
        this.title.innerText = "Save Project";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.saveElement);
    }

    mountNew() {
        this.title.innerText = "New Project";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.saveElement);
    }

    mountLogin() {
        this.title.innerText = "Log in";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.loginElement);
    }

    mountConfirm() {
        this.title.innerText = "Confirm";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.confirmElement);
    }

    updateLogin(isLogged: boolean) {
        this.loginElement.logInButton.hidden = isLogged;
        this.loginElement.logOutButton.hidden = !isLogged;

        this.loginElement.usernameForm.style.display = isLogged ? "none" : "flex";
        this.loginElement.passwordForm.style.display = isLogged ? "none" : "flex";
        this.title.innerText = isLogged ? "Log out" : "Log in";
    }
}