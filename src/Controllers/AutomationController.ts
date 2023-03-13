import App from "../App";
import Track from "../Models/Track";
import {audioCtx} from "../index";


/**
 * Controller for the automation menu. This controller is responsible for applying all the automations to the tracks.
 */
export default class AutomationController {

    app: App;
    automationOpened: boolean = false;

    constructor(app: App) {
        this.app = app;
        this.definesEvents();
    }

    /**
     * Apply all the automations to the track and open the automation menu.
     * @param track
     */
    async openAutomationMenu(track: Track) {
        this.app.automationView.clearMenu();
        await this.getAllAutomations(track);
        this.app.automationView.openAutomationMenu(track);
        this.automationOpened = true;
    }

    /**
     * Define all the listeners for the automation menu.
     */
    definesEvents() {
        window.addEventListener("click", (e) => {
            if (e.target === this.app.automationView.automationMenu ) return;
            if (this.automationOpened) {
                this.app.automationView.closeAutomationMenu();
                this.automationOpened = false;
            }
        });
        this.app.pluginsView.removePlugin.addEventListener("click", () => {
            let track = this.app.pluginsController.selectedTrack;
            if (track != undefined) {
                track.automations.removeAutomation();
                track.automations.updateAutomation([]);
                this.app.automationView.clearMenu();
                this.app.automationView.hideBpf(track.id);
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
            track.automations.updateAutomation(params);
            this.app.automationView.clearMenu();

            this.app.automationView.createItem("Hide Automation", "hide-automation", () => {
                this.app.automationView.hideBpf(track.id);
            });
            this.app.automationView.createItem("Clear All Automations", "clear-all", () => {
                this.app.automationView.hideBpf(track.id);
                track.automations.clearAllAutomation(params);
                track.plugin.instance?._audioNode.clearEvents();
            })
            for (let param in params) {
                this.app.automationView.createItem(
                    param,
                    // @ts-ignore
                    params[param].nodeId,
                    () => {
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

    /**
     * Apply all the automations of each track.
     * It takes in account the playhead position and the time of the host.
     */
    applyAllAutomations() {
        let tracks = this.app.tracks.trackList;
        let playhead = this.app.host.playhead;
        let time = (playhead / audioCtx.sampleRate) * 1000;

        for (let track of tracks) {
            track.plugin.instance?._audioNode.clearEvents();
            let automation = track.automations;
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
















