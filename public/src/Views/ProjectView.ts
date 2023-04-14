import SaveProjectElement from "../Components/Project/SaveProjectElement";


export default class ProjectView {

    window: HTMLDivElement;
    mount: HTMLDivElement;
    closeBtn: HTMLButtonElement;
    title: HTMLDivElement;

    saveElement: SaveProjectElement;
    loadElement: HTMLDivElement;
    newElement: HTMLDivElement;
    manageElement: HTMLDivElement;


    constructor() {
        this.window = document.getElementById("project-window") as HTMLDivElement;
        this.mount = document.getElementById("project-mount") as HTMLDivElement;
        this.closeBtn = document.getElementById("project-close-button") as HTMLButtonElement;
        this.title = document.getElementById("project-title") as HTMLDivElement;
        this.closeBtn.onclick = () => this.close();

        this.saveElement = new SaveProjectElement();
    }

    show() {
        this.window.hidden = false;
    }

    close() {
        this.window.hidden = true;
        this.mount.innerHTML = "";
    }

    mountLoad() {
    }

    mountSave() {
        this.title.innerText = "Save Project";
        this.mount.appendChild(this.saveElement);
    }

    mountNew() {

    }

    mountManage() {

    }

}