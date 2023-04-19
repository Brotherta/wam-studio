import {WebAudioModule} from "@webaudiomodules/sdk";
import App from "../App";
import {BANK_PLUGIN_URL} from "../Env";

/**
 * Class that represents a plugin.
 */
export default class Plugin {

    instance: WebAudioModule | undefined;
    dom: Element;
    app: App;
    initialized: boolean

    constructor(app: App) {
        this.app = app;
        this.initialized = false;
    }

    /**
     * Initialize the plugin by loading the WAM script and creating the instance.
     */
    async initPlugin() {
        //@ts-ignore
        const {default: WAM} = await import(/* webpackIgnore: true */BANK_PLUGIN_URL);
        this.instance = await WAM.createInstance(this.app.host.hostGroupId, this.app.host.audioCtx);
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
        }
    }
}