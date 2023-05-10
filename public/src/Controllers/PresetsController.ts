import App from "../App";
import {SongTagEnum} from "../Utils/SongTagEnum";
import Preset from "../Models/Preset";

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
}