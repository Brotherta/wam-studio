import {WebAudioModule} from "@webaudiomodules/sdk";


export default class AudioPlugin {

    instance: WebAudioModule;
    dom: Element;

    async initPlugin() {
        //@ts-ignore
        let {default: WAM} = await import("https://wam-bank.vidalmazuy.fr");

        WAM.createInstance()
    }

}