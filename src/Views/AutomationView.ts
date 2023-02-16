import Track from "../Models/Track";


export default class AutomationView {

    automationMenu = document.getElementById("automation-menu") as HTMLDivElement;
    itemList = document.getElementById("list-automation") as HTMLElement;
    automationContainer = document.getElementById("automation-container") as HTMLDivElement;

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

    addAutomationBpf(trackId: number) {
        let automationLocation = document.createElement("div");
        automationLocation.className = "automation-location";
        automationLocation.id = "automation-"+ trackId;
        this.automationContainer.appendChild(automationLocation);
    }

    removeAutomationBpf(trackId: number) {
        document.getElementById(`automation-${trackId}`)?.remove();
    }

    mountBpf(trackId: number, bpf: any) {
        let location = document.getElementById(`automation-${trackId}`);
        if (location !== null) {
            location.classList.add("event-active");
            location.innerHTML = '';
            location.appendChild(bpf);
        }
    }

    hideBpf(trackId: number) {
        let location = document.getElementById(`automation-${trackId}`);
        if (location !== null) {
            location.classList.remove("event-active");
            location.innerHTML = '';
        }
    }
}