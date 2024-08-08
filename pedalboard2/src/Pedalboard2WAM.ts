import Pedalboard2GUI from "./Pedalboard2GUI.js";
import { Pedalboard2Node, Pedalboard2NodeState } from "./Pedalboard2Node.js";
import { WebAudioModule } from "./webaudiomodules/sdk/index.js";


/**
 * A Pedalboard holding multiples WAMs in a chain.
 * Hold multiples WAMs connected in a chain.
 */
export default class Pedalboard2WAM extends WebAudioModule<Pedalboard2Node>{

    _descriptorUrl = import.meta.resolve("./descriptor.json")

    override async initialize(state?: Pedalboard2NodeState){
        await this._loadDescriptor()
        return await super.initialize(state)
    }

    async createGui(): Promise<Element> {
        return new Pedalboard2GUI(this)
    }

    override async createAudioNode(initialState?: any): Promise<Pedalboard2Node> {
        await Pedalboard2Node.addModules(this.audioContext, this.moduleId)
        const ret=new Pedalboard2Node(this)
        await ret._initialize()
        return ret
    }

}