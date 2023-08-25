import Track from "../Models/Track";
import BPF from "../Components/BPF";


/**
 * Class for the automation view. This class is responsible for displaying the automation menu and the automation bpf.
 */
export default class AutomationView {

    automationMenu = document.getElementById("automation-menu") as HTMLDivElement;
    itemList = document.getElementById("list-automation") as HTMLElement;
    automationContainer = document.getElementById("automation-container") as HTMLDivElement;

    /**
     * Open the automation menu next to the track.
     * @param track the track to which the automation menu is associated.
     */
    openAutomationMenu(track: Track) {
        let trackElement = track.element;
        let bd = trackElement.getBoundingClientRect();
        this.automationMenu.style.transform = `translate(${bd.left + bd.width - 15}px, ${bd.top+15}px)`;
        this.automationMenu.hidden = false;
    }

    /**
     * Close the automation menu.
     */
    closeAutomationMenu() {
        this.automationMenu.hidden = true;
    }

    /**
     * Create an item in the automation menu.
     *
     * @param text the text of the item.
     * @param id the id of the item.
     * @param callback the callback for the onclick event.
     */
    createItem(text: string, id: string, callback: any, active: boolean = false) {
        let el = document.createElement("li");
        el.id = id;
        el.className = "automation-item";
        if (active) el.classList.add("active");

        // Create a green dot element
        let dot = document.createElement("span");
        dot.className = "dot";
        if (active) dot.classList.add("active-dot");

        // Append the green dot to the item
        el.appendChild(dot);

        // Create a span element for the text
        let itemText = document.createElement("span");
        itemText.innerText = text;

        // Append the text to the item
        el.appendChild(itemText);

        el.onclick = callback;
        this.itemList.appendChild(el);
    }

    /**
     * Clear the automation menu.
     */
    clearMenu() {
        this.automationMenu.innerHTML = '';
        this.itemList = document.createElement("ul");
        this.itemList.id = "list-automation";
        this.automationMenu.appendChild(this.itemList);
    }

    /**
     * Add a bpf placeholder to the automation container.
     *
     * @param trackId the id of the track to which the bpf is associated.
     */
    addAutomationBpf(trackId: number) {
        let automationLocation = document.createElement("div");
        automationLocation.className = "automation-location";
        automationLocation.id = "automation-"+ trackId;
        this.automationContainer.appendChild(automationLocation);
    }

    /**
     * Remove the bpf placeholder from the automation container.
     * @param trackId the id of the track to which the bpf is associated.
     */
    removeAutomationBpf(trackId: number) {
        document.getElementById(`automation-${trackId}`)?.remove();
    }

    /**
     * Mount the bpf to the automation bpf placeholder.
     *
     * @param trackId the id of the track to which the bpf is associated.
     * @param bpf the bpf to mount.
     */
    mountBpf(trackId: number, bpf: any) {
        let location = document.getElementById(`automation-${trackId}`);
        if (location !== null) {
            location.classList.add("event-active");
            location.innerHTML = '';
            location.appendChild(bpf);
        }
    }

    /**
     * Hide the bpf placeholder.
     *
     * @param trackId the id of the track to which the bpf is associated.
     */
    hideBpf(trackId: number) {
        let location = document.getElementById(`automation-${trackId}`);
        if (location !== null) {
            location.classList.remove("event-active");
            location.innerHTML = '';
        }
    }

    updateWidthBPF(trackId:number, width: number) {
        let location = document.getElementById(`automation-${trackId}`);
        if (location !== null && location.children) {
            const bpf = location.firstChild as BPF;
            bpf.setSizeBPF(width);
        }
    }
}