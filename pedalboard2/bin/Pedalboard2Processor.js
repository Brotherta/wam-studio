export function getPedalboard2Processor(moduleId) {
    const context = globalThis;
    const module = context.webAudioModules.getModuleScope(moduleId);
    /**
     * The processor class for the Pedalboard2 Node.
     */
    class Pedalboard2Processor extends module.WamProcessor {
        shared;
        group;
        _initialize() {
            super._initialize();
        }
        async _onMessage(message) {
            const { id, request, content } = message.data;
            if (request == "set/shared") {
                this.shared = content;
                this.group = context.webAudioModules.getGroup(this.shared.innerGroupId, this.shared.innerGroupKey);
            }
            else if (request == "add/event") {
                this.scheduleEventDown(content.event);
            }
            super._onMessage(message);
        }
        // Do nothing to the audio
        // Just copy the input to the output
        _process(startSample, endSample, inputs, outputs, parameters) {
            for (let c = 0; c < outputs.length; c++) {
                for (let i = 0; i < outputs[c].length; i++) {
                    outputs[c][i].set(inputs[c][i]);
                }
            }
        }
        /** -~- UTILS -~- */
        /** Get a wamprocessor and a parameter inernal name from an exposed parameter name  */
        getInternalName(name) {
            if (!this.shared || !this.group)
                return null;
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
            const processor = this.group.processors.get(this.shared.childs[index].instanceId);
            if (!processor)
                return null;
            return [processor, paramName];
        }
        /** -~- SEND TO CHILDS -~- */
        /** Send an event to the childs nodes */
        scheduleEventDown(event) {
            if (event.type == "wam-automation") {
                const target = this.getInternalName(event.data.id);
                if (target) {
                    const [processor, paramName] = target;
                    processor.scheduleEvents({ type: "wam-automation", data: { id: paramName, value: event.data.value, normalized: event.data.normalized } });
                }
            }
            else {
                if (this.group) {
                    for (const processor of this.group.processors.values()) {
                        processor.scheduleEvents(event);
                    }
                }
            }
        }
        /** -~- COMPOSITE METHODS OVERLOADS -~- */
        // Give back the events to the child nodes, and convert the exposer parameter names
        scheduleEvents(...event) {
            for (const e of event)
                this.scheduleEventDown(e);
        }
        // Clear the events of the child nodes
        clearEvents() {
            for (const processor of this.group?.processors.values() || []) {
                processor.clearEvents();
            }
        }
    }
    try {
        context.registerProcessor(moduleId, Pedalboard2Processor);
    }
    catch (e) { }
}
