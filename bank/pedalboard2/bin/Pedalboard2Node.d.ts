import { Pedalboard2Library } from "./Pedalboard2Library.js";
import { Observable, ReadonlyObservableArray } from "./Utils/observable.js";
import type { WamDescriptor, WamParameterDataMap, WamParameterInfoMap } from "./webaudiomodules/api/index.js";
import { WamNode, WebAudioModule } from "./webaudiomodules/sdk/index.js";
export type Pedalboard2NodeChild = {
    wam: WebAudioModule<WamNode>;
    descriptor: WamDescriptor;
    id: number;
};
export type Pedalboard2NodeFetcher = (wamId: string, groupId: string, groupKey: string) => Promise<Pedalboard2NodeChild>;
export type Pedalboard2SharedData = {
    child_order: number[];
    childs: {
        [id: number]: {
            instanceId: string;
            name: string;
        };
    };
    innerGroupId: string;
    innerGroupKey: string;
};
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
export declare class Pedalboard2Node extends WamNode {
    /**
     * @param module The Pedalboard2WAM module
     * @param outputNode An internal Passthrough needed as output.
     */
    constructor(module: WebAudioModule<Pedalboard2Node>);
    _initialize(): Promise<void>;
    static addModules(audioContext: BaseAudioContext, moduleId: string): Promise<void>;
    private _outputNode;
    /**
     * Calculate the connections between the child nodes, the input and the output.
     * Call the given callback for each connection.
     * You have to modify this function to change how the child nodes will be connected.
     * @param onConnect The callback to call for each call to {@link AudioNode.connect}
     * @param onConnectEvent The callback to call for each call to {@link WamNode.connectEvents}
     */
    private calculateConnections;
    /** Build the graph depending on the structure defined by {@link calculateConnections} */
    private build;
    /** Destroy the graph isconnect all the child nodes*/
    private unbuild;
    private _childs;
    private _id_to_child;
    readonly childs: ReadonlyObservableArray<Pedalboard2NodeChild>;
    /** Add a new child node at the given position */
    addChild(node: Pedalboard2NodeChild, index?: number): Promise<void>;
    /** Remove a child node from the pedalboard */
    removeChild(node: Pedalboard2NodeChild): Promise<void>;
    destroyChild(node: Pedalboard2NodeChild): Promise<void>;
    /** The number of child nodes */
    get childCount(): number;
    /** Get the child node at the given index */
    getChild(index: number): any;
    private innerGroupId;
    private innerGroupKey;
    /** The Pedalboard2 library */
    library: Observable<Pedalboard2Library | null>;
    /** The reason why the library is not loaded */
    libraryError: any | null;
    /** Create a WAM from his type id */
    createChildWAM(wamId: string, forced_id?: number): Promise<Pedalboard2NodeChild | null>;
    private idcounter;
    /** Get a WAM type ID from from a WAM descriptor */
    getWAMId(descriptor: WamDescriptor): string;
    /** Convert a parameter query to a map of child nodes and their respective queries */
    private convertQuery;
    getParameterInfo(...parameterIdQuery: string[]): Promise<WamParameterInfoMap>;
    getParameterValues(normalized?: boolean, ...parameterIdQuery: string[]): Promise<WamParameterDataMap>;
    setParameterValues(parameterValues: WamParameterDataMap): Promise<void>;
    getState(): Promise<Pedalboard2NodeState>;
    setState(state: Pedalboard2NodeState): Promise<void>;
    destroy(): void;
    connect(destinationNode: AudioNode, output?: number, input?: number): AudioNode;
    connect(destinationParam: AudioParam, output?: number): void;
    disconnect(destinationNode?: unknown, output?: unknown, input?: unknown): void;
    connectEvents(toId: string, output?: number): void;
    disconnectEvents(toId?: string, output?: number): void;
    private post;
}
export type Pedalboard2NodeState = {
    plugins: {
        id?: number;
        wam_id: string;
        state: any;
    }[];
    library?: string;
};
export declare const ParameterUtils: {
    new (): {};
    /** Get the id of a parameter as exposed outside the pedalboard2 */
    exposed_id(id: number, parameter: string): string;
    /** Get the id of the child pedalboard and the parameter id from the exposed id */
    internal_id(child: string): {
        id: number;
        parameter: string;
    } | null;
    /** Get the name of a parameter as exposed outside the pedalboard2 */
    exposed_name(child_index: number, child_name: string, parameter_name: string): string;
};
