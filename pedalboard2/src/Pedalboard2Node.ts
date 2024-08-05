import { importPedalboard2Library, Pedalboard2Library, resolvePedalboard2Library } from "./Pedalboard2Library.js";
import { getPedalboard2Processor } from "./Pedalboard2Processor.js";
import { Observable, ObservableArray, ReadonlyObservableArray } from "./Utils/observable.js";
import { WamDescriptor, WamParameterDataMap, WamParameterInfoMap } from "./webaudiomodules/api/index.js";
import { addFunctionModule, initializeWamHost, WamNode, WebAudioModule } from "./webaudiomodules/sdk/index.js";



export type Pedalboard2NodeChild= [WebAudioModule<WamNode>, WamDescriptor]

export type Pedalboard2NodeFetcher= (wamId:string, groupId:string, groupKey:string)=>Promise<Pedalboard2NodeChild>

export type Pedalboard2SharedData = {
    childs: {instanceId:string, name:string}[],
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
        console.log("Pedalboard2Node constructor")
        this.connect(this._outputNode)
    }

    override async _initialize(): Promise<void> {
        await super._initialize()
        console.log("Pedalboard2Node initialize")
        const [innerGroupId, innerGroupKey] = await initializeWamHost(this.module.audioContext);
        this.innerGroupId = innerGroupId
        this.innerGroupKey = innerGroupKey
    }

    static async addModules(audioContext: BaseAudioContext, moduleId: string){
        await super.addModules(audioContext, moduleId)
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
        let audioToConnect: WamNode[]= [this] // WamNodes waiting for a to node to connect their audio to
        for(let [{audioNode},descriptor] of this._childs){
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
            childs:[],
            innerGroupId: this.innerGroupId,
            innerGroupKey: this.innerGroupKey
        }
        for(let [node,desc] of this._childs) content.childs.push({instanceId: node.instanceId, name: desc.name})

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

    readonly childs: ReadonlyObservableArray<Pedalboard2NodeChild> = this._childs
    
    /** Add a new child node at the given position */
    public async addChild(node: Pedalboard2NodeChild, index: number=this._childs.length){
        if(this._childs.includes(node))return
        this.unbuild()
        this._childs.splice(index,0,node)
        await this.build()
    }

    /** Remove a child node from the pedalboard */
    public async removeChild(node: Pedalboard2NodeChild){
        if(!this._childs.includes(node))return
        this.unbuild()
        this._childs.splice(this._childs.indexOf(node),1)
        await this.build()
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
    public async createChildWAM(wamId: string): Promise<Pedalboard2NodeChild|null>{
        if(!this.library) return null
        const wam= this.library.value?.plugins[wamId]
        if(!wam) return null
        const constructor= (await import(wam.classURL))?.default
        if(!constructor?.isWebAudioModuleConstructor)return null
        console.log(this.innerGroupId, this.innerGroupKey)
        const instance= await constructor.createInstance(this.innerGroupId, this.context)
        return [instance as WebAudioModule<WamNode>, instance.descriptor] 
    }

    /** Get a WAM type ID from from a WAM descriptor */
    public getWAMId(descriptor: WamDescriptor): string{
        return descriptor.identifier ?? (descriptor.vendor+"."+descriptor.name)
    }



    //// -~- COMPOSITE METHODS OVERLOADS -~- ////
    /** Get the exposed name of a parameter */
    private getExposedName(child: Pedalboard2NodeChild, index: number, name: string){
        return child[1].name+" "+(index+1)+" -> "+name
    }

    /** Get a real parameter name and its associated child node from an exposed parameter name */
    private getInternalName(name: string): [Pedalboard2NodeChild, string]|null{
        const splitted= name.split(" -> ")
        if(splitted.length!=2)return null
        const paramName= splitted[1]

        const splitted2= splitted[0].split(/ (?=[0-9]*^)/)
        if(splitted2.length <= 1)return null
        const index= parseInt(splitted2[splitted2.length-1])-1
        if(isNaN(index))return null

        return [this._childs[index], paramName]
    }

    // Overload the parameters getter to expose the parameters of the child nodes with a new public name
    get parameters(): AudioParamMap {
        const ret: AudioParamMap&Map<string, AudioParam>= new Map()
        for(let [index,child] of this._childs.entries()){
            for(let [name,param] of child[0].audioNode.parameters){
                ret.set(this.getExposedName(child,index,name), param)
            }
        }
        return ret
    }

    /** Convert a parameter query to a map of child nodes and their respective queries */
    private convertQuery(query: string[]): Map<Pedalboard2NodeChild, string[]>{
        const ret= new Map<Pedalboard2NodeChild, string[]>()

        // Get all parameters
        if(query.length==0){
            for(let child of this._childs) ret.set(child, [])
        }
        // Get according to the query
        else{
            // Get a list of nodes and queries
            const internalQuery= query.map(name=>this.getInternalName(name)).filter(n=>n!=null) as [Pedalboard2NodeChild, string][]
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
            const infos= await child[0].audioNode.getParameterInfo(...params)
            for(let [name,info] of Object.entries(infos)){
                ret[this.getExposedName(child, this._childs.indexOf(child), name)]=info
            }
        }
        return ret
    }

    // Export the parameter values of the child nodes with a new exposed name
    async getParameterValues(normalized?: boolean, ...parameterIdQuery: string[]): Promise<WamParameterDataMap> {
        const query= this.convertQuery(parameterIdQuery)
        const ret: WamParameterDataMap= {}
        for(let [child, params] of query.entries()){
            const infos= await child[0].audioNode.getParameterValues(normalized, ...params)
            for(let [name,value] of Object.entries(infos)){
                ret[this.getExposedName(child, this._childs.indexOf(child), name)]=value
            }
        }
        return ret
    }

    // Set the parameter values of the child nodes with a new exposed name
    async setParameterValues(parameterValues: WamParameterDataMap): Promise<void> {
        for(const [name,value] of Object.entries(parameterValues)){
            const internal= this.getInternalName(name)
            if(internal!=null){
                const [child, paramName]= internal
                await child[0].audioNode.setParameterValues({[paramName]: value})
            }
        }
    }

    // Get the total state of all nodes
    async getState(): Promise<Pedalboard2NodeState> {
        const ret: Pedalboard2NodeState = {plugins:[], library: this.library?.value?.descriptor?.url}
        for(let [wam,descriptor] of this._childs){
            ret.plugins.push({id: this.getWAMId(descriptor), state: await wam.audioNode.getState()})
        }
        return ret
    }

    // Set the total state of all nodes
    async setState(state: Pedalboard2NodeState): Promise<void> {
        this.unbuild()
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
        this._childs.splice(0,this._childs.length)
        for(let {id, state: nodeState} of state.plugins){
            const new_child=await this.createChildWAM(id)
            if(new_child==null)continue
            await new_child[0].audioNode.setState(nodeState)
            this._childs.push(new_child)
        }
        await this.build()
    }

    // Destroy inner nodes
    destroy(): void {
        this.unbuild()
        // TODO Destroy host
        this._childs.forEach(([{audioNode}])=>audioNode.destroy())
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
}

export type Pedalboard2NodeState= {
    plugins: {id:string, state:any}[],
    library?: string,
}