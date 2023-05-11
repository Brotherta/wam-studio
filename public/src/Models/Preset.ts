import BindOld from "./BindOld";


export default class Preset {

    binds: BindOld[];
    pluginState: any;
    name: string;

    constructor(name: string) {
        this.binds = [];
        this.name = name;
    }

    addBind(bind: BindOld) {
        this.binds.push(bind);
    }

    removeBind(bind: BindOld) {
        const index = this.binds.indexOf(bind);
        if (index > -1) {
            this.binds.splice(index, 1);
        }
    }
}