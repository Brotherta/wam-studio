import App from "../App";
import {SongTagEnum} from "../Utils/SongTagEnum";
import Preset from "../Models/Preset";
import Track from "../Models/Track";
import BindControl from "../Models/BindControl";
import {verifyString} from "../Utils/Normalizer";
import {param} from "jquery";
import {WamParameterInfoMap} from "@webaudiomodules/api";

export default class PresetsController {

    app: App;
    presets: Map<SongTagEnum, Preset[]>

    constructor(app: App) {
        this.app = app;
        this.presets = new Map<SongTagEnum, Preset[]>();
        for (let tag of Object.values(SongTagEnum)) {
            let defaultPreset = new Preset("Default");
            let presets = [defaultPreset];
            this.presets.set(tag, presets);
        }
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
            await track.plugin.instance!._audioNode.setState(preset.pluginState);
            let testState = await track.plugin.instance!._audioNode.getState();

            let readyPromise = new Promise<WamParameterInfoMap>((resolve) => {
               let interval = setInterval(async () => {
                   if (testState.current.length === preset!.pluginState.current.length) {
                       let paramInfo = await track.plugin.instance!._audioNode.getParameterInfo();
                       clearInterval(interval);
                       resolve(paramInfo);
                   }
                   testState = await track.plugin.instance!._audioNode.getState();
               }, 100);
            });
            let paramInfo = await readyPromise;


            for (let bindPreset of preset.binds) {
                let bind = await this.app.bindsController.createBind(track, bindPreset.name);

                for (let paramPreset of bindPreset.parameters) {
                    let parameterEl = await this.app.bindsController.createParameter(track, bind!.name);
                    parameterEl!.refreshParam(paramInfo);
                    await this.app.bindsController.updateParameter(track, bind!, parameterEl!, paramPreset);
                }
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

        for (let track of this.app.tracks.trackList) {
            let bindControl = track.bindControl;
            if (bindControl.tag != track.tag) continue;
            if (bindControl.advElement.presetsSelect.value == presetName) {
                bindControl.advElement.selectPreset("Default");
            }
            await this.changePreset(bindControl, track);
        }
    }

    /**
     * Refresh the preset list of all the tracks with the given tag.
     * @param tag
     */
    refreshPresetList(tag: SongTagEnum) {
        for (let track of this.app.tracks.trackList) {
            let bindControl = track.bindControl;
            if (bindControl.tag != tag) continue;

            let presets = this.presets.get(tag)!;
            bindControl.advElement.refreshPresetsOptions(presets);
        }
    }
}