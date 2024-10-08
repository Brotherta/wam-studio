import { importPedalboard2Library, Pedalboard2Library, resolvePedalboard2Library } from "./Pedalboard2Library.js";
import { getPedalboard2Processor } from "./Pedalboard2Processor.js";
import { Observable, ObservableArray, ReadonlyObservableArray } from "./Utils/observable.js";
import type { WamDescriptor, WamParameterDataMap, WamParameterInfo, WamParameterInfoMap } from "./webaudiomodules/api/index.js";
import { addFunctionModule, initializeWamHost, WamNode, WebAudioModule } from "./webaudiomodules/sdk/index.js";


export type Pedalboard2NodeChild= {wam: WebAudioModule<WamNode>, descriptor: WamDescriptor, id:number}

export type Pedalboard2NodeFetcher= (wamId:string, groupId:string, groupKey:string)=>Promise<Pedalboard2NodeChild>

export type Pedalboard2SharedData = {
    child_order: number[],
    childs: {[id:number]:{instanceId:string, name:string}}
    innerGroupId: string,
    innerGroupKey: string,
}

/**
 * The node of the pedalboard2 module.
 * A composite WAMNode that combine many WamNodes and make them work together as a single WAMNode.
 * Contains all the child nodes.
 * 
 * The child nodes are hold in a specific WAMGroup.
 * 
 * The child nodes are connected in a specific way:
 *   The audio input of a child is connected to the first audio input found in the next child.
 *   So if there is an child node without input, the audio input of the previous child is not
 *   discarded but forward to the first available audio input. It permits to have multiple MIDI
 *   instruments in the same pedalboard, and to treat and audio input and a MIDI input in the same
 *   pedalboard.
 * 
 * The events emitted by the child nodes are not forwarded to the next child node and are just discarded.
 */
export class Pedalboard2Node extends WamNode {
    
    /**
     * @param module The Pedalboard2WAM module
     * @param outputNode An internal Passthrough needed as output.
     */
    constructor(module: WebAudioModule<Pedalboard2Node>){
        super(module,{
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [2] ,
        })
        super.connect(this._outputNode)
    }

    override async _initialize(): Promise<void> {
        await super._initialize()
        const [innerGroupId, innerGroupKey] = await initializeWamHost(this.module.audioContext);
        this.innerGroupId = innerGroupId
        this.innerGroupKey = innerGroupKey
    }

    static async addModules(audioContext: BaseAudioContext, moduleId: string){
        await super.addModules(audioContext, moduleId)
        await addFunctionModule(audioContext.audioWorklet, Function("moduleId",`globalThis.webAudioModules.getModuleScope(moduleId).ParameterUtils=${ParameterUtils.toString()}`) as (any)=>any,moduleId)
        await addFunctionModule(audioContext.audioWorklet, getPedalboard2Processor, moduleId)
    }



    //// -~- INNER GRAPH BUILDING -~- ////
    private _outputNode= this.module.audioContext.createGain()
    
    /**
     * Calculate the connections between the child nodes, the input and the output.
     * Call the given callback for each connection.
     * You have to modify this function to change how the child nodes will be connected.
     * @param onConnect The callback to call for each call to {@link AudioNode.connect}
     * @param onConnectEvent The callback to call for each call to {@link WamNode.connectEvents}
     */
    private calculateConnections(onConnect: (from: AudioNode, to: AudioNode)=>void, onConnectEvent: (from: WamNode, to: WamNode)=>void){
        // Bypass overload of connect, disconnect, etc...
        const overloads= Object.getPrototypeOf(this)
        const originals= Object.getPrototypeOf(overloads)
        Object.setPrototypeOf(this, originals)
        
        let audioToConnect: WamNode[]= [this] // WamNodes waiting for a to node to connect their audio to
        for(let {wam:{audioNode},descriptor,id} of this._childs){
            // An audio input is found, connect all the waiting nodes to it
            if(descriptor.hasAudioInput && audioNode.numberOfInputs>0){
                audioToConnect.forEach(from=>onConnect(from, audioNode))
                audioToConnect.length=0
            }

            // An audio output is found, add it to the waiting nodes
            if(descriptor.hasAudioOutput && audioNode.numberOfOutputs>0){
                audioToConnect.push(audioNode)
            }
        }
        // Remaining nodes are connected to the output
        audioToConnect.forEach(from=>onConnect(from, this._outputNode))

        Object.setPrototypeOf(this, overloads)
    }

    /** Build the graph depending on the structure defined by {@link calculateConnections} */
    private async build(){
        // Reconnect Nodes
        this.calculateConnections(
            (from, to)=>from.connect(to),
            (from, to)=>from.connectEvents(to.instanceId)
        )
        
        // Update the shared data
        const content: Pedalboard2SharedData = {
            child_order:[],
            childs:{},
            innerGroupId: this.innerGroupId,
            innerGroupKey: this.innerGroupKey
        }
        for(let {wam:{audioNode:{instanceId}},descriptor:{name},id} of this._childs){
            content.child_order.push(id)
            content.childs[id]={instanceId, name}
        }

        const id = this._generateMessageId();!
        await this.post("set/shared",content)
    }
    
    /** Destroy the graph isconnect all the child nodes*/
    private unbuild(){
        this.calculateConnections(
            (from, to)=>from.disconnect(to),
            (from, to)=>from.disconnectEvents(to.instanceId)
        )
    }



    //// -~- CHILD NODE MANAGEMENT AND CONNECTIONS -~- ////
    private _childs = new ObservableArray<Pedalboard2NodeChild>()

    private _id_to_child= new Map<number, Pedalboard2NodeChild>()

    readonly childs: ReadonlyObservableArray<Pedalboard2NodeChild> = this._childs
    
    /** Add a new child node at the given position */
    public async addChild(node: Pedalboard2NodeChild, index: number=this._childs.length){
        if(this._childs.includes(node))return
        this.unbuild()
        this._childs.splice(index,0,node)
        this._id_to_child.set(node.id, node)
        await this.build()
    }

    /** Remove a child node from the pedalboard */
    public async removeChild(node: Pedalboard2NodeChild){
        if(!this._childs.includes(node))return
        this.unbuild()
        this._childs.splice(this._childs.indexOf(node),1)
        this._id_to_child.delete(node.id)
        await this.build()
        this.idcounter= Math.max(-1, ...[...this._childs].map(({id})=>id))+1
    }

    public async destroyChild(node: Pedalboard2NodeChild){
        this.removeChild(node)
        node.wam.audioNode.destroy()
    }

    /** The number of child nodes */
    public get childCount(){ return this._childs.length }

    /** Get the child node at the given index */
    public getChild(index: number){ return this._childs[index] }



    //// -~- CHILD NODE CREATION AND FETCHING -~- ////
    //@ts-ignore The id of the inner group
    private innerGroupId: string
    //@ts-ignore The key of the inner group
    private innerGroupKey: string

    /** The Pedalboard2 library */
    public library = new Observable<Pedalboard2Library|null>(null)

    /** The reason why the library is not loaded */
    public libraryError: any|null = null

    /** Create a WAM from his type id */
    public async createChildWAM(wamId: string, forced_id?:number): Promise<Pedalboard2NodeChild|null>{
        if(!this.library) return null
        const wam= this.library.value?.plugins[wamId]
        if(!wam) return null

        const constructor= (await import(wam.classURL))?.default
        if(!constructor?.isWebAudioModuleConstructor)return null
        const instance= await constructor.createInstance(this.innerGroupId, this.context)
        const id= forced_id ?? this.idcounter
        this.idcounter=Math.max(this.idcounter, id+1)
        return {wam: instance as WebAudioModule<WamNode>, descriptor: instance.descriptor, id} 
    }

    private idcounter=0

    /** Get a WAM type ID from from a WAM descriptor */
    public getWAMId(descriptor: WamDescriptor): string{
        return descriptor.identifier ?? (descriptor.vendor+"."+descriptor.name)
    }



    //// -~- COMPOSITE METHODS OVERLOADS -~- ////

    /** Convert a parameter query to a map of child nodes and their respective queries */
    private convertQuery(query: string[]): Map<Pedalboard2NodeChild, string[]>{
        const ret= new Map<Pedalboard2NodeChild, string[]>()

        // Get all parameters
        if(query.length==0){
            for(let child of this._childs) ret.set(child, [])
        }
        // Get according to the query
        else{
            // From a list of external parameter id => Get a list of child + internal parameter id
            const internalQuery= query
                .map(name=>ParameterUtils.internal_id(name))
                .filter(n=>n!=null)
                .map(n=>n as {id:number, parameter:string})
                .map(({id,parameter}) => [this._id_to_child.get(id), parameter] as [Pedalboard2NodeChild, string])
                .filter(([child,parameter]) => child!=undefined)

            for(let [child, paramName] of internalQuery){
                if(!ret.has(child)) ret.set(child, [])
                ret.get(child)!.push(paramName)
            }
        }
        return ret
    }

    // Expose the parameter info of the child nodes with a new exposed name
    async getParameterInfo(...parameterIdQuery: string[]): Promise<WamParameterInfoMap> {
        const query= this.convertQuery(parameterIdQuery)
        const ret: WamParameterInfoMap= {}
        for(let [child, params] of query.entries()){
            const infos= await child.wam.audioNode.getParameterInfo(...params)
            for(let [id,info] of Object.entries(infos)){
                const exposed_id= ParameterUtils.exposed_id(child.id, id)
                const exposed: WamParameterInfo={
                    ...info,
                    label: ParameterUtils.exposed_name(child.id, child.descriptor.name, info.label),
                    id: exposed_id
                }
                ret[exposed_id]=exposed
            }
        }
        return ret
    }

    // Export the parameter values of the child nodes with a new exposed name
    async getParameterValues(normalized?: boolean, ...parameterIdQuery: string[]): Promise<WamParameterDataMap> {
        const query= this.convertQuery(parameterIdQuery)
        const ret: WamParameterDataMap= {}
        for(let [child, params] of query.entries()){
            const infos= await child.wam.audioNode.getParameterValues(normalized, ...params)
            for(let [id,value] of Object.entries(infos)){
                ret[ParameterUtils.exposed_id(child.id,id)]=value
            }
        }
        return ret
    }

    // Set the parameter values of the child nodes with a new exposed name
    async setParameterValues(parameterValues: WamParameterDataMap): Promise<void> {
        for(const [name,value] of Object.entries(parameterValues)){
            const internal= ParameterUtils.internal_id(name)
            if(internal==null)continue

            const {id:childId, parameter}= internal
            const child= this._id_to_child.get(childId)
            if(!child)continue

            await child.wam.audioNode.setParameterValues({[parameter]: value})
        }
    }

    // Get the total state of all nodes
    async getState(): Promise<Pedalboard2NodeState> {
        const ret: Pedalboard2NodeState = {plugins:[], library: this.library?.value?.descriptor?.url}
        for(let {wam,descriptor,id} of this._childs){
            ret.plugins.push({id, wam_id: this.getWAMId(descriptor), state: await wam.audioNode.getState()})
        }
        return ret
    }

    // Set the total state of all nodes
    async setState(state: Pedalboard2NodeState): Promise<void> {
        this.libraryError=null
        try{
            if(state.library){
                const descriptor= await importPedalboard2Library(state.library)
                if(descriptor)this.library.value= await resolvePedalboard2Library(descriptor)
                else this.library.value= null
            }
        }
        catch(e){
            this.libraryError=e
            return
        }
        for(let child of [...this._childs])this.destroyChild(child)
        for(let {id, wam_id, state: nodeState} of state.plugins){
            const new_child=await this.createChildWAM(wam_id,id)
            if(new_child==null)continue
            await new_child.wam.audioNode.setState(nodeState)
            await this.addChild(new_child)
        }
    }

    // Destroy inner nodes
    destroy(): void {
        for(let child of [...this._childs])this.destroyChild(child)
    }



    //// -~- CONNECTION OVERLOAD : connect the output node instead of the Pedalboard2 Node -~- ////
    connect(destinationNode: AudioNode, output?: number, input?: number): AudioNode;
    connect(destinationParam: AudioParam, output?: number): void;
    connect(destinationNode: unknown, output?: unknown, input?: unknown): void | AudioNode {
        //@ts-ignore
        return this._outputNode.connect(destinationNode, output, input)
    }

    disconnect(destinationNode?: unknown, output?: unknown, input?: unknown): void {
        //@ts-ignore
        return this._outputNode.disconnect(destinationNode, output, input)
    }

    connectEvents(toId: string, output?: number): void { }

    disconnectEvents(toId?: string, output?: number): void { }

    private post(request: string, content: any){
        const id=this._generateMessageId()
        return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({ id, request, content });
		});
    }



    //// -~- SETTINGS -~- ////
    /**
     * Do the pedalboard should broadcast the events to all the plugins ?
     * If not, the events are passed to the first plugin, and propagated normally through the graph.
     * TODO: Add this parameter
     */
    /* readonly doBroadcastEvents = new Observable<boolean>(true)*/
}

export type Pedalboard2NodeState= {
    plugins: {id?:number, wam_id:string, state:any}[],
    library?: string,
}

export const ParameterUtils= class{

    /** Get the id of a parameter as exposed outside the pedalboard2 */
    static exposed_id(id: number, parameter: string): string{
        return `${id}<|:pdb2:|>${parameter}`
    }

    /** Get the id of the child pedalboard and the parameter id from the exposed id */
    static internal_id(child: string):{id:number, parameter:string}|null{
        const splitted= child.split("<|:pdb2:|>")
        if(splitted.length!=2)return null
        const id= parseInt(splitted[0])
        if(Number.isNaN(id))return null
        return {id, parameter: splitted[1]}
    }

    /** Get the name of a parameter as exposed outside the pedalboard2 */
    static exposed_name(child_index: number, child_name: string, parameter_name: string): string{
        return `${child_name} n°${child_index+1} -> ${parameter_name}`
    }

}