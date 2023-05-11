import Parameter from "./Parameter";


export default class Bind {

    name: string;
    parameters: Parameter[];

    constructor(name: string) {
        this.name = name;
        this.parameters = [];
    }

}