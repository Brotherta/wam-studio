import LoginElement from "../Components/Project/LoginElement";
import LoadProjectElement from "../Components/Project/LoadProjectElement";
import SaveProjectElement from "../Components/Project/SaveProjectElement";
import ExportProjectElement from "../Components/Project/ExportProjectElement";
import DraggableWindow from "../Utils/DraggableWindow";

/**
 * View for the project window. It contains all the elements of the project window. Load, save, login and export.
 */
export default class ProjectView extends DraggableWindow {

    window= document.getElementById("project-window") as HTMLDivElement;
    mount= document.getElementById("project-mount") as HTMLDivElement;
    closeBtn= document.getElementById("project-close-button") as HTMLButtonElement;
    title= document.getElementById("project-title") as HTMLDivElement;
    login = document.getElementById("login") as HTMLDivElement;

    saveElement = new SaveProjectElement();
    loadElement = new LoadProjectElement();
    loginElement = new LoginElement();
    exportElement = new ExportProjectElement();

    constructor() {
        super(document.getElementById("project-header") as HTMLDivElement, document.getElementById("project-window") as HTMLDivElement);
    }

    /**
     * Shows the project window.
     */
    public show() {
        this.window.hidden = false;
    }

    /**
     * Closes the project window.
     */
    public close() {
        this.window.hidden = true;
        this.mount.innerHTML = "";
    }

    /**
     * Mounts the load project element.
     */
    public mountLoad() {
        this.title.innerText = "Load Project";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.loadElement);
    }

    /**
     * Mounts the save project element.
     */
    public mountSave() {
        this.title.innerText = "Save Project";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.saveElement);
    }

    /**
     * Mounts the login element.
     */
    public mountLogin() {
        this.title.innerText = "Login";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.loginElement);
    }

    /**
     * Mounts the export element.
     */
    public mountExport() {
        this.title.innerText = "Export Project";
        this.mount.innerHTML = "";
        this.mount.appendChild(this.exportElement);
    }

    /**
     * Mounts the login element.
     * If the user is logged in, it shows the logout button and hides the login button.
     *
     * @param isLoggedIn - True if the user is logged in.
     */
    public updateLogin(isLoggedIn: boolean) {
        this.loginElement.logInButton.hidden = isLoggedIn;
        this.loginElement.logOutButton.hidden = !isLoggedIn;

        this.loginElement.usernameForm.style.display = isLoggedIn ? "none" : "flex";
        this.loginElement.passwordForm.style.display = isLoggedIn ? "none" : "flex";
        this.title.innerText = isLoggedIn ? "Log out" : "Log in";

        this.login.innerText = isLoggedIn ? "Log out" : "Log in";
    }

}