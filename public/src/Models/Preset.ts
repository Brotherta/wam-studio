import Bind from "./Bind";


export default class Preset {

    binds: Bind[];
    pluginState: any;
    name: string;

    constructor(name: string) {
        this.binds = [];
        this.name = name;
    }

    addBind(bind: Bind) {
        this.binds.push(bind);
    }

    removeBind(bind: Bind) {
        const index = this.binds.indexOf(bind);
        if (index > -1) {
            this.binds.splice(index, 1);
        }
    }
}