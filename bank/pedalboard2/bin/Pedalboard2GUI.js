import { PresetManager } from "./Gui/PresetManager.js";
import { importPedalboard2Library, resolvePedalboard2Library } from "./Pedalboard2Library.js";
import { adoc, doc, replaceInTemplate } from "./Utils/dom.js";
import { setupPannelMenus } from "./Utils/gui.js";
import { Observable } from "./Utils/observable.js";
import { prettyfy, standardize } from "./Utils/strings.js";
// Michel Buffa : I'm not sure what this does, but it seems to be a way to get the URL of the CSS file, had to change
// so that it works with the new version of typescript that redefined import.meta and did not provide resolve method
const baseUrl = new URL(import.meta.url);
// Resolve the relative path to "style.css"
const styleCSSURL = new URL('../style.css', baseUrl).href;
console.log("### host.js base URL = " + baseUrl + " styleCSSURL ### + " + styleCSSURL);
const template = doc /*html*/ `
    <link rel="stylesheet" href="${styleCSSURL}">
    <h1>Pedalboard 2</h1>
    <div id="loading-state"></div>
    <div id="loading-message">Loading</div>
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
    <div id="presets" class="repository"></div>
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
    preset_manager;
    constructor(module) {
        super();
        this.module = module;
        this.node = module.audioNode;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.replaceChildren(template.cloneNode(true));
        // Subelements
        this.preset_manager = new PresetManager(this.module.audioNode, promise => this.executePromise(promise));
        // Sub elements
        replaceInTemplate(this.shadowRoot.getElementById("presets"), this.preset_manager);
        // Register update handlers
        this.wam_chain_link = this.node.childs.link(this.initWAM.bind(this), this.closeWAM.bind(this));
        this.library_link = this.node.library.link(library => this.initLibrary(library), library => this.closeLibrary(library));
        // Handle pannel selectors
        if (this.shadowRoot)
            setupPannelMenus(this.shadowRoot);
        // Drag n drop on first wall
        const wall = this.shadowRoot.querySelector("._wall");
        wall.addEventListener("dragenter", (event) => wall.after(dropMarkerTemplate.cloneNode(true)));
        wall.addEventListener("dragleave", (event) => wall.nextElementSibling?.remove());
        wall.addEventListener("dragover", (event) => event.preventDefault());
        wall.addEventListener("drop", (event) => {
            wall.nextElementSibling?.remove();
            // Get child
            const dropInstanceID = event.dataTransfer?.getData("text/plain");
            if (!dropInstanceID)
                return;
            const dropChild = this.node.childs.find(it => it.wam.instanceId == dropInstanceID);
            if (!dropChild)
                return;
            // Remove
            this.node.removeChild(dropChild);
            // Add
            this.node.addChild(dropChild, 0);
        });
        // Handle library input
        this.library_input = this.shadowRoot.getElementById("library-input");
        this.library_input.addEventListener("change", () => this.executePromise(async () => {
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
                throw err;
            }
            finally {
                this.library_input.disabled = false;
            }
        }));
        // Handle category selector
        const category_selector = this.shadowRoot.getElementById("category_selector");
        category_selector.addEventListener("change", () => {
            if (category_selector.value == "")
                this.plugin_category.value = null;
            else
                this.plugin_category.value = category_selector.value;
        });
        this.category_link = this.plugin_category.on_set.add(category => this.initPluginSelector(category));
    }
    connectedCallback() { }
    disconnectedCallback() { }
    dispose() {
        if (this.wam_chain_link)
            this.node.childs.unlink(this.wam_chain_link);
        if (this.library_link)
            this.node.library.unlink(this.library_link);
        if (this.category_link)
            this.plugin_category.on_set.delete(this.category_link);
        this.preset_manager.dispose();
    }
    //// WAM CHAINS : the inner WAMs GUIs ////
    /** Associate the wams to their guis */
    _child_to_gui = new Map();
    /** Called for each wam in the wam chain for initialization */
    initWAM(child, index) {
        this.executePromise(async () => {
            const { wam, descriptor } = child;
            // Add window
            const modules = this.shadowRoot?.getElementById("modules");
            const window = moduleTemplate.cloneNode(true);
            modules.insertBefore(window, modules.children[index + 1]);
            // Set title name
            window.querySelector("._name").textContent = descriptor.name;
            // Set content
            try {
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
                    this.node.destroyChild(child);
                });
                // Start dragging
                window.addEventListener("dragstart", (event) => {
                    event.dataTransfer?.setDragImage(window, 0, 0);
                    event.dataTransfer?.setData("text/plain", child.wam.instanceId);
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
                    const dropChild = this.node.childs.find(it => it.wam.instanceId == dropInstanceID);
                    if (!dropChild || dropChild === child)
                        return;
                    // Remove
                    this.node.removeChild(dropChild);
                    // Add
                    const index = this.node.childs.indexOf(child) + 1;
                    this.node.addChild(dropChild, index);
                });
                this._child_to_gui.set(child, [window, gui]);
            }
            catch (err) {
                window.remove();
                this.node.destroyChild(child);
                throw err;
            }
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
            const { wam, descriptor } = child;
            window.remove();
            wam.destroyGui(gui);
        });
    }
    //// WAM LIBRARY : the list of available WAMs ////
    category_to_plugins = {};
    initLibrary(library) {
        this.executePromise(async () => {
            this.library_input.value = library?.descriptor?.url ?? "";
            if (!library)
                return;
            // Category selector
            {
                // Fetch categories
                const categories_map = {};
                this.category_to_plugins = {};
                for (const { descriptor } of Object.values(library.plugins)) {
                    const keywords = [...descriptor.keywords];
                    // Additional keywords
                    if (descriptor.keywords)
                        keywords.push(descriptor.vendor);
                    if (descriptor.isInstrument)
                        keywords.push("instrument");
                    for (const keyword of keywords) {
                        const normalized = standardize(keyword);
                        const name = prettyfy(keyword);
                        if (categories_map[normalized] === undefined)
                            categories_map[normalized] = { count: 0, name };
                        categories_map[normalized].count++;
                        if (!this.category_to_plugins[normalized])
                            this.category_to_plugins[normalized] = [];
                        this.category_to_plugins[normalized].push(descriptor.identifier);
                    }
                }
                const categories = Object.entries(categories_map)
                    .filter(it => it[1].count > 1)
                    .map(it => ({ ...it[1], normalized: it[0] }))
                    .sort((a, b) => a.name.localeCompare(b.name));
                const category_selector = this.shadowRoot?.getElementById("category_selector");
                category_selector.replaceChildren();
                category_selector.appendChild(adoc `<option value="">All</option>`);
                for (const category of categories) {
                    const option = adoc `<option value="${category.normalized}">${category.name}</option>`;
                    category_selector.appendChild(option);
                }
            }
            this.plugin_category.value = null;
        });
    }
    //// PLUGINS : the list of available WAMs ////
    plugin_category = new Observable(null);
    initPluginSelector(category) {
        this.executePromise(async () => {
            const selector = this.shadowRoot?.getElementById("selector");
            selector.replaceChildren();
            // Plugin Selector
            const ids = category ? this.category_to_plugins[category] : Object.keys(this.node.library.value?.plugins ?? {});
            for (const identifier of ids) {
                const pluginInfo = this.node.library.value?.plugins[identifier];
                if (!pluginInfo)
                    continue;
                const { descriptor, classURL } = pluginInfo;
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
                thumbnail.addEventListener("click", () => this.executePromise(async () => {
                    const wam = await this.node.createChildWAM(descriptor.identifier);
                    if (wam == null)
                        throw Error("Failed to create WAM");
                    this.node.addChild(wam);
                }));
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
        const loading_state = this.shadowRoot.getElementById("loading-state");
        const loading_message = this.shadowRoot.getElementById("loading-message");
        this.promiseChain = this.promiseChain.then(async () => {
            loading_state.className = "loading";
            loading_state.title = "Loading...";
            loading_message.textContent = "Loading...";
            try {
                const ret = await promise();
                loading_state.className = "ok";
                loading_state.title = "Success!";
                loading_message.textContent = "Success!";
                return ret;
            }
            catch (e) {
                loading_state.className = "error";
                loading_state.title = e.message ?? "An error occured";
                loading_message.textContent = e.message ?? "An error occured";
                if ("stack" in e) {
                    console.error(e.message);
                    console.error(e.stack);
                }
                return Promise.resolve();
            }
        });
    }
}
customElements.define("wam-wamstudio-pedalboard2", Pedalboard2GUI);
