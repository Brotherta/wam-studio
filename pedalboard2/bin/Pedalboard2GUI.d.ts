import { Pedalboard2Library } from "./Pedalboard2Library.js";
import { Pedalboard2NodeChild } from "./Pedalboard2Node.js";
import Pedalboard2WAM from "./Pedalboard2WAM.js";
export default class Pedalboard2GUI extends HTMLElement {
    private module;
    private node;
    private wam_chain_link?;
    private library_link?;
    constructor(module: Pedalboard2WAM);
    connectedCallback(): void;
    disconnectedCallback(): void;
    /** Promise resolved after guis are created */
    private _wait_for_guis;
    /** Associate the wams to their guis */
    private _child_to_gui;
    /** Called for each wam in the wam chain for initialization */
    protected initWAM(child: Pedalboard2NodeChild, index: number): void;
    /** Called for each wam in the wam chain for destruction */
    protected closeWAM(child: Pedalboard2NodeChild, index: number): Promise<void>;
    private _wait_for_library;
    protected initLibrary(library: Pedalboard2Library | null): void;
    protected closeLibrary(library: Pedalboard2Library | null): Promise<void>;
}
