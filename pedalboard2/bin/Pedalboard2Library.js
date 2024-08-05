import { Test, validate } from "./Utils/validate.js";
export class Pedalboard2Error extends Error {
    type;
    constructor(type, message) {
        super(message);
        this.type = type;
    }
}
/**
 * Import a pedalboard2 library descriptor from a url and validate it with the version and id if provided.
 * @throws {Error} If the library is not compatible with the version or the id is not the same, or if the library is not valid.
 **/
export async function importPedalboard2Library(url, version, id) {
    const json = await fetch(url).then(response => response.json()).catch(err => { throw new Error("Could not fetch the library descriptor at " + url); });
    if (!validate(json.name, "string"))
        throw new Pedalboard2Error("bad_name", "The library descriptor at " + url + " does not have a valid name.");
    const ID_VALIDATOR = /^[A-Za-z\._0-9]+$/;
    if (!validate(json.id, ID_VALIDATOR))
        throw new Pedalboard2Error("bad_id", "The library descriptor at " + url + " does not have a valid id.");
    const VERSION_VALIDATOR = [Test.POSITIVE, Test.POSITIVE];
    if (!validate(json.version, VERSION_VALIDATOR))
        throw new Pedalboard2Error("bad_version", "The library descriptor at " + url + " does not have a valid version number.");
    if (!validate(json.plugins, Test.EVERY("string")))
        throw new Pedalboard2Error("bad_plugins", "The library descriptor at " + url + " does not have a valid plugins list.");
    if (!validate(json.includes, Test.EVERY({ url: "string", version: VERSION_VALIDATOR, id: ID_VALIDATOR })))
        throw new Pedalboard2Error("bad_includes", "The library descriptor at " + url + " does not have a valid include list.");
    if (id && json.id != id)
        throw new Pedalboard2Error("incompatible_id", `The id of the library at ${url} (${json.id}) is not the same as the required id ${id}.`);
    if (version && (json.version[0] != version[0] || json.version[1] > version[1]))
        throw new Pedalboard2Error("incompatible_version", `The version of the library at ${url} (${json.version}) is not compatible with the required version ${version}.`);
    json.url = url;
    return json;
}
/**
 * Resolve a pedalboard2 library from a library descriptor.
 * Load all his plugins and included libraries, and return a Pedalboard2Library object.
 *
 * @param libDesc The library descriptor to resolve.
 * @param ignored A list of id of library to ignore when importing the included libraries, the list is modified with the id of the imported library.
 * @throws {Error} If a plugin or included library cannot be loaded or is not valid.
 * @returns
 */
export async function resolvePedalboard2Library(libDesc, ignored = []) {
    const ret = { descriptor: libDesc, plugins: {} };
    ignored.push(libDesc.id);
    // Load the plugins
    for (const pluginUrl of libDesc.plugins) {
        const classURL = new URL(pluginUrl, libDesc.url).href;
        const descriptorURL = new URL("descriptor.json", classURL).href;
        console.log(descriptorURL);
        //@ts-ignore
        const descriptor = await fetch(descriptorURL).then(response => response.json()).catch(err => { throw new Pedalboard2Error("missing_descriptor", `Could not fetch the descriptor at ${descriptorURL}`); });
        //if(!plugin.default) throw new Pedalboard2Error("missing_default", `Missing default export for the plugin at ${fetchUrl}`)
        //if(!plugin?.isWebAudioModuleConstructor) throw new Pedalboard2Error("not_a_wam", `The plugin at ${fetchUrl} is not a WebAudioModule class`)
        descriptor.identifier ??= descriptor.vendor + "." + descriptor.name;
        ret.plugins[descriptor.identifier] = { descriptor, classURL };
    }
    // Load the included libraries
    for (const include of libDesc.includes) {
        if (ignored.includes(include.id))
            continue;
        const fetchUrl = new URL(include.url, libDesc.url).href;
        const subdescriptor = await importPedalboard2Library(fetchUrl, include.version, include.id);
        const lib = await resolvePedalboard2Library(subdescriptor, ignored);
        for (const [id, plugin] of Object.entries(lib.plugins))
            ret.plugins[id] = plugin;
    }
    return ret;
}
