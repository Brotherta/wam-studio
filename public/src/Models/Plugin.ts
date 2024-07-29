import { WebAudioModule } from "@webaudiomodules/sdk";


/**
 * Represents a plugin you can instantiate in an audio context.
 */
export default class Plugin{

    constructor(readonly name: string, readonly wam_type: typeof WebAudioModule){}

    public async instantiate(audioCtx: BaseAudioContext, groupId: string, isHeadless: boolean = false){
        return PluginInstance.create(this.name, this, audioCtx, groupId, isHeadless)
    }
}

/**
 * Class that represents a plugin instance linked to
 * The plugin have to be instantiated then to be used.
 */
export class PluginInstance {

    /** ~ FACTORIES ~ **/
    private constructor(
        readonly name: string,
        readonly plugin: Plugin,
        readonly instance: WebAudioModule,
        readonly gui: Element,
        readonly isHeadless: boolean = false
    ) { }
    
    /**
     * Create a new plugin instance.
     * @param name The name of the plugin.
     * @param wam_type The WAM Class of the plugin.
     * @param audioCtx The audio context to create the plugin in.
     * @param groupId The group id to create the plugin in.
     * @param isHeadless Is the plugin headless or not. If it is headless, a default low overhead GUI is created.
     * @returns The plugin instance.
     */
    static async create(
        name: string,
        plugin: Plugin,
        audioCtx: BaseAudioContext, 
        groupId: string,
        isHeadless: boolean = false
    ) {
        // Create the wam instance
        const instance= await plugin.wam_type.createInstance(groupId, audioCtx);

        // Create the gui
        const gui= await (async ()=>{
            if(isHeadless){
                const headlessdiv=document.createElement("div")
                headlessdiv.innerHTML=plugin.wam_type.name+" Headless"
                return headlessdiv
            }
            else return await instance.createGui()
        })()

        // Return the plugin
        return new PluginInstance(name,plugin,instance,gui,isHeadless)
    }

    /**
     * Clone the plugin in a new audio context and group.
     */
    async cloneInto(audioCtx: BaseAudioContext, groupId: string, isHeadless: boolean = false){
        const thisState=await this.getState()
        const newPlugin=await PluginInstance.create(this.name, this.plugin, audioCtx, groupId, isHeadless)
        await newPlugin.setState(thisState)
        return newPlugin
    }
    

    /**
     * Destroy the plugin instance and remove the GUI.
     */
    dispose() {
        this.instance.audioNode.destroy()
        if(this.isHeadless) this.gui.remove()
        else this.instance.destroyGui(this.gui)
    }

    /**
     * Set the state of the plugin.
     * The plugin is considered ready to receive the state.
     * /////~It is asynchronous because it needs to wait for the plugin to be ready.~/////
     *
     * @param state The state of the plugin to set (Json Object)
     */
    async setState(state: any) {
        //if (state.current.length === 0) return;
        return await this.instance._audioNode.setState(state);

        /* WTF? let curState = await this.instance._audioNode.getState();
        let statePlugin = new Promise<void>((resolve) => {
            let test = 0;
            let maxTest = 10;
            const interval = setInterval(async () => {
                if (state.current.length === curState.current.length) {
                    clearInterval(interval);
                    resolve();
                }
                curState = await this.instance._audioNode.getState();
                test++;
                if (test > maxTest) {
                    test = 0;
                    await this.instance._audioNode.setState(state);
                }
            }, 200);
        });*/
        //await statePlugin;
    }

    /**
     * Get the state of the plugin.
     * @returns The state of the plugin (Json Object)
     */
    getState():any|null{
        return this.instance.audioNode.getState()
    }

    /**
     * The audio node of the plugin.
     */
    get audioNode(){ return this.instance.audioNode }
}