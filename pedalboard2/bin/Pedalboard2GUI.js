import { adoc, doc } from "./Utils/dom.js";
const template = doc /*html*/ `
    <link rel="stylesheet" href="${import.meta.resolve("./style.css")}">
    <h1>Pedalboard 2</h1>
    <div id="selector">
    </div>
    <div id="modules">
        <div class="_wall">
            <i class="_connection _output _audio"></i>
            <i class="_connection _output _midi"></i>
        </div>
        <div class="_wall">
            <i class="_connection _input _audio"></i>
            <i class="_connection _input _midi"></i>
        </div>
    </div>
`;
const moduleTemplate = adoc /*html*/ `
    <div class="module">
        <h2 class="_name" draggable="true">Module 1</h2>
        <i class="_remove">✖</i>
        <div class="_content"><div class="_loading"></div></div>
    </div>
`;
const dropMarkerTemplate = adoc /*html*/ `
    <div class="dropMarker"></div>
`;
export default class Pedalboard2GUI extends HTMLElement {
    module;
    node;
    wam_chain_link;
    library_link;
    constructor(module) {
        super();
        this.module = module;
        this.node = module.audioNode;
    }
    connectedCallback() {
        this.attachShadow({ mode: "open" });
        this.shadowRoot?.replaceChildren(template.cloneNode(true));
        this.wam_chain_link = this.node.childs.link(this.initWAM.bind(this), this.closeWAM.bind(this));
        this.library_link = this.node.library.link(library => this.initLibrary(library), library => this.closeLibrary(library));
    }
    disconnectedCallback() {
        if (this.wam_chain_link)
            this.node.childs.unlink(this.wam_chain_link);
        if (this.library_link)
            this.node.library.unlink(this.library_link);
    }
    //// WAM CHAINS : the inner WAMs GUIs ////
    /** Promise resolved after guis are created */
    _wait_for_guis = Promise.resolve();
    /** Associate the wams to their guis */
    _child_to_gui = new Map();
    /** Called for each wam in the wam chain for initialization */
    initWAM(child, index) {
        this._wait_for_guis = this._wait_for_guis.then((async () => {
            const [wam, descriptor] = child;
            // Add window
            const modules = this.shadowRoot?.getElementById("modules");
            const window = moduleTemplate.cloneNode(true);
            modules.insertBefore(window, modules.children[index + 1]);
            // Set title name
            window.querySelector("._name").textContent = descriptor.name;
            // Set content
            const gui = await wam.createGui();
            window.querySelector("._content").replaceChildren(gui);
            // Set Inputs / Outputs
            if (wam.descriptor.hasAudioInput && wam.audioNode.numberOfInputs > 0)
                window.appendChild(adoc /*html*/ `<i class="_connection _input _audio"></i>`);
            if (wam.descriptor.hasAudioOutput && wam.audioNode.numberOfOutputs > 0)
                window.appendChild(adoc /*html*/ `<i class="_connection _output _audio"></i>`);
            if (wam.descriptor.hasMidiInput)
                window.appendChild(adoc /*html*/ `<i class="_connection _input _midi"></i>`);
            if (wam.descriptor.hasMidiOutput)
                window.appendChild(adoc /*html*/ `<i class="_connection _output _midi"></i>`);
            // Remove button
            window.querySelector("._remove").addEventListener("click", () => {
                this.node.removeChild(child);
            });
            // Start dragging
            window.addEventListener("dragstart", (event) => {
                event.dataTransfer?.setDragImage(window, 0, 0);
                event.dataTransfer?.setData("text/plain", child[0].instanceId);
            });
            // Drag enter -> over -> leave -> drop
            window.addEventListener("dragenter", (event) => {
                window.after(dropMarkerTemplate.cloneNode(true));
            });
            window.addEventListener("dragleave", (event) => {
                window.nextElementSibling?.remove();
            });
            window.addEventListener("dragover", (event) => {
                event.preventDefault();
            });
            window.addEventListener("drop", (event) => {
                window.nextElementSibling?.remove();
                // Get child
                const dropInstanceID = event.dataTransfer?.getData("text/plain");
                if (!dropInstanceID)
                    return;
                const dropChild = this.node.childs.find(it => it[0].instanceId == dropInstanceID);
                if (!dropChild)
                    return;
                // Remove
                this.node.removeChild(dropChild);
                // Add
                const index = this.node.childs.indexOf(child) + 1;
                this.node.addChild(dropChild, index);
            });
            this._child_to_gui.set(child, [window, gui]);
        }));
    }
    /** Called for each wam in the wam chain for destruction */
    async closeWAM(child, index) {
        // Wait for guis to be intialized
        await this._wait_for_guis;
        const elements = this._child_to_gui.get(child);
        if (!elements)
            return;
        const [window, gui] = elements;
        const [wam, descriptor] = child;
        window.remove();
        wam.destroyGui(gui);
    }
    //// WAM LIBRARY : the list of available WAMs ////
    _wait_for_library = Promise.resolve();
    initLibrary(library) {
        this._wait_for_library = this._wait_for_library.then(async () => {
            console.log("aa", library);
            if (!library)
                return;
            const selector = this.shadowRoot?.getElementById("selector");
            for (const { descriptor, classURL } of Object.values(library.plugins)) {
                // Get thumbnail
                const src = await (async () => {
                    let src = descriptor.thumbnail;
                    if (!src)
                        return null;
                    src = new URL(src, classURL).href;
                    console.log(src, classURL);
                    // Check if thumbnail exists
                    const head = await fetch(src, { method: "HEAD", mode: "cors" }).catch(err => null).then(res => res?.ok ? res : null);
                    if (head == null)
                        return null;
                    return src;
                })();
                // Create thumbnail
                let thumbnail;
                if (src != null)
                    thumbnail = adoc `<img src="${src}">`;
                else {
                    let seed = 0;
                    for (let i = 0; i < descriptor.name.length; i++)
                        seed = seed * 10 + descriptor.name.charCodeAt(i);
                    thumbnail = adoc `<div style="background-color: hsl(${seed / 10 % 360}, 50%, 50%)">${descriptor.name}</div>`;
                }
                selector.appendChild(thumbnail);
                // Add wam
                thumbnail.addEventListener("click", async () => {
                    const wam = await this.node.createChildWAM(descriptor.identifier);
                    if (wam == null)
                        return;
                    this.node.addChild(wam);
                });
            }
        });
    }
    async closeLibrary(library) {
        this._wait_for_library = this._wait_for_library.then(() => {
            const selector = this.shadowRoot?.getElementById("selector");
            selector.replaceChildren();
        });
    }
}
customElements.define("wam-wamstudio-pedalboard2", Pedalboard2GUI);
