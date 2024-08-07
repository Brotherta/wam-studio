import { Pedalboard2Library } from "./Pedalboard2Library.js";
import { Pedalboard2NodeChild } from "./Pedalboard2Node.js";
import Pedalboard2WAM from "./Pedalboard2WAM.js";
import { Observable } from "./Utils/observable.js";
export default class Pedalboard2GUI extends HTMLElement {
    private module;
    private node;
    private library_input;
    private wam_chain_link?;
    private library_link?;
    private category_link?;
    constructor(module: Pedalboard2WAM);
    connectedCallback(): void;
    disconnectedCallback(): void;
    /** Associate the wams to their guis */
    private _child_to_gui;
    /** Called for each wam in the wam chain for initialization */
    protected initWAM(child: Pedalboard2NodeChild, index: number): void;
    /** Called for each wam in the wam chain for destruction */
    protected closeWAM(child: Pedalboard2NodeChild, index: number): void;
    protected initLibrary(library: Pedalboard2Library | null): void;
    readonly plugin_category: Observable<string | null>;
    initSelector(category: string | null): void;
    protected closeLibrary(library: Pedalboard2Library | null): Promise<void>;
    private promiseChain;
    private executePromise;
}
