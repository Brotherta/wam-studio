import { WebAudioModule } from "@webaudiomodules/sdk";
import App, { crashOnDebug } from "../App";
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

    /* -~- CONFIGURATION -~- */
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
        let fetched=this.wam_list_fetcheds[wam_name]
        if(!fetched){
            const link=this.WAM_LIST[wam_name]
            if(!link){
                crashOnDebug(`No such WAM Plugin as '${wam_name}' `)
                return null
            }
            try{
                const {default: WAM} = await import(/* webpackIgnore: true */link) as {default:typeof WebAudioModule};
                fetched={factory:WAM}
                this.wam_list_fetcheds[wam_name]=fetched
            }
            catch(e){
                crashOnDebug(`Error while fetching WAM Plugin "${wam_name}": `,e)
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
        await track.connectPlugin(plugin)
        this.updatePluginList()
    }

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
        this._app.tracksController.select(track)

        // Create a plugin if there is none
        if(!track.plugin){
            this.hideAllButtons()
            this._view.setLoadingPlugin(this.DEFAULT_WAM)
            const plugin= await this.fetchPlugin(this.DEFAULT_WAM)
            if(!plugin)return
            await this.connectPlugin(track,plugin)
        }

        // Show or hide the plugin
        if (this._view.windowOpened) this.hidePlugin()
        else this.showPlugin()
    }

    private showPlugin(){
        this._view.showFloatingWindow(true);
        this._view.setShowPlugin(null);
        this._view.setHidePlugin(this.selected?.plugin?.name ?? "NO PLUGIN")
        this._app.hostController.focus(this._view);
    }

    private hidePlugin(){
        this._view.showFloatingWindow(false)
        this._view.setHidePlugin(null)
        this._view.setShowPlugin(this.selected?.plugin?.name ?? "NO PLUGIN")
    }
        
    /**
     * Binds the events of the plugins view.
     * @private
     */
    private bindEvents(): void {
        // On plugin selected
        this._view.onPluginClick= async (plugin_name)=>{
            const plugin=await this.fetchPlugin(plugin_name)
            if(this.selected!=null && this.selected.plugin==null){
                this.hideAllButtons()
                this._view.setLoadingPlugin(this.DEFAULT_WAM)
                await this.connectPlugin(this.selected,plugin)
                this.updatePluginList()
                this.showPlugin()
            }
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
        this.hideAllButtons()

        if(!this.selected){ 
            // No sound provider is selected => an empty plugin window
            this._view.showFloatingWindow(true)
            this._view.setPluginView(null)
        }
        else{
            if(this.selected.plugin==null){
                // Selected but no plugin => Available plugins list
                this._view.showFloatingWindow(false)
                this._view.setPluginView(null)
                this._view.setNewPlugins(Object.keys(this.WAM_LIST))
            }
            else{
                // Selected and plugin => Remove plugin button + Show plugin button + Set plugin view
                this._view.setRemovePlugin(this.selected.plugin.name)
                if(this._view.windowOpened)this._view.setHidePlugin(this.selected.plugin.name)
                else this._view.setShowPlugin(this.selected.plugin.name)
                this._view.setPluginView(this.selected.plugin.dom)
            }
        }
    }

    /**
     * Hides all the buttons in the plugins view.
     */
    private hideAllButtons(): void {
        this._view.setNewPlugins([]);
        this._view.setShowPlugin(null);
        this._view.setRemovePlugin(null);
        this._view.setHidePlugin(null);
        this._view.setLoadingPlugin(null);
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