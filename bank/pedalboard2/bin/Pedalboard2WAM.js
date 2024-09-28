import Pedalboard2GUI from "./Pedalboard2GUI.js";
import { Pedalboard2Node } from "./Pedalboard2Node.js";
import { WebAudioModule } from "./webaudiomodules/sdk/index.js";
/**
 * A Pedalboard holding multiples WAMs in a chain.
 * Hold multiples WAMs connected in a chain.
 */
export default class Pedalboard2WAM extends WebAudioModule {
    _descriptorUrl = import.meta.resolve("./descriptor.json");
    async initialize(state) {
        await this._loadDescriptor();
        return await super.initialize(state);
    }
    async createGui() {
        return new Pedalboard2GUI(this);
    }
    destroyGui(gui) {
        gui.dispose();
    }
    async createAudioNode(initialState) {
        await Pedalboard2Node.addModules(this.audioContext, this.moduleId);
        const ret = new Pedalboard2Node(this);
        await ret._initialize();
        return ret;
    }
}
