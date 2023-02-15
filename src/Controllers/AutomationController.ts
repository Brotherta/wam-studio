import App from "../App";
import Track from "../Models/Track";


export default class AutomationController {

    app: App;
    automationOpened: boolean = false;

    constructor(app: App) {
        this.app = app;
    }

    async openAutomationMenu(track: Track) {
        await this.getAllAutomations(track);
        this.app.automationView.openAutomationMenu(track);
        this.automationOpened = true;
        this.definesEvents();
    }

    definesEvents() {
        window.addEventListener("click", (e) => {
            if (e.target === this.app.automationView.automationMenu ) return;
            if (this.automationOpened) {
                this.app.automationView.closeAutomationMenu();
                this.automationOpened = false;
            }
        });
    }

    async getAllAutomations(track: Track) {
        let plugin = track.plugin;
        if (plugin.initialized) {
            let params = await plugin.instance?._audioNode.getParameterInfo();
            track.automations.updateAutomation(params);
            this.app.automationView.clearMenu();
            this.app.automationView.createItem("Hide Automation", "hide-automation", () => {
                console.log("click on hide automation");
            });
            for (let param in params) {
                this.app.automationView.createItem(
                    param,
                    // @ts-ignore
                    params[param].nodeId,
                    () => {
                        console.log("Click on "+param);
                        let bpf = track.automations.getBpfOfparam(param);
                        if (bpf !== undefined) {
                            this.app.automationView.mountBpf(track.id, bpf);
                        }
                        else {
                            console.warn("There is no bpf associated with the track "+track.id);
                        }
                    }
                );
            }

        }
    }
}
















