import Track from "../Models/Track";


export default class AutomationView {

    automationMenu = document.getElementById("automation-menu") as HTMLDivElement;
    itemList = document.getElementById("list-automation") as HTMLElement;

    openAutomationMenu(track: Track) {
        let trackElement = track.element;
        let bd = trackElement.getBoundingClientRect();
        this.automationMenu.style.transform = `translate(${bd.left + bd.width - 15}px, ${bd.top+15}px)`;
        this.automationMenu.hidden = false;
    }

    closeAutomationMenu() {
        this.automationMenu.hidden = true;
    }

    createItem(text: string, id: string, callback: any) {
        let el = document.createElement("li");
        el.id = id;
        el.innerText = text;
        el.className = "automation-item";
        el.onclick = callback;
        this.itemList.appendChild(el);
    }

    clearMenu() {
        this.automationMenu.innerHTML = '';
        this.itemList = document.createElement("ul");
        this.itemList.id = "list-automation";
        this.automationMenu.appendChild(this.itemList);
    }

}