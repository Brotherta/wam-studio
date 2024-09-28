import { Pedalboard2NodeState } from "./Pedalboard2Node.js";
import { WamDescriptor } from "./webaudiomodules/api/index.js";
/** A list of plugins the pedalboard2 have access to */
export interface Pedalboard2LibraryDescriptor {
    /** The name of the library */
    name: string;
    /** A unique identifier for the library **/
    id: string;
    /** The url of the library, should not be provided by the json. */
    url: string;
    /**
     * The version of the library as [major,minor].
     * Versions with a different major number are not compatible.
     * Versions with a same major number are just backward compatible.
     **/
    version: [number, number];
    /** A list of urls to the main js file of WAMs, relative to the descriptor url */
    plugins: string[];
    /** Default: false ; If true, the library can be loaded if a plugin is missing, or if a included library cannot be loaded. */
    permissive?: boolean;
    /** A list of builtin presets */
    presets?: {
        [preset_name: string]: {
            description: string;
            category: string;
            state: Pedalboard2NodeState;
        };
    };
    /**
     * A list of urls to other Pedalboard2 Libraries this library include with their compatible version and their id.
     * These libraries plugins will be included in this pedalboard2 library.
     * Make sure the url is linked to a specific version of the library, else it could become incompatible.
     * Relative to the descriptor url.
     **/
    includes: {
        url: string;
        version: [number, number];
        id: string;
    }[];
}
/** A library of plugins for the pedalboard2 */
export interface Pedalboard2Library {
    descriptor: Pedalboard2LibraryDescriptor;
    plugins: {
        [id: string]: {
            descriptor: WamDescriptor;
            classURL: string;
        };
    };
    presets: {
        [category_name: string]: {
            [preset_name: string]: {
                description: string;
                state: Pedalboard2NodeState;
            };
        };
    };
}
export declare class Pedalboard2Error extends Error {
    readonly type: "bad_name" | "bad_id" | "bad_version" | "bad_plugins" | "bad_includes" | "incompatible_id" | "incompatible_version" | "missing_default" | "not_a_wam" | "missing_descriptor" | "bad_presets";
    constructor(type: "bad_name" | "bad_id" | "bad_version" | "bad_plugins" | "bad_includes" | "incompatible_id" | "incompatible_version" | "missing_default" | "not_a_wam" | "missing_descriptor" | "bad_presets", message: string);
}
/**
 * Import a pedalboard2 library descriptor from a url and validate it with the version and id if provided.
 * @throws {Error} If the library is not compatible with the version or the id is not the same, or if the library is not valid.
 **/
export declare function importPedalboard2Library(url: string, version?: [number, number], id?: string): Promise<Pedalboard2LibraryDescriptor>;
/**
 * Resolve a pedalboard2 library from a library descriptor.
 * Load all his plugins and included libraries, and return a Pedalboard2Library object.
 *
 * @param libDesc The library descriptor to resolve.
 * @param ignored A list of id of library to ignore when importing the included libraries, the list is modified with the id of the imported library.
 * @throws {Error} If a plugin or included library cannot be loaded or is not valid.
 * @returns
 */
export declare function resolvePedalboard2Library(libDesc: Pedalboard2LibraryDescriptor, ignored?: string[]): Promise<Pedalboard2Library>;
