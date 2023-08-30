import Track from "../Models/Track";
import BPF from "../Components/BPF";

/**
 * Class for the automation view. This class is responsible for displaying the automation menu and the automation bpf.
 */
export default class AutomationView {

    public automationMenu = document.getElementById("automation-menu") as HTMLDivElement;
    public itemList = document.getElementById("list-automation") as HTMLElement;
    public automationContainer = document.getElementById("automation-container") as HTMLDivElement;

    /**
     * Opens the automation menu next to the track.
     * @param track - The track to which the automation menu is associated.
     */
    public openAutomationMenu(track: Track): void {
        let trackElement = track.element;
        let bd = trackElement.getBoundingClientRect();
        this.automationMenu.style.transform = `translate(${bd.left + bd.width - 15}px, ${bd.top+15}px)`;
        this.automationMenu.hidden = false;
    }

    /**
     * Closes the automation menu. The menu is hidden.
     */
    public closeAutomationMenu(): void {
        this.automationMenu.hidden = true;
    }

    /**
     * Creates an item in the automation menu.
     *
     * @param text - The text of the item.
     * @param id - The id of the item.
     * @param callback - The callback function when the item is clicked.
     * @param active - Whether the item is active or not.
     */
    public createItem(text: string, id: string, callback: any, active: boolean = false): void {
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
     * Clears the automation menu.
     */
    public clearMenu(): void {
        this.automationMenu.innerHTML = '';
        this.itemList = document.createElement("ul");
        this.itemList.id = "list-automation";
        this.automationMenu.appendChild(this.itemList);
    }

    /**
     * Adds a bpf placeholder to the automation container.
     *
     * @param trackId - The id of the track to which the bpf is associated.
     */
    public addAutomationBpf(trackId: number): void {
        let automationLocation = document.createElement("div");
        automationLocation.className = "automation-location";
        automationLocation.id = "automation-"+ trackId;
        this.automationContainer.appendChild(automationLocation);
    }

    /**
     * Removes the bpf placeholder from the automation container.
     *
     * @param trackId the id of the track to which the bpf is associated.
     */
    public removeAutomationBpf(trackId: number): void {
        document.getElementById(`automation-${trackId}`)?.remove();
    }

    /**
     * Mounts the bpf to the automation bpf placeholder.
     *
     * @param trackId - The id of the track to which the bpf is associated.
     * @param bpf - The bpf to mount.
     */
    public mountBpf(trackId: number, bpf: BPF): void {
        let location = document.getElementById(`automation-${trackId}`);
        if (location !== null) {
            location.classList.add("event-active");
            location.innerHTML = '';
            location.appendChild(bpf);
        }
    }

    /**
     * Hides the bpf placeholder. The bpf is not removed from the DOM.
     *
     * @param trackId - The id of the track to which the bpf is associated.
     */
    public hideBpf(trackId: number): void {
        let location = document.getElementById(`automation-${trackId}`);
        if (location !== null) {
            location.classList.remove("event-active");
            location.innerHTML = '';
        }
    }

    /**
     * Updates the width of the bpf.
     *
     * @param trackId - The id of the track to which the bpf is associated.
     * @param width - The new width of the bpf.
     */
    public updateBPFWidth(trackId:number, width: number): void {
        let location = document.getElementById(`automation-${trackId}`);
        if (location !== null && location.children.length > 0) {
            const bpf = location.firstChild as BPF;
            bpf.setSizeBPF(width);
        }
    }
}