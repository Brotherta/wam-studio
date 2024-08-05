import { importPedalboard2Library, resolvePedalboard2Library } from "./Pedalboard2Library.js";
import { getPedalboard2Processor } from "./Pedalboard2Processor.js";
import { Observable, ObservableArray } from "./Utils/observable.js";
import { addFunctionModule, initializeWamHost, WamNode } from "./webaudiomodules/sdk/index.js";
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
    constructor(module) {
        super(module, {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [2],
        });
        console.log("Pedalboard2Node constructor");
        super.connect(this._outputNode);
    }
    async _initialize() {
        await super._initialize();
        console.log("Pedalboard2Node initialize");
        const [innerGroupId, innerGroupKey] = await initializeWamHost(this.module.audioContext);
        this.innerGroupId = innerGroupId;
        this.innerGroupKey = innerGroupKey;
    }
    static async addModules(audioContext, moduleId) {
        await super.addModules(audioContext, moduleId);
        await addFunctionModule(audioContext.audioWorklet, getPedalboard2Processor, moduleId);
    }
    //// -~- INNER GRAPH BUILDING -~- ////
    _outputNode = this.module.audioContext.createGain();
    /**
     * Calculate the connections between the child nodes, the input and the output.
     * Call the given callback for each connection.
     * You have to modify this function to change how the child nodes will be connected.
     * @param onConnect The callback to call for each call to {@link AudioNode.connect}
     * @param onConnectEvent The callback to call for each call to {@link WamNode.connectEvents}
     */
    calculateConnections(onConnect, onConnectEvent) {
        // Bypass overload of connect, disconnect, etc...
        const overloads = Object.getPrototypeOf(this);
        const originals = Object.getPrototypeOf(overloads);
        Object.setPrototypeOf(this, originals);
        let audioToConnect = [this]; // WamNodes waiting for a to node to connect their audio to
        for (let [{ audioNode }, descriptor] of this._childs) {
            // An audio input is found, connect all the waiting nodes to it
            if (descriptor.hasAudioInput && audioNode.numberOfInputs > 0) {
                audioToConnect.forEach(from => onConnect(from, audioNode));
                audioToConnect.length = 0;
            }
            // An audio output is found, add it to the waiting nodes
            if (descriptor.hasAudioOutput && audioNode.numberOfOutputs > 0) {
                audioToConnect.push(audioNode);
            }
        }
        // Remaining nodes are connected to the output
        audioToConnect.forEach(from => onConnect(from, this._outputNode));
        Object.setPrototypeOf(this, overloads);
    }
    /** Build the graph depending on the structure defined by {@link calculateConnections} */
    async build() {
        // Reconnect Nodes
        this.calculateConnections((from, to) => from.connect(to), (from, to) => from.connectEvents(to.instanceId));
        // Update the shared data
        const content = {
            childs: [],
            innerGroupId: this.innerGroupId,
            innerGroupKey: this.innerGroupKey
        };
        for (let [node, desc] of this._childs)
            content.childs.push({ instanceId: node.instanceId, name: desc.name });
        const id = this._generateMessageId();
        !await this.post("set/shared", content);
    }
    /** Destroy the graph isconnect all the child nodes*/
    unbuild() {
        this.calculateConnections((from, to) => from.disconnect(to), (from, to) => from.disconnectEvents(to.instanceId));
    }
    //// -~- CHILD NODE MANAGEMENT AND CONNECTIONS -~- ////
    _childs = new ObservableArray();
    childs = this._childs;
    /** Add a new child node at the given position */
    async addChild(node, index = this._childs.length) {
        if (this._childs.includes(node))
            return;
        this.unbuild();
        this._childs.splice(index, 0, node);
        await this.build();
    }
    /** Remove a child node from the pedalboard */
    async removeChild(node) {
        if (!this._childs.includes(node))
            return;
        this.unbuild();
        this._childs.splice(this._childs.indexOf(node), 1);
        await this.build();
    }
    /** The number of child nodes */
    get childCount() { return this._childs.length; }
    /** Get the child node at the given index */
    getChild(index) { return this._childs[index]; }
    //// -~- CHILD NODE CREATION AND FETCHING -~- ////
    //@ts-ignore The id of the inner group
    innerGroupId;
    //@ts-ignore The key of the inner group
    innerGroupKey;
    /** The Pedalboard2 library */
    library = new Observable(null);
    /** The reason why the library is not loaded */
    libraryError = null;
    /** Create a WAM from his type id */
    async createChildWAM(wamId) {
        if (!this.library)
            return null;
        const wam = this.library.value?.plugins[wamId];
        if (!wam)
            return null;
        const constructor = (await import(wam.classURL))?.default;
        if (!constructor?.isWebAudioModuleConstructor)
            return null;
        console.log(this.innerGroupId, this.innerGroupKey);
        const instance = await constructor.createInstance(this.innerGroupId, this.context);
        return [instance, instance.descriptor];
    }
    /** Get a WAM type ID from from a WAM descriptor */
    getWAMId(descriptor) {
        return descriptor.identifier ?? (descriptor.vendor + "." + descriptor.name);
    }
    //// -~- COMPOSITE METHODS OVERLOADS -~- ////
    /** Get the exposed name of a parameter */
    getExposedName(child, index, name) {
        return child[1].name + " " + (index + 1) + " -> " + name;
    }
    /** Get a real parameter name and its associated child node from an exposed parameter name */
    getInternalName(name) {
        const splitted = name.split(" -> ");
        if (splitted.length != 2)
            return null;
        const paramName = splitted[1];
        const splitted2 = splitted[0].split(/ (?=[0-9]*^)/);
        if (splitted2.length <= 1)
            return null;
        const index = parseInt(splitted2[splitted2.length - 1]) - 1;
        if (isNaN(index))
            return null;
        return [this._childs[index], paramName];
    }
    // Overload the parameters getter to expose the parameters of the child nodes with a new public name
    get parameters() {
        const ret = new Map();
        for (let [index, child] of this._childs.entries()) {
            for (let [name, param] of child[0].audioNode.parameters) {
                ret.set(this.getExposedName(child, index, name), param);
            }
        }
        return ret;
    }
    /** Convert a parameter query to a map of child nodes and their respective queries */
    convertQuery(query) {
        const ret = new Map();
        // Get all parameters
        if (query.length == 0) {
            for (let child of this._childs)
                ret.set(child, []);
        }
        // Get according to the query
        else {
            // Get a list of nodes and queries
            const internalQuery = query.map(name => this.getInternalName(name)).filter(n => n != null);
            for (let [child, paramName] of internalQuery) {
                if (!ret.has(child))
                    ret.set(child, []);
                ret.get(child).push(paramName);
            }
        }
        return ret;
    }
    // Expose the parameter info of the child nodes with a new exposed name
    async getParameterInfo(...parameterIdQuery) {
        const query = this.convertQuery(parameterIdQuery);
        const ret = {};
        for (let [child, params] of query.entries()) {
            const infos = await child[0].audioNode.getParameterInfo(...params);
            for (let [name, info] of Object.entries(infos)) {
                ret[this.getExposedName(child, this._childs.indexOf(child), name)] = info;
            }
        }
        return ret;
    }
    // Export the parameter values of the child nodes with a new exposed name
    async getParameterValues(normalized, ...parameterIdQuery) {
        const query = this.convertQuery(parameterIdQuery);
        const ret = {};
        for (let [child, params] of query.entries()) {
            const infos = await child[0].audioNode.getParameterValues(normalized, ...params);
            for (let [name, value] of Object.entries(infos)) {
                ret[this.getExposedName(child, this._childs.indexOf(child), name)] = value;
            }
        }
        return ret;
    }
    // Set the parameter values of the child nodes with a new exposed name
    async setParameterValues(parameterValues) {
        for (const [name, value] of Object.entries(parameterValues)) {
            const internal = this.getInternalName(name);
            if (internal != null) {
                const [child, paramName] = internal;
                await child[0].audioNode.setParameterValues({ [paramName]: value });
            }
        }
    }
    // Get the total state of all nodes
    async getState() {
        const ret = { plugins: [], library: this.library?.value?.descriptor?.url };
        for (let [wam, descriptor] of this._childs) {
            ret.plugins.push({ id: this.getWAMId(descriptor), state: await wam.audioNode.getState() });
        }
        return ret;
    }
    // Set the total state of all nodes
    async setState(state) {
        this.unbuild();
        try {
            if (state.library) {
                const descriptor = await importPedalboard2Library(state.library);
                if (descriptor)
                    this.library.value = await resolvePedalboard2Library(descriptor);
                else
                    this.library.value = null;
            }
        }
        catch (e) {
            this.libraryError = e;
            return;
        }
        this._childs.splice(0, this._childs.length);
        for (let { id, state: nodeState } of state.plugins) {
            const new_child = await this.createChildWAM(id);
            if (new_child == null)
                continue;
            await new_child[0].audioNode.setState(nodeState);
            this._childs.push(new_child);
        }
        await this.build();
    }
    // Destroy inner nodes
    destroy() {
        this.unbuild();
        // TODO Destroy host
        this._childs.forEach(([{ audioNode }]) => audioNode.destroy());
    }
    connect(destinationNode, output, input) {
        //@ts-ignore
        return this._outputNode.connect(destinationNode, output, input);
    }
    disconnect(destinationNode, output, input) {
        //@ts-ignore
        return this._outputNode.disconnect(destinationNode, output, input);
    }
    connectEvents(toId, output) { }
    disconnectEvents(toId, output) { }
    post(request, content) {
        const id = this._generateMessageId();
        return new Promise((resolve) => {
            this._pendingResponses[id] = resolve;
            this.port.postMessage({ id, request, content });
        });
    }
}
