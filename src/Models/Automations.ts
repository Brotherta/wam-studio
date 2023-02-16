// @ts-ignore
import BPF from "../Utils/BPF"
import {MAX_DURATION_SEC, RATIO_MILLS_BY_PX} from "../Utils";

export default class Automations {

    bpfList: BPF[];

    constructor() {
        this.bpfList = [];
    }

    updateAutomation(_params: any) {
        let recordUpdated = new Array(this.bpfList.length).fill(0);

        let newBpf = [];
        for (let param in _params) {
            let index = this.bpfList.findIndex((bpf) => bpf.paramID === param);

            if (index == -1) { // new parameter
                let bpf = document.createElement("bpf-automation") as BPF;
                let {minValue, maxValue} = _params[param];
                // @ts-ignore
                bpf.paramID = param;
                bpf.style.position = "relative";
                bpf.setAttribute('min', minValue);
                bpf.setAttribute('max', maxValue);
                let defaultValue = (maxValue - minValue) / 2;
                bpf.setAttribute('default', defaultValue.toString());
                bpf.setAttribute('domain', MAX_DURATION_SEC.toString());
                // @ts-ignore
                bpf.setSizeBPF((MAX_DURATION_SEC * 1000) / RATIO_MILLS_BY_PX)
                console.log("new bpf for ", param);

                newBpf.push(bpf);
            }
            else { // existing parameter, it already exists
                recordUpdated[index] = 1;
            }
        }

        // remove parameters that doesn't exist anymore.
        this.bpfList = this.bpfList.filter((_, index) => recordUpdated[index] == 1);
        this.bpfList = this.bpfList.concat(newBpf);
        console.table(this.bpfList);
    }

    clearAllAutomation(params: any) {
        this.removeAutomation();
        this.updateAutomation(params);
    }

    removeAutomation() {
        for (let bpfListElement of this.bpfList) {
            bpfListElement.remove();
        }
        this.bpfList = [];
    }

    getBpfOfparam(param: string) {
        let index = this.bpfList.findIndex((bpf) => bpf.paramID === param);
        if (index != -1) {
            return this.bpfList[index];
        }
        else return undefined;
    }
}