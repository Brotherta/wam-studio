import App from "../App";
import Track from "../Models/Track";
import {audioCtx} from "../index";
import AutomationView from "../Views/AutomationView";
import {MAX_DURATION_SEC, RATIO_MILLS_BY_PX} from "../Env";


/**
 * Controller for the automation menu. This controller is responsible for applying all the automations to the tracks.
 */
export default class AutomationController {

    /**
     * Route Application.
     */
    private _app: App;
    /**
     * View of the automation menu.
     */
    private _view: AutomationView;
    /**
     * Boolean to know if the automation menu is opened or not.
     */
    private _automationOpened: boolean = false;

    constructor(app: App) {
        this._app = app;
        this._view = this._app.automationView;
        this.bindEvents();
    }

    /**
     * Applies all automations to the track and opens the automation menu.
     * @param track - The track to apply the automations.
     */
    public async openAutomationMenu(track: Track): Promise<void> {
        this._view.clearMenu();
        await this.updateAutomations(track);
        this._view.openAutomationMenu(track);
        this._automationOpened = true;
    }

     /**
     * Update all the parameters of the associated plugin and create the automation menu.
     *
     * @param track - The track to update the automations.
     */
     public async updateAutomations(track: Track): Promise<void> {
        let plugin = track.plugin;
        if (plugin.initialized) {
            let params = await plugin.instance?._audioNode.getParameterInfo();
            console.log(params);
            
            track.automation.updateAutomation(params);
            this._view.clearMenu();

            this._view.createItem("Hide Automation", "hide-automation", () => {
                this._view.hideBpf(track.id);
            });
            this._view.createItem("Clear All Automations", "clear-all", () => {
                this._view.hideBpf(track.id);
                track.automation.clearAllAutomation(params);
                track.plugin.instance?._audioNode.clearEvents();
            })
            for (let param in params) {
                console.log(param);
                
                let active = false;
                let bpf = track.automation.getBpfOfParam(param);
                if (bpf !== undefined && bpf.points.length > 0) {
                    active = true;
                }
                this._view.createItem(
                    param,
                    // @ts-ignore
                    params[param].nodeId,
                    () => {
                        let bpf = track.automation.getBpfOfParam(param);
                        if (bpf !== undefined) {
                            bpf.setSizeBPF(this._app.editorView.worldWidth);
                            this._view.mountBpf(track.id, bpf);
                        }
                        else {
                            console.warn("There is no bpf associated with the track "+track.id);
                        }
                    },
                    active
                );
            }
        }
    }

    /**
     * Defines all the listeners for the automation menu.
     */
    private bindEvents(): void {
        window.addEventListener("click", (e) => {
            if (e.target === this._view.automationMenu ) return;
            if (this._automationOpened) {
                this._view.closeAutomationMenu();
                this._automationOpened = false;
            }
        });
        this._app.pluginsView.removePlugin.addEventListener("click", () => {
            let track = this._app.pluginsController.selectedTrack;
            if (track != undefined) {
                track.automation.removeAutomation();
                track.automation.updateAutomation([]);
                this._view.clearMenu();
                this._view.hideBpf(track.id);
            }
        });
    }

   
    /**
     * Applies all the automations of each track.
     * It takes in account the playhead position and the time of the host.
     */
    public applyAllAutomations(): void {
        let tracks = this._app.tracksController.trackList;
        let playhead = this._app.host.playhead;
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
                let start = AutomationController.getStartingPoint(point[0]*1000, time, list.length);
                let paramID = bpf.paramID;
                let t = 0;
                for (let i = start; i < list.length; i++) {
                    events.push({ type: 'wam-automation', data: { id: paramID, value: list[i] }, time: audioCtx.currentTime + t })
                    t += 0.1;
                }
            }
            events.sort((a, b) => a.time - b.time);
            // @ts-ignore
            track.plugin.instance?._audioNode.scheduleEvents(...events);
        }
    }

    /**
     * Updates the width of the BPF of each track according to ratio of pixels by milliseconds.
     */
    public updateBPFWidth(): void {
        const newWidth = (MAX_DURATION_SEC * 1000) / RATIO_MILLS_BY_PX;

        for (const track of this._app.tracksController.trackList) {
            this._view.updateBPFWidth(track.id, newWidth);
        }
    }

    /**
     * Gets the starting point of the automation according to the current time of the host.
     *
     * @param totalDuration - The duration of the automation in ms.
     * @param currentTime - The current time of the host in ms.
     * @param totalPoint - The total number of points of the automation.
     *
     * @returns The index of the starting point.
     * @static
     */
    public static getStartingPoint(totalDuration: number, currentTime: number, totalPoint: number): number {
        let point = (totalPoint * currentTime) / totalDuration;
        let integPoint = Math.floor(point);
        let frac = point - integPoint;
        if (frac < 0.5) return integPoint;
        else return integPoint+1;
    }

}
















