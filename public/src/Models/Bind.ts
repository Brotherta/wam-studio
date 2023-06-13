import Parameter from "./Parameter";


export default class Bind {

    name: string;
    parameters: Parameter[];
    currentValue: string;

    constructor(name: string) {
        this.name = name;
        this.parameters = [];
        this.currentValue = "50";
    }

    clone() {
        let bind = new Bind(this.name);
        for (let param of this.parameters) {
            bind.parameters.push(param.clone());
        }
        bind.currentValue = this.currentValue;
        return bind;
    }
}