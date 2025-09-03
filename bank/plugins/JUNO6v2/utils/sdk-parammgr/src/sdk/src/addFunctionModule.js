/**
 * Take a function, stringify it and inject to an AudioWorklet with parameters.
 *
 * @param {AudioWorklet} audioWorklet
 * @param {(...args: any[]) => any} processorFunction
 * @param {any[]} [injection]
 * @returns {Promise<void>}
 */
const addFunctionModule = (audioWorklet, processorFunction, ...injection) => {
    const text = `(${processorFunction.toString()})(${injection.map((s) => JSON.stringify(s)).join(', ')});`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
    return audioWorklet.addModule(url);
}

export default addFunctionModule;
