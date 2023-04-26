import App from "../App";
import Track from "../Models/Track";
import {audioCtx} from "../index";
import AutomationView from "../Views/AutomationView";


/**
 * Controller for the automation menu. This controller is responsible for applying all the automations to the tracks.
 */
export default class AutomationController {

    app: App;
    automationView: AutomationView;

    automationOpened: boolean = false;

    constructor(app: App) {
        this.app = app;
        this.automationView = this.app.automationView;
        this.definesEvents();
    }

    /**
     * Apply all the automations to the track and open the automation menu.
     * @param track
     */
    async openAutomationMenu(track: Track) {
        this.automationView.clearMenu();
        await this.getAllAutomations(track);
        this.automationView.openAutomationMenu(track);
        this.automationOpened = true;
    }

    /**
     * Define all the listeners for the automation menu.
     */
    definesEvents() {
        window.addEventListener("click", (e) => {
            if (e.target === this.automationView.automationMenu ) return;
            if (this.automationOpened) {
                this.automationView.closeAutomationMenu();
                this.automationOpened = false;
            }
        });
        this.app.pluginsView.removePlugin.addEventListener("click", () => {
            let track = this.app.pluginsController.selectedTrack;
            if (track != undefined) {
                track.automation.removeAutomation();
                track.automation.updateAutomation([]);
                this.automationView.clearMenu();
                this.automationView.hideBpf(track.id);
            }
        });
    }

    /**
     * Get all the parameters of the associated plugin and create the automation menu.
     *
     * @param track
     */
    async getAllAutomations(track: Track) {
        let plugin = track.plugin;
        if (plugin.initialized) {
            let params = await plugin.instance?._audioNode.getParameterInfo();
            track.automation.updateAutomation(params);
            this.automationView.clearMenu();

            this.automationView.createItem("Hide Automation", "hide-automation", () => {
                this.automationView.hideBpf(track.id);
            });
            this.automationView.createItem("Clear All Automations", "clear-all", () => {
                this.automationView.hideBpf(track.id);
                track.automation.clearAllAutomation(params);
                track.plugin.instance?._audioNode.clearEvents();
            })
            for (let param in params) {
                this.automationView.createItem(
                    param,
                    // @ts-ignore
                    params[param].nodeId,
                    () => {
                        let bpf = track.automation.getBpfOfparam(param);
                        if (bpf !== undefined) {
                            this.automationView.mountBpf(track.id, bpf);
                        }
                        else {
                            console.warn("There is no bpf associated with the track "+track.id);
                        }
                    }
                );
            }
        }
    }

    /**
     * Apply all the automations of each track.
     * It takes in account the playhead position and the time of the host.
     */
    applyAllAutomations() {
        let tracks = this.app.tracksController.trackList;
        let playhead = this.app.host.playhead;
        let time = (playhead / audioCtx.sampleRate) * 1000;

        for (let track of tracks) {
            track.plugin.instance?._audioNode.clearEvents();
            let automation = track.automation;
            let events = [];
            for (let bpf of automation.bpfList) {
                let point = bpf.lastPoint;
                if (point == null) {
                    continue;
                }
                let list = [];
                for (let x = 0; x < point[0]; x += 0.1) {
                    list.push(bpf.getYfromX(x));
                }
                let start = this.getStartingPoint(point[0]*1000, time, list.length);
                let paramID = bpf.paramID;
                let t = 0;
                for (let i = start; i < list.length; i++) {
                    events.push({ type: 'wam-automation', data: { id: paramID, value: list[i] }, time: this.app.host.audioCtx.currentTime + t })
                    t += 0.1;
                }
            }
            events.sort((a, b) => a.time - b.time);
            // @ts-ignore
            track.plugin.instance?._audioNode.scheduleEvents(...events);
        }
    }

    /**
     * Get the starting point of the automation according to the current time of the host.
     *
     * @param totalDuration The duration of the automation in ms.
     * @param currentTime The current time of the host in ms.
     * @param totalPoint The total number of points of the automation.
     *
     * @returns The index of the starting point.
     */
    getStartingPoint(totalDuration: number, currentTime: number, totalPoint: number) {
        let point = (totalPoint * currentTime) / totalDuration;
        let integPoint = Math.floor(point);
        let frac = point - integPoint;
        if (frac < 0.5) return integPoint;
        else return integPoint+1;
    }
}
















