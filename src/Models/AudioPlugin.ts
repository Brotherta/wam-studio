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
        let WAM;
        await fetch("https://wam-bank.vidalmazuy.fr/src/index.js")
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Could not download https://wam-bank.vidalmazuy.fr/src/index.js');
                }
                return response.text();
            })
            .then((remoteScript) => {
                WAM = remoteScript;
            });

        /*this.instance = await WAM.createInstance(this.app.host.hostGroupId, this.app.host.audioCtx);
        this.dom = await this.instance.createGui();*/
    }
}