import { Pedalboard2Library } from "../Pedalboard2Library.js";
import { Pedalboard2Node } from "../Pedalboard2Node.js";
export declare class PresetManager extends HTMLElement {
    private node;
    private executer;
    /**
     * @param node The node of the Pedalboard2
     * @param executer A execute to execute async loading function
     */
    constructor(node: Pedalboard2Node, executer: (action: () => Promise<void>) => void);
    private _selected_group;
    readonly selected_group: import("../Utils/observable.js").ReadonlyObservable<string | null>;
    private _selected_preset;
    readonly selected_preset: import("../Utils/observable.js").ReadonlyObservable<string | null>;
    private _library_link;
    dispose(): void;
    /** Called when start using a library */
    initLibrary(library: Pedalboard2Library | null): void;
    /** Called when stop using a library */
    closeLibrary(library: Pedalboard2Library | null): void;
    /** Recreate the preset repository */
    refreshPresets(): void;
    /** Get all the saved and builtin presets as one library */
    getAllPresets(): MixedPresetStorage;
    getStorage(): SavedPresetStorage;
    setStorage(storage: SavedPresetStorage): void;
    editStorage(fn: (storage: SavedPresetStorage) => void): void;
}
export interface SavedPreset {
    state: any;
    description: string;
}
export interface SavedPresetGroup {
    content: {
        [name: string]: SavedPreset;
    };
}
export interface SavedPresetStorage {
    [name: string]: SavedPresetGroup;
}
export interface MixedPresetStorage {
    [name: string]: {
        isBuiltin: boolean;
        content: {
            [name: string]: {
                state: any;
                description: string;
                group: string;
                isBuiltin: boolean;
            };
        };
    };
}
