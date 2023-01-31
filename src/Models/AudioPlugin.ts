import {WebAudioModule} from "@webaudiomodules/sdk";
import App from "../App";


export default class AudioPlugin {

    instance: WebAudioModule | undefined;
    dom: Element;
    app: App;
    initialized: boolean

    constructor(app: App) {
        this.app = app;
        this.initialized = false;
    }

    async initPlugin() {
        //@ts-ignore
        const {default: WAM} = await import(/* webpackIgnore: true */"https://wam-bank.vidalmazuy.fr/src/index.js");
        this.instance = await WAM.createInstance(this.app.host.hostGroupId, this.app.host.audioCtx);
        // @ts-ignore
        this.dom = await this.instance.createGui();
        this.initialized = true;
    }

    unloadPlugin() {
        if (this.initialized) {
            // @ts-ignore
            this.instance.destroyGui(this.dom);
            this.instance = undefined;
            this.initialized = false;
        }
    }
}