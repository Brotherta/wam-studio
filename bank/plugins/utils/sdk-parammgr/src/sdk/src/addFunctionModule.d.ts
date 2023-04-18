declare const addFunctionModule: <F extends (...args: any[]) => any = (...args: any[]) => any>(audioWorklet: AudioWorklet, processorFunction: F, ...injection: Parameters<F>) => Promise<void>;

export default addFunctionModule;
