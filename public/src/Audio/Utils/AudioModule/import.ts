/**
 * Utilities to upload code to the audio worklet scope.
 */

/**
 * Upload any objects code to the audio worklet scope or to a module scope.
 * Can be used to upload classes or functions.
 * @param audioWorklet The audio worklet to upload the code to.
 * @param imported The object to upload.
 * @param moduleId The module id to upload the object to, or nothing to upload to the global audio worklet scope.
 */
export function addObjectModule(audioWorklet: AudioWorklet, imported: {name:string}|{name:string}[], moduleId?: string){
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

/**
 * Run any javascript code in the audio worklet context.
 * @param audioWorklet The audio worklet to run the code in.
 * @param code The code to run.
 * @returns A promise that resolves when the code is run.
 */
export function addCodeModule(audioWorklet: AudioWorklet, code: string){
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    return audioWorklet.addModule(url);
}