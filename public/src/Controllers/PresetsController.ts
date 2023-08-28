import App from "../App";
import {SongTagEnum} from "../Utils/SongTagEnum";
import Preset from "../Models/Preset";
import Track from "../Models/Track";
import BindControl from "../Models/BindControl";
import {verifyString} from "../Utils/Normalizer";
import {WamParameterInfoMap} from "@webaudiomodules/api";
import {BACKEND_URL} from "../Env";
import Bind from "../Models/Bind";
import Parameter from "../Models/Parameter";

export default class PresetsController {

    app: App;
    presets: Map<SongTagEnum, Preset[]>
    presetsSet = new Set<string>();

    copiedPreset: Preset | undefined;

    constructor(app: App) {
        this.app = app;
        this.presets = new Map<SongTagEnum, Preset[]>();

        this.getPresets();
    }

    getPresets() {
        for (let tag of Object.values(SongTagEnum)) {
            let defaultPreset = new Preset("Default");
            let presets = [defaultPreset];
            this.presets.set(tag, presets);
        }


        fetch(BACKEND_URL+ "/presets", {
            method: "GET"
        }).then(async (response) => {
            if (response.ok) {
                let data = await response.json()
                for (let item of data) {
                    let tag = item.tag;
                    let presets = item.presets;
                    for (let preset of presets) {
                        let newPreset = new Preset(preset.name);
                        newPreset.pluginState = preset.pluginState;

                        let binds = [];
                        for (let bind of preset.binds) {
                            let newBind = new Bind(bind.name);
                            for (let param of bind.parameters) {
                                let newParam = new Parameter(param.parameterName, param.max, param.min, param.discreteStep);
                                newParam.currentMax = param.currentMax;
                                newParam.currentMin = param.currentMin;
                                newBind.parameters.push(newParam);
                            }
                            newBind.currentValue = bind.currentValue;
                            binds.push(newBind);
                        }

                        newPreset.binds = binds;
                        this.addPreset(newPreset, tag);
                    }
                }
                this.presetsSet.add("Default");
            }
        });
    }

    /**
     * Synchronises the presets to the server. It will ignore the Default Presets.
     * Get all plugin state of each preset and each parameter of each bind.
     */
    syncPresets() {
        if (!this.app.projectController.isLogged) {
            alert("You need to be logged in to save your presets.");
            return;
        }

        let data = [];

        for (let tag of Object.values(SongTagEnum)) {
            let presets = this.presets.get(tag)!;

            let presetsObject = [];
            for (let preset of presets) {
                if (preset.name == "Default") {
                    continue;
                }

                let bindsObject = [];
                for (let bind of preset.binds) {

                    let parametersObject = [];
                    for (let param of bind.parameters) {
                        parametersObject.push({
                            "parameterName": param.parameterName,
                            "max": param.max,
                            "min": param.min,
                            "currentMax": param.currentMax,
                            "currentMin": param.currentMin,
                            "discreteStep": param.discreteStep
                        });
                    }
                    bindsObject.push({
                        "name": bind.name,
                        "currentValue": bind.currentValue,
                        "parameters": parametersObject
                    });
                }

                presetsObject.push({
                    "name": preset.name,
                    "pluginState": preset.pluginState,
                    "binds": bindsObject
                });
            }
            data.push({tag: tag, presets: presetsObject});
        }

        fetch(BACKEND_URL + "/presets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data)
        }).then(async (response) => {
            if (response.ok) {
                let data = await response.json()
                console.log(data);
                alert("Presets successfully synced.");
            }
            else {
                console.error("An error occurred in the process of syncing the presets.");
            }
        });
    }

    addPreset(preset: Preset, tag: SongTagEnum) {
        let presets = this.presets.get(tag)!;
        if (presets.includes(preset)) {
            presets.splice(presets.indexOf(preset), 1);
        }
        this.presets.get(tag)?.push(preset);
    }

    removePreset(preset: Preset, tag: SongTagEnum) {
        let presets = this.presets.get(tag)!;
        const index = presets.indexOf(preset);
        if (index != undefined && index > -1) {
            presets.splice(index, 1);
            this.presets.set(tag, presets);
        }
    }

    getPresetByTag(tag: SongTagEnum) {
        return this.presets.get(tag);
    }

    async changePreset(bindControl: BindControl, track: Track) {
        let presetName = bindControl.advElement.presetsSelect.value;
        let preset = this.presets.get(track.tag)?.find(p => p.name == presetName);
        if (!preset) return;

        await this.app.bindsController.deleteAllBinds(track);

        // @ts-ignore
        await track.plugin.instance!._audioNode.resetState();
        // @ts-ignore
        track.plugin.instance!.id = 0;

        if (preset.name !== "Default") {
            await track.plugin.setStateAsync(preset.pluginState);
            let paramInfo = await track.plugin.instance?._audioNode.getParameterInfo();

            if (!paramInfo) {
                console.error("Could not get parameter info");
                return;
            }

            for (let bindPreset of preset.binds) {
                let bind = await this.app.bindsController.createBind(track, bindPreset.name, bindPreset.currentValue);

                for (let paramPreset of bindPreset.parameters) {
                    let parameterEl = await this.app.bindsController.createParameter(track, bind!.name);
                    parameterEl!.refreshParam(paramInfo);
                    await this.app.bindsController.updateParameter(track, bind!, parameterEl!, paramPreset);
                }
                await this.app.bindsController.updateBindValue(track, bind!, bindPreset.currentValue);
            }
            await this.app.bindsController.selectBind(track);
        }
    }

    /**
     * Save the preset in the presets list.
     * If a preset with the same name already exists, it will be replaced.
     * If the preset name is "Default", it will not be saved.
     * If the preset name is empty, it will not be saved.
     *
     * @param bindControl
     * @param track
     */
    async savePreset(bindControl: BindControl, track: Track) {
        let presetName = bindControl.advElement.presetName.value;
        if (!verifyString(presetName)) return;
        if (presetName == "Default") {
            alert("You can't replace the default preset !");
            return;
        }
        let preset = new Preset(presetName);
        let tag = track.tag;

        let existing = this.presets.get(tag)?.find(p => p.name == presetName);
        if (existing) {
            if (!confirm("A preset with this name already exists. Do you want to replace it?")) return;
            this.removePreset(existing, tag);
        }
        for (let bind of bindControl.binds) {
            let newBind = bind.clone();
            console.log("saving preset", newBind);
            preset.addBind(newBind);
        }

        preset.pluginState = await track.plugin.instance!._audioNode.getState();
        this.addPreset(preset, tag);
        this.refreshPresetList(tag);
        bindControl.advElement.selectPreset(preset.name);
    }

    /**
     * Delete the preset with the given name.
     *
     * @param bindControl
     * @param track
     */
    async deletePreset(bindControl: BindControl, track: Track) {
        let presetName = bindControl.advElement.presetName.value;
        if (!verifyString(presetName)) return;
        if (presetName == "Default") {
            alert("You can't delete the default preset !");
            return;
        }
        let presetsArray = this.presets.get(track.tag)!;
        let preset = presetsArray.find(p => p.name == presetName);
        if (!preset) return;
        if (!confirm("Are you sure you want to delete this preset?")) return;
        this.removePreset(preset, track.tag);
        this.refreshPresetList(track.tag);

        for (let track of this.app.tracksController.trackList) {
            let bindControl = track.bindControl;
            if (bindControl.tag != track.tag) continue;
            if (bindControl.advElement.presetsSelect.value == presetName) {
                bindControl.advElement.selectPreset("Default");
            }
            await this.changePreset(bindControl, track);
        }
    }

    async copyPreset(bindControl: BindControl, track: Track) {
        let presetName = bindControl.advElement.presetsSelect.value;
        if (presetName !== "Default" && presetName) {
            let preset = new Preset(presetName);

            for (let bind of bindControl.binds) {
                let newBind = bind.clone();
                console.log("saving preset", newBind);
                preset.addBind(newBind);
            }

            preset.pluginState = await track.plugin.instance!._audioNode.getState();
            this.copiedPreset = preset;
        }
    }

    async pastePreset(bindControl: BindControl, track: Track) {
        let tag = track.tag;

        let preset = this.copiedPreset
        if (!preset) return;
        let existing = this.presets.get(tag)?.find(p => p.name == preset?.name);
        if (existing) {
            if (!confirm("A preset with this name already exists. Do you want to replace it?")) return;
            this.removePreset(existing, tag);
        }
        this.addPreset(preset, tag);
        this.refreshPresetList(tag);
        bindControl.advElement.selectPreset(preset.name);
        bindControl.advElement.presetName.value = preset.name;
        await this.changePreset(bindControl, track);
    }

    /**
     * Refresh the preset list of all the tracks with the given tag.
     * @param tag
     */
    refreshPresetList(tag: SongTagEnum) {
        for (let track of this.app.tracksController.trackList) {
            let bindControl = track.bindControl;
            if (!bindControl || bindControl.tag != tag) continue;

            let presets = this.presets.get(tag)!;
            bindControl.advElement.refreshPresetsOptions(presets);
            bindControl.trackBindElement.refreshPresetsOptions(presets);

            for (let preset of presets) {
                this.presetsSet.add(preset.name);
            }
        }
    }

    /**
     * Add the preset to the preset list.
     *
     */
    updateGlobalPresetList() {
        this.app.hostView.presetsDropdown.innerHTML = "";

        for (let presetString of this.presetsSet) {

            let a = document.createElement("a");
            a.innerText = presetString;
            a.classList.add("dropdown-item");

            a.addEventListener("click", async () => {
                for (let track of this.app.tracksController.trackList) {
                    let bindControl = track.bindControl;
                    let tag = track.tag;
                    let preset = this.getPresetByTag(tag)?.find(p => p.name == presetString);
                    if (preset) {
                        track.bindControl.advElement.selectPreset(preset.name);
                        track.bindControl.trackBindElement.selectPresets(preset.name);
                        await this.changePreset(bindControl, track);
                    }
                }
            });

            this.app.hostView.presetsDropdown.appendChild(a);
        }
    }
}