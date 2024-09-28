import { adoc, doc, selector } from "../Utils/dom.js";
import { selectWithClass } from "../Utils/gui.js";
import { Observable } from "../Utils/observable.js";
import { prettyfy, standardize } from "../Utils/strings.js";
const template = doc `
    <ul class="_directories"></ul>
    <ul class="_files"></ul>
    <div class="_content"></div>
`;
export class PresetManager extends HTMLElement {
    node;
    executer;
    /**
     * @param node The node of the Pedalboard2
     * @param executer A execute to execute async loading function
     */
    constructor(node, executer) {
        super();
        this.node = node;
        this.executer = executer;
        this.replaceChildren(template.cloneNode(true));
        this._library_link = this.node.library.link(this.initLibrary.bind(this), this.closeLibrary.bind(this));
    }
    //// OBSERVABLES ////
    _selected_group = new Observable(null);
    selected_group = this._selected_group.readonly;
    _selected_preset = new Observable(null);
    selected_preset = this._selected_preset.readonly;
    //// INIT DESTROY ////
    _library_link;
    dispose() {
        this.node.library.unlink(this._library_link);
    }
    /** Called when start using a library */
    initLibrary(library) {
        console.log("Change library in presets");
        this.refreshPresets();
    }
    /** Called when stop using a library */
    closeLibrary(library) {
    }
    /** Recreate the preset repository */
    refreshPresets() {
        console.log("aaa", this.node.library.value?.descriptor?.name);
        const groupGUIs = this.querySelector(":scope>._directories");
        const presetGUIs = this.querySelector(":scope>._files");
        const presetDesc = this.querySelector(":scope>._content");
        const repository = this.getAllPresets();
        console.log("groupguis", repository, groupGUIs);
        // Create groups
        groupGUIs.replaceChildren();
        presetGUIs.replaceChildren();
        presetDesc.replaceChildren();
        for (const [groupName, { isBuiltin, content }] of Object.entries(repository).sort((a, b) => a[0].localeCompare(b[0]))) {
            // Group name
            const groupGUI = adoc `<li value="${groupName}">${groupName}</li>`;
            groupGUIs.appendChild(groupGUI);
            console.log("groupgui", groupGUIs.outerHTML);
            groupGUI.classList.toggle("_default", isBuiltin);
            if (!isBuiltin) {
                // On Remove
                groupGUI.appendChild(adoc `<a>❌</a>`).addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.editStorage(storage => delete storage[groupName]);
                });
            }
            // On selection
            groupGUI.addEventListener("click", () => {
                if (groupGUI.classList.contains("_selected"))
                    return;
                selectWithClass(groupGUI, "_selected");
                this._selected_group.value = groupName;
                presetDesc.replaceChildren();
                // Create presets
                presetGUIs.replaceChildren();
                for (const [name, desc] of Object.entries(content).sort((a, b) => a[0].localeCompare(b[0]))) {
                    const presetGUI = adoc `<li value="${name}">${name}</li>`;
                    presetGUIs.appendChild(presetGUI);
                    presetGUI.classList.toggle("_default", desc.isBuiltin);
                    // On remove
                    if (!desc.isBuiltin) {
                        // On Remove
                        presetGUI.appendChild(adoc `<a>❌</a>`).addEventListener("click", (e) => {
                            e.stopPropagation();
                            this.editStorage(storage => delete storage[groupName].content[name]);
                        });
                    }
                    // On select
                    presetGUI.addEventListener("click", () => {
                        if (presetGUI.classList.contains("_selected"))
                            return;
                        selectWithClass(presetGUI, "_selected");
                        this._selected_preset.value = name;
                        // Set description
                        presetDesc.replaceChildren();
                        presetDesc.appendChild(adoc `<a>Load</a>`)
                            .addEventListener("click", () => this.executer(async () => {
                            const ret = await this.node.setState(desc.state);
                            if (this.node.libraryError == null)
                                return ret;
                            else
                                throw this.node.libraryError;
                        }));
                        presetDesc.appendChild(adoc `<h2>${name}</h2>`);
                        presetDesc.appendChild(adoc `<p>${desc.description}</p>`);
                    });
                }
                // New Preset input
                const newPresetInput = adoc `<input placeholder="New preset name">`;
                newPresetInput.addEventListener("keyup", (e) => {
                    const name = newPresetInput.value.trim();
                    if (e.key == "Enter" && name.length > 0)
                        this.executer(async () => {
                            const library_name = this.node.library.value?.descriptor?.name ?? "No Library";
                            const state = await this.node.getState();
                            this.editStorage(storage => {
                                storage[groupName] ??= { content: {} };
                                storage[groupName].content[newPresetInput.value] = {
                                    state,
                                    description: `
                                Using \"${library_name}\"
                                , a chain of ${[...this.node.childs].map(node => node.descriptor.name).join(" -> ")}
                                `
                                };
                            });
                        });
                });
                presetGUIs.appendChild(newPresetInput);
            });
        }
        // New Group input
        const newGroupInput = adoc `<input placeholder="New group name">`;
        newGroupInput.addEventListener("keyup", (e) => {
            const name = prettyfy(newGroupInput.value);
            if (e.key == "Enter" && name.length > 0)
                this.editStorage(storage => {
                    if (!storage[name])
                        storage[name] = { content: {} };
                });
        });
        groupGUIs.appendChild(newGroupInput);
        // Reselect group
        if (this.selected_group.value) {
            const group = selector `:scope > *[value="${this.selected_group.value}"]`.query(groupGUIs);
            if (group) {
                group.click();
                if (this.selected_preset.value) {
                    const preset = selector `:scope > *[value="${this.selected_preset.value}"]`.query(group);
                    if (preset)
                        preset.click();
                    else
                        this._selected_preset.value = null;
                }
            }
            else {
                this._selected_group.value = null;
                this._selected_preset.value = null;
            }
        }
    }
    /** Get all the saved and builtin presets as one library */
    getAllPresets() {
        const ret = {};
        const nameMap = {}; // Helping with duplicates using normalized and prettified names
        const getCommonName = (name) => nameMap[standardize(name)] ??= prettyfy(name);
        // Get saved presets
        const storage = this.getStorage();
        for (const [categoryName, group] of Object.entries(storage)) {
            const commonName = getCommonName(categoryName);
            ret[commonName] ??= { isBuiltin: false, content: {} };
            for (const [name, preset] of Object.entries(group.content)) {
                ret[commonName].content[name] = {
                    state: preset.state,
                    group: categoryName,
                    description: preset.description,
                    isBuiltin: false
                };
            }
        }
        // Get builtin presets
        for (const [groupName, group] of Object.entries(this.node.library?.value?.presets ?? {})) {
            const commonName = getCommonName(groupName);
            ret[commonName] ??= { isBuiltin: true, content: {} };
            ret[commonName].isBuiltin = true;
            for (const [name, preset] of Object.entries(group)) {
                if (ret[commonName].content[name])
                    continue;
                ret[commonName].content[name] = {
                    state: preset.state,
                    description: preset.description,
                    group: groupName,
                    isBuiltin: true
                };
            }
        }
        return ret;
    }
    getStorage() {
        const storage = localStorage.getItem("wamstudio.pedalboard2.presets");
        return storage ? JSON.parse(storage) : {};
    }
    setStorage(storage) {
        localStorage.setItem("wamstudio.pedalboard2.presets", JSON.stringify(storage));
        this.refreshPresets();
    }
    editStorage(fn) {
        const storage = this.getStorage();
        fn(storage);
        this.setStorage(storage);
    }
}
customElements.define("wamstudio-pedalboard2-preset-manager", PresetManager);
