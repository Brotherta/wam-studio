import { adoc, doc } from "./Utils/dom.js";
const template = doc /*html*/ `
    <link rel="stylesheet" href="${import.meta.resolve("./style.css")}">
    <h1>Pedalboard 2</h1>
    <div class="pannel">
        <div class="_button" --data-target="selector">Plugins</div>
        <div class="_button _selected" --data-target="presets">Presets</div>
        <div class="_button">Macros</div>
        <div class="_button">Settings</div>
    </div>
    <div id="selector">
    </div>
    <div id="presets" class="repository">
        <ul class="_directories">
            <li class="_selected">All</li>
            <li>Favorites</li>
            <li>Recent</li>
            <li>User</li>
            <li>User</li>
            <li>User</li>
            <li>User</li>
            <li>User</li>
        </ul>
        <ul class="_files">
            <li class="_selected">Preset 1</li>
            <li>Preset 2</li>
            <li>Preset 3</li>
            <li class="_default">Preset 4 </li>
        </ul>
        <div class="_content">
            <a>Load</a>
            <h2>Tarte</h2>
            <p>Les tartes sont des gâteaux plats, cuits au four, composés d'une pâte et d'une garniture sucrée ou salée. Les tartes salées sont souvent servies en entrée ou en plat principal, tandis que les tartes sucrées sont servies en dessert.</p>
        </div>
    </div>
    <div id="modules">
        <div class="_wall">
            <i class="_connection _output _audio"></i>
            <i class="_connection _output _midi"></i>
        </div>
        <div class="_wall">
            <i class="_connection _input _audio"></i>
            <!-- <i class="_connection _input _midi"></i> -->
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
        // Register update handlers
        this.wam_chain_link = this.node.childs.link(this.initWAM.bind(this), this.closeWAM.bind(this));
        this.library_link = this.node.library.link(library => this.initLibrary(library), library => this.closeLibrary(library));
        // Handle pannel selectors
        const pannels = this.shadowRoot?.querySelectorAll(".pannel") ?? [];
        for (const pannel of pannels) {
            // Get buttons
            const buttons = pannel.querySelectorAll(":scope>._button");
            for (const button of buttons) {
                // Get target
                const target = this.shadowRoot?.getElementById(button.getAttribute("--data-target") ?? "__nothing__");
                // Set button
                button.addEventListener("click", () => {
                    for (const b of buttons) {
                        const tohide = this.shadowRoot?.getElementById(b.getAttribute("--data-target") ?? "__nothing__");
                        b.classList.remove("_selected");
                        if (tohide)
                            tohide.classList.add("hidden");
                    }
                    button.classList.add("_selected");
                    if (target)
                        target.classList.remove("hidden");
                });
                // Hide by default
                if (target && !button.classList.contains("_selected"))
                    target.classList.add("hidden");
            }
        }
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
            //if(wam.descriptor.hasMidiOutput)
            //    window.appendChild(adoc/*html*/`<i class="_connection _output _midi"></i>`)
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
            // Setup
            const selector = this.shadowRoot?.getElementById("selector");
            const preset_repo = this.shadowRoot?.getElementById("presets");
            const preset_dir = preset_repo.querySelector(":scope>._directories");
            const preset_file = preset_repo.querySelector(":scope>._files");
            const preset_desc = preset_repo.querySelector(":scope>._content");
            // Cleanup
            selector.replaceChildren();
            preset_dir.replaceChildren();
            preset_file.replaceChildren();
            preset_desc.replaceChildren();
            if (!library)
                return;
            // Plugin Selector
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
            // Presets Directory
            // Create categories
            for (const [key, presets] of Object.entries(library.presets)) {
                const category = adoc `<li>${key}</li>`;
                preset_dir.appendChild(category);
                category.addEventListener("click", () => {
                    for (const it of preset_dir.children)
                        it.classList.remove("_selected");
                    category.classList.add("_selected");
                    preset_desc.replaceChildren();
                    // Create presets
                    preset_file.replaceChildren();
                    for (const [name, desc] of Object.entries(presets)) {
                        const file = adoc `<li>${name}</li>`;
                        preset_file.appendChild(file);
                        file.addEventListener("click", () => {
                            for (const it of preset_file.children)
                                it.classList.remove("_selected");
                            file.classList.add("_selected");
                            // Set description
                            preset_desc.replaceChildren();
                            preset_desc.appendChild(adoc /*html*/ `<a>Load</a>`)
                                .addEventListener("click", () => {
                                this._wait_for_library = this._wait_for_library.then(async () => await this.node.setState(desc.state));
                            });
                            preset_desc.appendChild(adoc `<h2>${name}</h2>`);
                            preset_desc.appendChild(adoc `<p>${desc.description}</p>`);
                        });
                    }
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
