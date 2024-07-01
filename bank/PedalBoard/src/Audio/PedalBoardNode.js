
import WamNode from "../../plugins/utils/sdk/src/WamNode.js";
import addFunctionModule from "../../plugins/utils/sdk/src/addFunctionModule.js";
import getCustomProcessor from "./CustomProcessor.js";

/**
 * //TODO It seem like the wams are not garbage collected when they are removed. They should.
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

  /** @type {{ [key: number]:{ name:string, node:WamNode, wam:WebAudioModule, hasAudioInput:boolean, hasAudioOutput:boolean} }} */
  nodes = {}

  /** @type {(typeof this.nodes)[0][]} */
  nodeQueue = []

  /** @type {typeof this.nodeQueue} */
  #previousQueue = []

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
    this.#connectNodes();
  }

  /**
   * Create the input and output nodes of the PedalBoard.
   * @author Quentin Beauchet
   */
  createNodes() {
    this._input = this.context.createGain();

    this._output = this.context.createAnalyser();
    this._output.minDecibels = -90;
    this._output.maxDecibels = -10;
    this._output.smoothingTimeConstant = 0.85;

    super.connect(this._input).connect(this._output);
  }

  connect(...args){
    return this._output?.connect(...args);
  }


  disconnect(...args) {
    return this._output?.disconnect(...args);
  }

  /**
   * Connect all nodes of the pedalboard in the right order.
   * @author Samuel DEMONT
   */
  #connectNodes() {

    const linkNodes=
    /**
    * @param {PedalBoardNode['nodeQueue']} nodes
    * @param {string} visual
    * @param {(a:AudioNode,b:AudioNode)=>void} callback
    */
    function(nodes,visual,callback){
      const toLink=[this._input]
      toLink[0].name="input"
      for(const nodeentry of nodes){
        let nextNode = nodeentry.node
        nextNode.name=nodeentry.name
        if(nodeentry.hasAudioInput && nextNode.numberOfInputs>0){
          console.log(toLink.map(it=>it.name),visual,nextNode.name)
          toLink.forEach(it=>callback(it,nextNode))
          toLink.length=0
        }
        if(nodeentry.hasAudioOutput && nextNode.numberOfOutputs>0)toLink.push(nextNode)
      }
      console.log(toLink.map(it=>it.name),visual,"output")
      toLink.forEach(it=>callback(it,this._output))
    }.bind(this)

    // Disconnect the nodes
    linkNodes(this.#previousQueue, " =X> ", (a,b)=>a.disconnect(b))
    linkNodes(this.nodeQueue, " ==> ", (a,b)=>a.connect(b))
    this.#previousQueue=[...this.nodeQueue]
    this.updateInfos();
  }

  /**
   * Remove the WAM AudioNode from the audio of the PedalBoard.
   * @param {number} id 
   */
  removePlugin(id){
    if(id in this.nodes){
      const nodeentry = this.nodes[id]
      delete this.nodes[id]
      this.nodeQueue.splice(this.nodeQueue.indexOf(nodeentry),1)
      this.#connectNodes()
    }
  }

  /**
   * Remove all the WAM AudioNode from the audio of the PedalBoard.
   */
  removeAll(){
    for(const id of Object.keys(this.nodes)) this.removePlugin(Number.parseInt(id))
  }

  /**
   * Add the Web Audio Module the the audio of the PedalBoard.
   * If there is already a node with the same id, nothing is done.
   * @param {WebAudioModule} wam The audioNode.
   * @param {string} pedalName The name of the node.
   * @param {number} id The unique id of the node, it help to map the audioNode to it's Gui.
   * @author Quentin Beauchet
   */
  addPlugin(wam, pedalName, id) {
    if(id in this.nodes){
      console.warn("Duplicate node id",id)
      return
    }

    // Get node informations
    const node=wam.audioNode
    console.log(pedalName,wam.descriptor)
    const hasAudioInput= !!wam.descriptor.hasAudioInput
    const hasAudioOutput= !!wam.descriptor.hasAudioOutput

    // Create and add the entry
    const entry = { name: pedalName, wam, node, hasAudioInput, hasAudioOutput }
    this.nodes[id] = entry;
    this.nodeQueue.push(entry)

    this.#connectNodes()
    wam.audioNode.addEventListener("wam-info", ()=>this.updateInfos())
  }

  /**
   * Move a node in the pedalboard at the given index of the current nodeQueue configuration.
   * @param {number} id The moved node id.
   * @param {number} index The new index of the node.
   */
  movePlugin(id,index){
    if(id in this.nodes){
      const entry= this.nodes[id]
      const pos= this.nodeQueue.indexOf(entry)
      this.nodeQueue.splice(pos,1)
      if(pos<index)index--
      this.nodeQueue.splice(index,0,entry)
      this.#connectNodes()
    }
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
   * @param {any} state
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
