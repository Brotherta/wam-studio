import { WebAudioModule } from "@webaudiomodules/sdk";
import App from "../App";
import { BACKEND_URL } from "../Env";
import Plugin from "../Models/Plugin";
import SoundProvider from "../Models/Track/SoundProvider";
import PluginsView from "../Views/PluginsView";

/**
 * Controller for the plugins view. This controller is responsible for selecting and removing plugins.
 * It also defines the listeners for the plugins view.
 * 
 * What is called a "root plugin" in this classes is a plugin directly loaded by
 * wam studio. Only one can be associated to a track. The default root plugin
 * is the Pedalboard.
 * 
 * ## Quick Doc
 * - For adding a new root plugin, add it to {@link WAM_LIST}
 * - For connecting a plugin to a tracj use {@link connectPlugin}
 */
export default class PluginsController {

    /**
     * A list of the roots plugins.
     * Only one root plugin can be associated to a Track.
     * A root plugin can himself manage multiple WAM.
     **/
    readonly WAM_LIST: {[name: string]:string}={
        "Pedalboard": BACKEND_URL+"/src/index.js",
        "Disto Machine": BACKEND_URL+"/plugins/disto_machine/src/index.js"
    }

    /** The default WAM to load */
    readonly DEFAULT_WAM="Pedalboard"


    /**
     * App instance.
     */
    private _app: App;
    
    /**
     * Plugins view.
     */
    private _view: PluginsView;

    constructor(app: App) {
        this._app = app;
        this._view = this._app.pluginsView;

        this.bindEvents();
        this.hideAllButtons();

        this._view.maximized = true;
        this.updateRackSize();
    }



    public get selected(){ return this._app.tracksController.selected }

    /* -~- ROOT PLUGIN LOADING, CREATION, AND ASSOCIATION -~- */
    private wam_list_fetcheds: {[name:string]:{factory:typeof WebAudioModule}}={}

    /**
     * Get a wam registred in the wam list if it exists else return null.
     * @param wam_name The name of the wam to fetch in {@link WAM_LIST} 
     */
    private async fetchWAM(wam_name: string): Promise<typeof WebAudioModule|null>{
        console.log("Fetch WAM ",wam_name)
        let fetched=this.wam_list_fetcheds[wam_name]
        console.log("   Cache ",fetched)
        if(!fetched){
            console.log("   Nothing in Cache ")
            const link=this.WAM_LIST[wam_name]
            console.log("   From link ", link)
            if(!link)return null
            try{
                const {default: WAM} = await import(/* webpackIgnore: true */link) as {default:typeof WebAudioModule};
                console.log("   Fetched ", WAM)
                fetched={factory:WAM}
                this.wam_list_fetcheds[wam_name]=fetched
            }
            catch(e){
                console.error("Error while fetching WAM ",e)
                return null
            }
        }
        return fetched.factory
    }

    /**
     * Get a plugin from a registred root wam.
     * @param wam_name The name of the wam to fetch in {@link WAM_LIST} 
     */
    public async fetchPlugin(wam_name: string): Promise<Plugin|null>{
        const wam=await this.fetchWAM(wam_name)
        if(wam) return new Plugin(this._app, wam_name, wam)
        else return null
    }

    /**
     * Connect a plugin to a track.
     * @param track The track
     * @param plugin The plugin to connect
     */
    public async connectPlugin(track: SoundProvider, plugin: Plugin|null){
        console.log(">>Connect plugin to track ",track,plugin)
        await track.connectPlugin(plugin)
        console.log(">>Plugin connected to track ",track,plugin)
        this.updatePluginList()
    }

    /**
     * Selects a track and show the plugins of the track.
     *
     * @param track The track to select
     */
    /*public selectTrack(track: Track|undefined): void {
        if(this.selected !== undefined){
            this.selectedTrack.element.unSelect();
            this.selectedTrack = undefined;
        }
        if(track !==undefined){
            this.selectedTrack = track;
            this.selectedTrack.element.select();
        }
        this.selectPlugins();
        // TODO Check what is the purpose of this._view.unselectHost();
    }*/

    // TODO See if this can be removed, how it can be modified. And make it work again
    /**
     * Selects the main track and show the plugins of the main track.
     */
    /* // Repear host selection : public selectHost(): void {
        let host = this._app.host;
        if (this.selectedTrack === undefined) {
            this._view.selectHost();
            this.selectPlugins();
        }
        else if (this.selectedTrack.id !== host.id) {
            this.selectedTrack.element.unSelect();
            this._view.selectHost();
            this.selectPlugins();
        }
    }*/

    /**
     * Handler for the FX button. It shows the plugins of the track or hides them if they are already shown.
     *
     * @param track - The track that was clicked.
     */
    public async fxButtonClicked(track: SoundProvider) {
        // Create a plugin if there is none
        if(!track.plugin){
            const plugin= await this.fetchPlugin(this.DEFAULT_WAM)
            if(!plugin)return
            await this.connectPlugin(track,plugin)
        }

        // Show or hide the plugin
        if (this._view.windowOpened) this.hidePlugin()
        else this.showPlugin()
    }

    private showPlugin(){
        this._view.showFloatingWindow();
        this._view.hideShowButton();
        this._view.showHidePlugin(this.selected?.plugin?.name ?? "NO PLUGIN")
        this._app.hostController.focus(this._view);
    }

    private hidePlugin(){
        this._view.hideFloatingWindow()
        this._view.hideHideButton()
        this._view.showShowPlugin(this.selected?.plugin?.name ?? "NO PLUGIN")
    }
        
    /**
     * Binds the events of the plugins view.
     * @private
     */
    private bindEvents(): void {
        // On plugin selected
        this._view.onPluginClick= async (plugin_name)=>{
            const plugin=await this.fetchPlugin(plugin_name)
            console.log("Should we connect?", this.selected, this.selected?.plugin)
            if(this.selected!=null && this.selected.plugin==null){
                console.log(">Connect plugin ",plugin_name)
                await this.connectPlugin(this.selected,plugin)
                console.log(">Is connected")
                this.updatePluginList()
            }
            console.log(`Plugin name: "${plugin_name}" "${this.WAM_LIST[plugin_name]}"`)
            console.log("  Plugin: ",plugin)
            console.log("  Selected: ",this.selected)
            console.log("  Selected plugin: ",this.selected?.plugin)
        }

        // On plugin removed
        this._view.removePlugin.addEventListener("click", () => {
            if (this.selected !== null) {
                this.connectPlugin(this.selected,null)
                this.updatePluginList()
            }
        });

        // On plugin shown
        this._view.showPlugin.addEventListener("click", ()=> this.showPlugin() );

        // On plugin hidden
        this._view.hidePlugin.addEventListener("click", ()=> this.hidePlugin() );

        this._view.closeWindowButton.addEventListener("click", ()=> this.hidePlugin() )

        // Update size
        this._view.maxMinBtn.addEventListener("click", () => {
            this.updateRackSize();
        });

        // Host selection
        this._view.mainTrack.addEventListener("click", () => {
            // TODO Host selection
            this._app.tracksController.select(this._app.host)
        });

        // Selection
        this._app.tracksController.afterSelectedChange.add((before,after)=>this.updatePluginList())
    }

    /**
     * Update the dom of the plugin list.
     */
    private updatePluginList(){
        console.log("Update plugin list")
        this.hideAllButtons()
        this._view.hideFloatingWindow()
        this._view.setPluginView(null)
        if(!this.selected){ 
            console.log("No selected track")
            // No sound provider is selected => an empty plugin window
        }
        else{
            if(this.selected.plugin==null){
                console.log("No plugin selected")
                // Selected but no plugin => Available plugins list
                this._view.showNew(Object.keys(this.WAM_LIST))
            }
            else{
                console.log("Plugin selected")
                // Selected and plugin => Remove plugin button + Show plugin button + Set plugin view
                this._view.showRemovePlugin(this.selected.plugin.name)
                this._view.showShowPlugin(this.selected.plugin.name)
                this._view.setPluginView(this.selected.plugin.dom)
            }
        }
    }

    /**
     * Hides all the buttons in the plugins view.
     */
    private hideAllButtons(): void {
        this._view.hideNewButton();
        this._view.hideFloatingWindow();
        this._view.hideShowButton();
        this._view.hideRemoveButton();
        this._view.hideHideButton();
    }

    /**
     * Shows or hides the plugins rack.
     * @private
     */
    private updateRackSize(): void {
        const maximized = !this._view.maximized;
        this._view.maximized = maximized;
        if (maximized) {
            this._view.maximize();
            this._app.editorView.resizeCanvas();
        } else {
            this._view.minimize();
            this._app.editorView.resizeCanvas();
        }
    }
    
}