import { WebAudioModule } from "@webaudiomodules/sdk";
import App from "../App";

/**
 * Class that represents a plugin.
 * The plugin have to be instantiated then to be used.
 */
export default class Plugin {

    instance: WebAudioModule|null = null
    dom: Element


    /** ~ FACTORIES ~ **/
    constructor(private app: App, readonly name: string, private wam_type: typeof WebAudioModule) {}

    clone(){
        return new Plugin(this.app,this.name,this.wam_type)
    }
    

    /**
     * Initialize the plugin by loading the WAM script and creating the instance.
     */
    async instantiate(audioCtx: BaseAudioContext, groupid: string) {
        this.destroy()
        console.log(">>>> Create instance",groupid,audioCtx,this.wam_type)
        this.instance = await this.wam_type.createInstance(groupid, audioCtx);
        console.log(">>>> Create GUI")
        this.dom = await this.instance.createGui();
        console.log(">>>> End")
    }

    /**
     * Destroy the plugin instance and remove the GUI.
     */
    destroy() {
        if (this.instance !== null) {
            this.instance.audioNode.disconnect()
            this.instance.audioNode.destroy()
            this.instance.audioNode.disconnectEvents()
            this.instance.destroyGui(this.dom)
            this.instance = null
        }
    }

    /**
     * Set the state of the plugin.
     * It is asynchronous because it needs to wait for the plugin to be ready.
     *
     * @param state The state of the plugin to set (Json Object)
     */
    async setState(state: any) {
        if (state.current.length === 0) return;
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

    /**
     * Get the state of the plugin.
     * @returns The state of the plugin (Json Object)
     */
    getState():any|null{
        return this.instance?._audioNode?.getState()
    }
}