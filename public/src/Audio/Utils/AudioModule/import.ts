/**
 * Utilities to upload code to the audio worklet scope.
 */

import { AudioWorkletGlobalScope } from "@webaudiomodules/api"


/**
 * Upload any objects code to the audio worklet scope or to a module scope.
 * Can be used to upload classes or functions.
 * Make sure your class is not capturing any variables from the outer scope, and is not referencing imported objects.
 * @param audioWorklet The audio worklet to upload the code to.
 * @param imported The object to upload.
 * @param moduleId The module id to upload the object to, or nothing to upload to the global audio worklet scope.
 * @author Samuel DEMONT
 */
export function addObjectModule(audioWorklet: AudioWorklet, imported: {name:string}|{name:string}[], moduleId?: string): Promise<void>{
    if(!Array.isArray(imported))imported=[imported]

    let finalCode=`(()=>{`
    for(const object of imported){

        // Get uploadtarget
        let uploadTarget
        if(moduleId)uploadTarget=`globalThis.webAudioModules.getModuleScope(${moduleId}).${object.name}= ${object.name}`
        else uploadTarget=`globalThis.${object.name}= ${object.name}`

        // Add to the final code
        finalCode+=`
            ${imported.toString()};
            ${uploadTarget};
        `
    }
    finalCode+=`})()`
    
    // Upload the code
    return addCodeModule(audioWorklet, finalCode);
}

export type InModuleFunction= (this: AudioWorkletGlobalScope, infos: {moduleId: string, module: any})=>void

/**
 * Execute the given code in the module scope.
 * The given function should not capture any variables from the outer scope or reference imported objects.
 * @param audioWorklet 
 * @param moduleId 
 * @param code 
 * @returns 
 */
export function doInModule(audioWorklet: AudioWorklet, moduleId: string, code: InModuleFunction): Promise<void>{
    let finalCode=`(${code.toString()}).call(globalThis, {moduleId:"${moduleId}", module:globalThis.webAudioModules.getModuleScope("${moduleId}")})`
    return addCodeModule(audioWorklet, finalCode);
}


/**
 * Run any javascript code in the audio worklet context.
 * @param audioWorklet The audio worklet to run the code in.
 * @param code The code to run.
 * @returns A promise that resolves when the code is run.
 */
function addCodeModule(audioWorklet: AudioWorklet, code: string){
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    return audioWorklet.addModule(url);
}