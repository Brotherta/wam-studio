import { WamNode } from "@webaudiomodules/api"
import { crashOnDebug } from "../../../App"
import { observed } from "../../../Utils/observable/class_annotation"
import { RegionRecorder } from "./RegionRecorder"

export type RecorderFactory<CONTEXT,T extends RegionRecorder<any>> = (context: CONTEXT) => Promise<T>

/**
 * A manager of region recorders.
 * It manage the creation and destruction of recorders, their output, the connections of
 * the recorders output to the monitored output, and their armed state.
 */
export default class RegionRecorderManager<CONTEXT>{

    constructor(private context: CONTEXT){}
    
    private _recorders: Map<RecorderFactory<CONTEXT,any>, RegionRecorder<any>> = new Map()


    /* -~- Creation and manipulation of recorders -~- */
    /**
     * Get a recorder of a track, creating it if it does not exist.
     * @param recorder 
     * @returns 
     */
    async get<T extends RegionRecorder<any>>(recorder: RecorderFactory<CONTEXT,T>): Promise<T> {
        let ret= this._recorders.get(recorder) as T
        if(!ret){
            ret= await recorder(this.context)
            this._recorders.set(recorder,ret)
        }
        return ret
    }


    /* -~- Monitoring -~- */

    private connecteds: Set<WamNode> = new Set()

    /**
     * Connect the record manager monitoring output to a node.
     * @param node 
     */
    connect(node: WamNode){
        if(this.isMonitoring)for(let recorder of this._recording_recorders)recorder.connect(node)
        this.connecteds.add(node)
    }

    /**
     * Connect the record manager monitoring output to a node.
     * @param node 
     */
    disconnect(node: WamNode){
        if(this.isMonitoring)for(let recorder of this._recording_recorders)recorder.disconnect(node)
        this.connecteds.delete(node)
    }

    @observed({
        set(this: RegionRecorderManager<CONTEXT>, value: boolean, oldValue:boolean){
            if(value!=oldValue){
                if(value) this._recording_recorders.forEach(recorder => {
                    this.connecteds.forEach(node => recorder.connect(node))
                })
                else this._recording_recorders.forEach(recorder => {
                    this.connecteds.forEach(node => recorder.disconnect(node))
                })
            }
        }
    })
    public isMonitoring: boolean
    

    /* -~- Recording Recorders -~- */
    private _recording_recorders_keys: Set<RecorderFactory<CONTEXT,any>> = new Set()

    private _recording_recorders: Set<RegionRecorder<any>> = new Set()

    /** The recorders that are currently armeds. */
    readonly armeds: Omit<Set<RecorderFactory<CONTEXT,any>>,"add"|"delete"|"clear"> = this._recording_recorders_keys

    /**
     * Arm a recorder.
     * @param key The factory of the recorder to arm.
     * @returns If the recorder was armed. False if it was already armed.
     */
    public async arm(key: RecorderFactory<CONTEXT,any>): Promise<boolean>{
        if(this.isArmed(key))return false
        this._recording_recorders_keys.add(key)
        const recorder= await this.get(key)
        this._recording_recorders.add(recorder)
        if(this.isMonitoring)for(let node of this.connecteds)recorder.connect(node)
        return true
    }

    /**
     * Disarm a recorder.
     * @param key The factory of the recorder to disarm.
     * @returns If the recorder was disarmed. False if it was not armed.
     */
    public disarm(key: RecorderFactory<CONTEXT,any>): boolean{
        if(!this.isArmed(key))return false
        this._recording_recorders_keys.delete(key)
        const recorder= this._recorders.get(key)
        if(!recorder){
            crashOnDebug("The recorder should not be undefined, for each key armed, there is an associated recorder.")
            return true
        }
        this._recording_recorders.delete(recorder)
        if(this.isMonitoring)for(let node of this.connecteds)recorder.disconnect(node)
        return true
    }

    /**
     * Check if a recorder is armed.
     * @param key The factory of the recorder to check.
     * @returns Is the recorder armed.
     */
    public isArmed(key: RecorderFactory<CONTEXT,any>){
        return this._recording_recorders_keys.has(key)
    }


    /* -~- Lifetime -~- */
    /**
     * Destroy the record manager and all its recorders.
     * Disconnect all the connected nodes.
     */
    dispose(){
        if(this.isMonitoring)for(let recorder of this._recording_recorders)for(let node of this.connecteds)recorder.disconnect(node)
        for(let recorder of this._recorders.values())recorder.dispose()
        this._recorders.clear()
        this._recording_recorders.clear()
        this._recording_recorders_keys.clear()
        this.connecteds.clear()
    }
}