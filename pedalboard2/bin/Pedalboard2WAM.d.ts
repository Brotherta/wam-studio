import { Pedalboard2Node, Pedalboard2NodeState } from "./Pedalboard2Node.js";
import { WebAudioModule } from "./webaudiomodules/sdk/index.js";
/**
 * A Pedalboard holding multiples WAMs in a chain.
 * Hold multiples WAMs connected in a chain.
 */
export default class Pedalboard2WAM extends WebAudioModule<Pedalboard2Node> {
    initialize(state?: Pedalboard2NodeState): Promise<import("./webaudiomodules/api/index.js").WebAudioModule<import("./webaudiomodules/api/index.js").WamNode>>;
    createGui(): Promise<Element>;
    createAudioNode(initialState?: any): Promise<Pedalboard2Node>;
}
