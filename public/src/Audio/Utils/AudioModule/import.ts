/**
 * Utilities to upload code to the audio worklet scope.
 */

import { AudioWorkletGlobalScope } from "@webaudiomodules/api"
import { audioCtx } from "../../.."


export type WorkletUploadingContextFn= (
    this: AudioWorkletGlobalScope,
    infos: {
        /** The id of the module the code is uploaded to */
        moduleId: string,
        /** The context the code is uploaded to */
        context: any,
        /** The scope of the worklet the module is uploaded to */
        workletThis: AudioWorkletGlobalScope,
        /** The last object uploaded */
        last: {name:string},
        /** Export an object to the builder scope (worklet scope or module scope) */
        export:(exported:{name:string})=>void
    }
)=>void

export class WorkletUploadingContext{

    private audioWorklet: AudioWorklet
    private moduleId?: string
    private code: string

    constructor(audioWorklet: AudioWorklet, moduleId?: string){
        // Worklet
        this.audioWorklet=audioWorklet

        // Module
        this.moduleId=moduleId

        // Code
        this.code=`(()=>{`
        if(this.moduleId)this.code+=`const _WorkletUploadingContext_this=globalThis.webAudioModules.getModuleScope("${this.moduleId}");`
        else this.code+=`const _WorkletUploadingContext_this=globalThis;`
        this.code+=`let _WorkletUploadingContext_last;`
    }

    /**
     * Import objects from the builder scope (module or audioWorklet) to the current scope.
     * @param imports The list of imported objects.
     */
    import(...imports: (string|{name:string})[]){
        for(const imp of imports){
            let name
            if(typeof imp==="string")name=imp
            else name=imp.name
            this.code+= `const ${name}=_WorkletUploadingContext_this.${name};`
        }
    }

    /**
     * Run the given code in a sub scope of the current scope.
     * The subscope will have access to the importeds{@link import} and added{@link add} functions and classes but
     * the classes and functions declared in the subscope will not be accessible from the outer scope.
     * Use the {@link add} method to add a class or a function to the builder scope.
     * @param code 
     */
    run(code:WorkletUploadingContextFn){
        this.code+= `(${code.toString()}).call(globalThis, {
            moduleId: "${this.moduleId??"NO_MODULE"}",
            context: _WorkletUploadingContext_this,
            workletThis: globalThis,
            last: _WorkletUploadingContext_last,
            export(object){ _WorkletUploadingContext_this[object.name]=object; }
        })`
    }

    /**
     * Upload a class or a function to the builder scope (audio worklet or module scope).
     * The object will be accessible from the current scope.
     * @param objects 
     */
    add(...objects: {name:string}[]){
        for(const object of objects){
            this.code+=`
                ${object.toString()};
                _WorkletUploadingContext_last= ${object.name};
                _WorkletUploadingContext_this.${object.name}= ${object.name};
            `
        }
    }

    _upload(): Promise<void>{
        this.code+=`})()`
        const url = URL.createObjectURL(new Blob([this.code], { type: 'text/javascript' }));
        return this.audioWorklet.addModule(url);
    }
}

type AddToModuleOptions=
    {moduleId?:string}
    &({audioWorklet:AudioWorklet} | {audioContext:BaseAudioContext})

/**
 * Upload some things to an audio worklet scope, or to a wam module scope.
 * @code A uploaded content builder function.
 * @author Samuel DEMONT
 */
export function uploadToModule(options:AddToModuleOptions, code: (this:WorkletUploadingContext,it:WorkletUploadingContext)=>void): Promise<void>{
    const audioContext= "audioContext" in options ? options.audioContext.audioWorklet : audioCtx.audioWorklet
    const context=new WorkletUploadingContext(audioContext, options.moduleId)
    code.call(context,context)
    return context._upload()
}

/**
 * Run some code in the audio worklet scope, or in a wam module scope.
 */
export function runToModule(options:AddToModuleOptions, code:WorkletUploadingContextFn): Promise<void>{
    return uploadToModule(options, (it)=>it.run(code))
}

/**
 * Add some objects to the audio worklet scope, or to a wam module scope.
 */
export function addToModule(options:AddToModuleOptions, ...objects: {name:string}[]): Promise<void>{
    return uploadToModule(options, (it)=>it.add(...objects))
}