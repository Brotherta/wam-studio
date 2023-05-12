import Parameter from "./Parameter";


export default class Bind {

    name: string;
    parameters: Parameter[];

    constructor(name: string) {
        this.name = name;
        this.parameters = [];
    }

    clone() {
        let bind = new Bind(this.name);
        for (let param of this.parameters) {
            bind.parameters.push(param.clone());
        }
        return bind;
    }
}