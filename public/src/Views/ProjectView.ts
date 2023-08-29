import LoginElement from "../Components/Project/LoginElement";
import LoadProjectElement from "../Components/Project/LoadProjectElement";
import SaveProjectElement from "../Components/Project/SaveProjectElement";
import ConfirmElement from "../Components/Utils/ConfirmElement";
import {focusWindow} from "../Controllers/StaticController";
import ExportProjectElement from "../Components/Project/ExportProjectElement";


export default class ProjectView {

    window: HTMLDivElement;
    mount: HTMLDivElement;
    closeBtn: HTMLButtonElement;
    title: HTMLDivElement;

    saveElement: SaveProjectElement;
    loadElement: LoadProjectElement;
    loginElement: LoginElement;
    exportElement: ExportProjectElement;

    login: HTMLDivElement;

    constructor() {
        this.window = document.getElementById("project-window") as HTMLDivElement;
        this.mount = document.getElementById("project-mount") as HTMLDivElement;
        this.closeBtn = document.getElementById("project-close-button") as HTMLButtonElement;
        this.title = document.getElementById("project-title") as HTMLDivElement;
        this.closeBtn.onclick = () => this.close();

        this.saveElement = new SaveProjectElement();
        this.loadElement = new LoadProjectElement();
        this.loginElement = new LoginElement();
        this.exportElement = new ExportProjectElement();

        this.login = document.getElementById("login") as HTMLDivElement;
    }

    show() {
        this.window.hidden = false;
        focusWindow(this.window);
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

    mountLogin() {
        this.title.innerText = "Login";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.loginElement);
    }

    mountExport() {
        this.title.innerText = "Export Project";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.exportElement);
    }


    updateLogin(isLoggedIn: boolean) {
        this.loginElement.logInButton.hidden = isLoggedIn;
        this.loginElement.logOutButton.hidden = !isLoggedIn;

        this.loginElement.usernameForm.style.display = isLoggedIn ? "none" : "flex";
        this.loginElement.passwordForm.style.display = isLoggedIn ? "none" : "flex";
        this.title.innerText = isLoggedIn ? "Log out" : "Log in";

        this.login.innerText = isLoggedIn ? "Log out" : "Log in";
    }

}