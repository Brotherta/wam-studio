const getCustomProcessor = (moduleId) => {
  const audioWorkletGlobalScope = globalThis;
  const { registerProcessor } = audioWorkletGlobalScope;

  const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
  const { WamProcessor } = ModuleScope;

  class CustomProcessor extends WamProcessor {
    constructor(options) {
      super(options);
    }

    /**
     * We need to override it because we want to manage
     * this._parameterInfo manually do to the dynamic nature of the pedlaboard.
     * @author Quentin Beauchet
     */
    _initialize() {}

    /**
     * We copy the input to the output without altering anything.
     * @param {number} startSample beginning of processing slice
     * @param {number} endSample end of processing slice
     * @param {Float32Array[][]} inputs
     * @param {Float32Array[][]} outputs
     * @param {{[x: string]: Float32Array}} parameters
     * @author Quentin Beauchet
     */
    _process(startSample, endSample, inputs, outputs) {
      const input = inputs[0];
      const output = outputs[0];
      if (input.length > 0) {
        for (let c = 0; c < output.length; c++) {
          const x = input[c];
          const y = output[c];
          let n = startSample;
          while (n < endSample) {
            y[n] = x[n];
            n++;
          }
        }
      }
    }

    /**
     * If we don't already store the informations, we get it from each nodes in the PedalBoard and we give each a
     * unique key with the order of the nodeName and the label. If this._parameterInfo is not empty, for each id passed as parameter we
     * return the information stored in it.
     * @param  {string[]} parameterIdQuery A list a node parameters ids.
     * @returns A object including informations about each parameter id passed as parameters.
     * @author Quentin Beauchet
     */
    async getParameterInfo(...parameterIdQuery) {
      if (parameterIdQuery.length == 0) {
        this._parameterInfo = {};

        var childInfos = await Promise.all(
          this.nodes.map((node) => this.group.processors.get(node.nodeId).getParameterInfo())
        );

        childInfos.forEach((child, i) => {
          child = JSON.parse(JSON.stringify(child));
          const infos = Object.keys(child);
          const { name, nodeId, customId } = this.nodes[i];

          infos.forEach((key) => {
            let info = child[key];
            info.nodeId = nodeId;
            info.id = key;
            this._parameterInfo[`n°${customId} ${name} -> ${info.id}`] = info;
          });
        });

        return this._parameterInfo;
      } else {
        return parameterIdQuery.reduce((infos, id) => {
          infos[id] = this._parameterInfo[id];
          return infos;
        }, {});
      }
    }

    /**
     * Returns the parameter values from a node in the PedalBoard.
     * @param {boolean} normalized This parameter is heredited from WamProcessor but it is not used.
     * @param {string} parameterIdQuery The id of the node in the PedalBoard, it was set in getParameterInfo().
     * @returns The parameter values of the node.
     * @author Quentin Beauchet
     */
    async getParameterValues(normalized, parameterIdQuery) {
      let parameter = this._parameterInfo[parameterIdQuery];
      if (parameter) {
        let value = await this.group.processors.get(parameter.nodeId).getParameterValues();
        return {
          [parameterIdQuery]: value[parameter.id],
        };
      }
    }

    /**
     * Manage the messages beetween the audioThread and the mainThread:
     * - "set/init" is called only once and is needed to know the subGroup for the plugins.
     * - "set/nodes" is called each team the order of the plugins on the Pedalboard is changed.
     * - "get/parameterInfo" return to the mainThread informations about a plugin parameter informations.
     * - "get/parameterValues"  return to the mainThread informations about a plugin parameter values.
     * - "add/event" add and event to the EventQueue, mainly used for automation.
     * For all other type of messages the method from WamProcessor is called.
     * @param {*} message
     * @author Quentin Beauchet
     */
    async _onMessage(message) {
      const { id, request, content } = message.data;
      if (request == "set/init") {
        let { subGroupId, subGroupKey } = content;
        this.group = audioWorkletGlobalScope.webAudioModules.getGroup(subGroupId, subGroupKey);
      } else if (request == "set/nodes") {
        this.nodes = content.nodes;
      } else if (request == "get/parameterInfo") {
        this.port.postMessage({ id, response: request, content: await this.getParameterInfo(...content.parameterIds) });
      } else if (request == "get/parameterValues") {
        let { normalized, parameterIds } = content;
        this.port.postMessage({
          id,
          response: request,
          content: await this.getParameterValues(normalized, ...parameterIds),
        });
      } else if (request == "add/event") {
        this.scheduleEvents(content.event);
      } else {
        await super._onMessage(message);
      }
    }

    /**
     * When an event is sent to the PedalBoard we propagate it to the wam in his chain.
     * @param  {WamEvent[]} events List of events to propagate to the nodes in the PedalBoard.
     * @author Quentin Beauchet
     */
    scheduleEvents(...events) {
      events.forEach((event) => {
        const { type, data, time } = event;
        const { id, value } = data;
        var param = this._parameterInfo[id];

        this.group.processors.get(param.nodeId).scheduleEvents({
          type,
          time,
          data: { id: param.id, normalized: param.normalized, value },
        });
      });
    }

    /**
     * Clear the events of all the plugins on the PedalBoard.
     * @author Quentin Beauchet
     */
    clearEvents() {
      for (let node of this.nodes) {
        this.group.processors.get(node.nodeId).clearEvents();
      }
    }
  }

  try {
    registerProcessor(moduleId, CustomProcessor);
  } catch (error) {
    console.warn(error);
  }

  return CustomProcessor;
};

export default getCustomProcessor;
