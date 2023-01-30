import {WebAudioModule} from "@webaudiomodules/sdk";
import App from "../App";


export default class AudioPlugin {

    instance: WebAudioModule;
    dom: Element;
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async initPlugin() {
        //@ts-ignore
        const {default: WAM} = await import(/* webpackIgnore: true */"https://wam-bank.vidalmazuy.fr/src/index.js");
        this.instance = await WAM.createInstance(this.app.host.hostGroupId, this.app.host.audioCtx);
        this.dom = await this.instance.createGui();
    }
}