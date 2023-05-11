import App from "../App";
import {SongTagEnum} from "../Utils/SongTagEnum";
import Preset from "../Models/Preset";
import TrackControl from "../Models/TrackControl";
import Track from "../Models/Track";
import Bind from "../Models/Bind";

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
        // Add default presets to all tags
        console.log(this.presets)
    }

    addPreset(preset: Preset, tag: SongTagEnum) {
        let presets = this.presets.get(tag)!;
        if (presets.includes(preset)) {
            presets.splice(presets.indexOf(preset), 1);
        }
        this.presets.get(tag)?.push(preset);
    }

    removePreset(preset: Preset, tag: SongTagEnum) {
        const index = this.presets.get(tag)?.indexOf(preset);
        if (index != undefined && index > -1) {
            this.presets.get(tag)?.splice(index, 1);
        }
    }

    getAllPresets(tag: SongTagEnum) : Preset[] {
        return this.presets.get(tag)!;
    }

    getDefaultPreset(tag: SongTagEnum) {
        return this.presets.get(tag)?.find(preset => preset.name == "Default");
    }


    selectPreset(control: TrackControl, track: Track) {

    }


    async savePreset(control: TrackControl, track: Track) {
        let name = control.advancedElement.presetName.value;
        if (name == "") {
            alert("Please enter a name for the preset");
            return;
        }

        let preset = new Preset(name);
        preset.binds = control.binds;
        preset.pluginState = await track.plugin.instance!._audioNode.getState();
        this.addPreset(preset, track.tag);

        let tracks = this.app.tracks.trackList.filter(t => t.tag == track.tag);
        for (let t of tracks) {
            if (t.id == track.id) {
                continue;
            }
            let c = this.app.trackControlController.getControl(t.id)!;
            if (c.advancedElement.selectedPreset?.name == preset.name) {

                await t.plugin.instance!._audioNode.setState(preset.pluginState);

                let numberOfBinds = preset.binds.length;
                for (let j = 0; j < numberOfBinds; j++) {
                    let bind = preset.binds[j];
                    await this.app.trackControlController.createBindJsonAsync(c, bind.bindName);
                    let numberOfBindParameters = bind.bindParameters.length;
                    for (let i = 0; i < numberOfBindParameters; i++) {
                        let bindParam = bind.bindParameters[i];
                        let param = await this.app.trackControlController.addParameterAsync(c, bind);
                        param.originalMax = bindParam.originalMax;
                        param.originalMin = bindParam.originalMin;
                        param.setMax(bindParam.max!);
                        param.setMin(bindParam.min!);
                        param.selected = bindParam.param;
                        param.options.value = bindParam.param;
                    }
                }
            }
        }
    }

    cloneBinds(binds: Bind[]) {

    }

    deletePreset(control: TrackControl, track: Track) {

    }
}