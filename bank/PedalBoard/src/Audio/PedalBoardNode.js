
import WamNode from "../../plugins/utils/sdk/src/WamNode.js";
import addFunctionModule from "../../plugins/utils/sdk/src/addFunctionModule.js";
import getCustomProcessor from "./CustomProcessor.js";

/**
 * //TODO Better support for wam with not sound input, no midi input, no sound input, no midi 
 * // If an WAM has no sound input, the previous node should try to connect to the next one, if th next one has no sound input, it shoud connect to [...]
 * // This way, there is no unused produced audio buffer. Having such things have no sense.
 * 
 * O ---> O ---> O
 * 
 * O      O ---> O
 * |_____________^
 * 
 * O      O      O ---> O
 * |______v_____________^
 */
export default class PedalBoardNode extends WamNode {

  /**
   * Register scripts required for the processor. Must be called before constructor.
   * @param {BaseAudioContext} audioContext
   * @param {string} moduleId
   */
  static async addModules(audioContext, moduleId) {
    const { audioWorklet } = audioContext;
    await super.addModules(audioContext, moduleId);
    await addFunctionModule(audioWorklet, getCustomProcessor, moduleId);
  }

  nodeId = 0;

  /** @type {{ [key: number]:{ name:string, node:WamNode } }} */
  nodes = {};

  MAX_NODES = 30;

  /**
   * @param {WebAudioModule} plugin 
   */
  constructor(plugin) {
    super(plugin, {
      processorOptions: {
        numberOfInputs: 1,
        numberOfOutputs: 1,
      },
    });
    this._supportedEventTypes.add("wam-info");
  }

  /**
   * Create the subGroup used by the plugins and initialize the PedalBoard hidden AudioNodes.
   * @author Quentin Beauchet
   */
  async _initialize() {
    await super._initialize();
    // @ts-ignore
    const { default: initializeWamHost } = await import("../../plugins/utils/sdk/src/initializeWamHost.js");
    let [subGroupId, subGroupKey] = await initializeWamHost(this.module.audioContext);
    this.subGroupId = subGroupId;

    this.port.postMessage({
      request: "set/init",
      content: { subGroupId, subGroupKey },
    });

    this.createNodes();
    this.connectNodes([]);
  }

  /**
   * Create the input and output nodes of the PedalBoard.
   * @author Quentin Beauchet
   */
  createNodes() {
    this._input = this.context.createGain();
    super.connect(this._input);

    this._output = this.context.createAnalyser();
    this._output.minDecibels = -90;
    this._output.maxDecibels = -10;
    this._output.smoothingTimeConstant = 0.85;
  }

  connect(...args){
    return this._output?.connect(...args);
  }


  disconnect(...args) {
    return this._output?.disconnect(...args);
  }

  /**
   * Connect every nodes from the board of the Gui.
   * @param {HTMLCollection} nodes
   * @author Quentin Beauchet
   */
  connectNodes(nodes) {
    this.lastNode = this._input;
    nodes.forEach((el) => {
      let audioNode = this.nodes[el.id].node;
      this.lastNode.connect(audioNode);
      this.lastNode = audioNode;
    });

    this.lastNode.connect(this._output);
    this.updateInfos();
  }

  /**
   * Disconnects every nodes from the board of the Gui. It then check the nodes stored in this.nodes and
   * if they aren't needed anymore it delete them from the object.
   * The callback is used when changing the order of the plugins on the board or when removing a plugin.
   * The boolean forced is needed when using setState().
   * @param {HTMLCollection} nodes
   * @author Quentin Beauchet
   */
  disconnectNodes(nodes, forced, callback) {
    this.lastNode = this._input;
    nodes.forEach((el) => {
      let audioNode = this.nodes[el.id].node;
      this.lastNode.disconnect();
      this.lastNode = audioNode;
    });
    this.lastNode.disconnect();

    if (callback) {
      callback();
    }

    this.cleanup(nodes, forced);
  }

  /**
   * Act like a garbage collector, it remove wap that aren't in the board anymore.
   * @param {HTMLCollection} nodes
   * @param {boolean} forced remove every wap if true
   * @author Quentin Beauchet
   */
  cleanup(nodes, forced) {
    if (forced) {
      for (let key in this.nodes) {
        this.nodes[key].node.destroy();
        delete this.nodes[key];
      }
      this.nodes = {};
      this.connectNodes([]);
    } else {
      let ids = Array.from(nodes).map((el) => el.id);
      for (let key in this.nodes) {
        if (!ids.includes(key)) {
          this.nodes[key].node.destroy();
          delete this.nodes[key];
        }
      }
      this.connectNodes(nodes);
    }
  }

  /**
   * Connect audioNode at the end of the PedalBoard beetween this.lastNode and this._output.
   * @param {WamNode} audioNode
   * @author Quentin Beauchet
   */
  connectPlugin(audioNode) {
    this.lastNode.disconnect(this._output);

    try{
      this.lastNode.connect(audioNode);
      audioNode.connect(this._output);
      this.lastNode = audioNode;
    }
    catch(e){
      this.lastNode.connect(this._output)
    }
    
  }

  /**
   * Add the audioNode the the audio of the PedalBoard,then it calls updateInfos() to refresh the automation labels.
   * @param {WamNode} audioNode The audioNode.
   * @param {string} pedalName The name of the node.
   * @param {number} id The unique id of the node, it help to map the audioNode to it's Gui.
   * @author Quentin Beauchet
   */
  addPlugin(audioNode, pedalName, id) {
    this.connectPlugin(audioNode);
    this.nodes[id] = { name: pedalName, node: audioNode };
    this.updateInfos();
    audioNode.addEventListener("wam-info", () => {
      this.updateInfos();
    });
  }

  /**
   * Returns the state of the PedalBoard, it's an object containing the state of each of it's nodes plus the output node.
   * @returns The state of the PedalBoard
   * @author Quentin Beauchet, Yann Forner
   */
  async getState() {
    let gui = this.module.gui;
    let ids = Array.from(gui.board.childNodes).map((el) => el.id);
    let states = await Promise.all(ids.map((id) => this.nodes[id].node.getState()));

    let current = states.map((el, index) => ({
      name: this.nodes[ids[index]].name,
      state: el,
    }));
    let presets = JSON.parse(JSON.stringify(gui.PresetsBank));

    return { current, presets };
  }

  /**
   * This function clear the board, disconnect all the modules, add the new modules from the param and set their states
   * @param {Object} state
   * @author  Yann Forner
   */
  async setState(state) {
    await this.module.loadPreset(state.current);
    await this.module.gui.reloadPresets(state.presets);
  }

  /**
   * Call setState with the initial state passed at the initialisation. It needs to be called inside the gui because
   * the audio and the gui of the pedalboard are strongly connected.
   * @author  Quentin Beauchet
   */
  async initState() {
    await this.setState(this.initialState);
  }

  async resetState() {
    await this.setState(this.initialState);
    this.nodeId = 0;
  }

  /**
   * Trigger an event to inform the ParamMgrNode of a change in order or an addition/deletion of the nodes in the PedalBoard.
   * @author Quentin Beauchet
   */
  updateInfos() {
    let nodes = Object.entries(this.nodes);
    this.port.postMessage({
      request: "set/nodes",
      content: {
        nodes: nodes.map(([key, value]) => {
          return { name: value.name, nodeId: value.node.instanceId, customId: key };
        }),
      },
    });
    this.dispatchEvent(
      new CustomEvent("wam-info", {
        detail: { data: this },
      })
    );

    if (this.module?.gui) {
      this.module.gui.setPreviewFullness(nodes.length >= this.MAX_NODES || this.module.gui.loadingPreset);
    }
  }
}
