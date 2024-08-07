import { importPedalboard2Library, resolvePedalboard2Library } from "./Pedalboard2Library.js";
import { adoc, doc } from "./Utils/dom.js";
import { selectWithClass, setupPannelMenus } from "./Utils/gui.js";
import { Observable } from "./Utils/observable.js";
const template = doc /*html*/ `
    <link rel="stylesheet" href="${import.meta.resolve("./style.css")}">
    <h1>Pedalboard 2</h1>
    <div class="pannel">
        <div class="_button _selected" --data-target="plugin_selector">Plugins</div>
        <div class="_button" --data-target="presets">Presets</div>
        <div class="_button" --data-target="settings">Settings</div>
    </div>
    <div id="plugin_selector">
        <select id="category_selector">
        </select>
        <div id="selector"></div>
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
    <div id="settings">
        <label>Library URL</label>
        <input id="library-input" type="text"/>
        <input id="library-input-output" type="text" disabled="disabled"/>
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
    library_input;
    wam_chain_link;
    library_link;
    category_link;
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
        if (this.shadowRoot)
            setupPannelMenus(this.shadowRoot);
        // Drag n drop on first wall
        const wall = this.shadowRoot?.querySelector("._wall");
        wall.addEventListener("dragenter", (event) => wall.after(dropMarkerTemplate.cloneNode(true)));
        wall.addEventListener("dragleave", (event) => wall.nextElementSibling?.remove());
        wall.addEventListener("dragover", (event) => event.preventDefault());
        wall.addEventListener("drop", (event) => {
            wall.nextElementSibling?.remove();
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
            this.node.addChild(dropChild, 0);
        });
        // Handle library input
        this.library_input = this.shadowRoot?.getElementById("library-input");
        this.library_input.addEventListener("change", async () => {
            console.log("Loading library", this.library_input.value);
            const error = this.shadowRoot?.getElementById("library-input-output");
            error.value = "Loading...";
            error.className = "";
            this.library_input.disabled = true;
            try {
                const descriptor = await importPedalboard2Library(this.library_input.value);
                const library = await resolvePedalboard2Library(descriptor);
                this.node.library.value = library;
                error.value = "Loaded!";
                error.className = "success";
            }
            catch (err) {
                error.value = err.message;
                error.className = "error";
            }
            this.library_input.disabled = false;
        });
        // Handle category selector
        const category_selector = this.shadowRoot?.getElementById("category_selector");
        category_selector.addEventListener("change", () => {
            if (category_selector.value == "")
                this.plugin_category.value = null;
            else
                this.plugin_category.value = category_selector.value;
        });
        this.category_link = this.plugin_category.on_set.add(category => this.initSelector(category));
    }
    disconnectedCallback() {
        if (this.wam_chain_link)
            this.node.childs.unlink(this.wam_chain_link);
        if (this.library_link)
            this.node.library.unlink(this.library_link);
        if (this.category_link)
            this.plugin_category.on_set.delete(this.category_link);
    }
    //// WAM CHAINS : the inner WAMs GUIs ////
    /** Associate the wams to their guis */
    _child_to_gui = new Map();
    /** Called for each wam in the wam chain for initialization */
    initWAM(child, index) {
        this.executePromise(async () => {
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
            window.addEventListener("dragenter", (event) => window.after(dropMarkerTemplate.cloneNode(true)));
            window.addEventListener("dragleave", (event) => window.nextElementSibling?.remove());
            window.addEventListener("dragover", (event) => event.preventDefault());
            window.addEventListener("drop", (event) => {
                window.nextElementSibling?.remove();
                // Get child
                const dropInstanceID = event.dataTransfer?.getData("text/plain");
                if (!dropInstanceID)
                    return;
                const dropChild = this.node.childs.find(it => it[0].instanceId == dropInstanceID);
                if (!dropChild || dropChild === child)
                    return;
                // Remove
                this.node.removeChild(dropChild);
                // Add
                const index = this.node.childs.indexOf(child) + 1;
                this.node.addChild(dropChild, index);
            });
            this._child_to_gui.set(child, [window, gui]);
        });
    }
    /** Called for each wam in the wam chain for destruction */
    closeWAM(child, index) {
        // Wait for guis to be intialized
        this.executePromise(async () => {
            const elements = this._child_to_gui.get(child);
            if (!elements)
                return;
            const [window, gui] = elements;
            const [wam, descriptor] = child;
            window.remove();
            wam.destroyGui(gui);
        });
    }
    //// WAM LIBRARY : the list of available WAMs ////
    initLibrary(library) {
        this.executePromise(async () => {
            console.log("aa", library);
            this.library_input.value = library?.descriptor?.url ?? "";
            // Setup
            const preset_repo = this.shadowRoot?.getElementById("presets");
            const preset_dir = preset_repo.querySelector(":scope>._directories");
            const preset_file = preset_repo.querySelector(":scope>._files");
            const preset_desc = preset_repo.querySelector(":scope>._content");
            // Cleanup
            preset_dir.replaceChildren();
            preset_file.replaceChildren();
            preset_desc.replaceChildren();
            if (!library)
                return;
            // Category selector
            {
                // Fetch categories
                const categories = new Set();
                for (const { descriptor } of Object.values(library.plugins)) {
                    for (const keyword of descriptor.keywords) {
                        categories.add(keyword);
                    }
                }
                const category_selector = this.shadowRoot?.getElementById("category_selector");
                category_selector.replaceChildren();
                category_selector.appendChild(adoc `<option value="">All</option>`);
                for (const category of categories) {
                    const option = adoc `<option value="${category}">${category}</option>`;
                    category_selector.appendChild(option);
                }
            }
            this.plugin_category.value = null;
            // Presets Directory
            // Create categories
            for (const [key, presets] of Object.entries(library.presets)) {
                const category = adoc `<li>${key}</li>`;
                preset_dir.appendChild(category);
                category.addEventListener("click", () => {
                    selectWithClass(category, "_selected");
                    preset_desc.replaceChildren();
                    // Create presets
                    preset_file.replaceChildren();
                    for (const [name, desc] of Object.entries(presets)) {
                        const file = adoc `<li>${name}</li>`;
                        preset_file.appendChild(file);
                        file.addEventListener("click", () => {
                            selectWithClass(file, "_selected");
                            // Set description
                            preset_desc.replaceChildren();
                            preset_desc.appendChild(adoc /*html*/ `<a>Load</a>`)
                                .addEventListener("click", () => {
                                this.executePromise(async () => await this.node.setState(desc.state));
                            });
                            preset_desc.appendChild(adoc `<h2>${name}</h2>`);
                            preset_desc.appendChild(adoc `<p>${desc.description}</p>`);
                        });
                    }
                });
            }
        });
    }
    //// PLUGINS : the list of available WAMs ////
    plugin_category = new Observable(null);
    initSelector(category) {
        this.executePromise(async () => {
            const selector = this.shadowRoot?.getElementById("selector");
            selector.replaceChildren();
            // Plugin Selector
            for (const { descriptor, classURL } of Object.values(this.node.library.value?.plugins ?? {})) {
                if (category && !descriptor.keywords.includes(category))
                    continue;
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
        this.executePromise(async () => {
            const selector = this.shadowRoot?.getElementById("selector");
            selector.replaceChildren();
        });
    }
    promiseChain = Promise.resolve();
    executePromise(promise) {
        this.promiseChain = this.promiseChain.then(promise);
    }
}
customElements.define("wam-wamstudio-pedalboard2", Pedalboard2GUI);
