import {WebAudioModule} from "@webaudiomodules/sdk";
import App from "../App";

/**
 * Class that represents a plugin.
 */
export default class Plugin {

    instance: WebAudioModule | undefined;
    dom: Element;
    app: App;
    initialized: boolean
    state: any;

    constructor(app: App) {
        this.app = app;
        this.initialized = false;
    }

    /**
     * Initialize the plugin by loading the WAM script and creating the instance.
     */
    async initPlugin(WAM: any, audioCtx: AudioContext, offlineAudioContext?: OfflineAudioContext, exportGroupId?: string) {
        if (offlineAudioContext && exportGroupId) {
            //@ts-ignore
            this.instance = await WAM.createInstance(exportGroupId, offlineAudioContext);
        }
        else {
            //@ts-ignore
            this.instance = await WAM.createInstance(this.app.host.hostGroupId, audioCtx);
        }
        // @ts-ignore
        this.dom = await this.instance.createGui();
        this.initialized = true;
    }

    /**
     * Unload the plugin by destroying the instance and the GUI.
     */
    unloadPlugin() {
        if (this.initialized) {
            // @ts-ignore
            this.instance.destroyGui(this.dom);
            this.instance = undefined;
            this.initialized = false;
            this.dom.remove();
        }
    }

    /**
     * Set the state of the plugin.
     * It is asynchronous because it needs to wait for the plugin to be ready.
     *
     * @param state The state of the plugin to set (Json Object)
     */
    async setStateAsync(state: any) {
        await this.instance!._audioNode.setState(state);

        let curState = await this.instance!._audioNode.getState();
        let statePlugin = new Promise<void>((resolve) => {
            let test = 0;
            let maxTest = 10;
            const interval = setInterval(async () => {
                if (state.current.length === curState.current.length) {
                    clearInterval(interval);
                    resolve();
                }
                curState = await this.instance!._audioNode.getState();
                test++;
                if (test > maxTest) {
                    test = 0;
                    await this.instance!._audioNode.setState(state);
                }
            }, 200);
        });
        await statePlugin;
    }
}