import Bind from "./Bind";


export default class Preset {

    binds: Bind[]
    pluginState: any;
    name: string;

    constructor(name: string) {
        this.binds = [];
        this.name = name;
        this.pluginState = {};
    }

    addBind(bind: Bind) {
        this.binds.push(bind);
    }
}