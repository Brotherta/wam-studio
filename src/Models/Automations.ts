// @ts-ignore
import BPF from "../Utils/BPF"

export default class Automations {

    bpfList: BPF[];

    constructor() {
        this.bpfList = [];
    }

    updateAutomation(_params: any) {
        let recordUpdated = new Array(this.bpfList.length).fill(0);

        let newBpf = [];
        for (let param in _params) {
            let index = this.bpfList.findIndex((bpf) => bpf.paramId === param);

            if (index == -1) { // new parameter
                newBpf.push(this.createBpf(param));
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

    createBpf(param: any) {
        let bpf = document.createElement("bpf-automation");
        // @ts-ignore
        bpf.paramId = param;
        console.log("new bpf for ", param);
        return bpf;
    }
}