
//// CUSTOM ELEMENT DEFINE ALTERNATIVE TO HANDLE DUPLICATE CUSTOM ELEMENTS ////

const sameNameCount: {[name:string]:number} = {}

/**
 * Once called, customElements.define will allow to define custom elements with the same name multiple times
 * by appending a number to the name after the first definition.
 * 
 * Also make customElements.get return undefined for any name that was defined multiple times.
 */
export function setupCustomElementsDefine(){
    const oldDefine= customElements.define
    const oldGet= customElements.get
    
    customElements.define = (name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) => {
        let count= sameNameCount[name] ?? 1
        sameNameCount[name] = count+1
        name = name + (count==1?"":count)
        console.log("Custom element defined: ", name)
        oldDefine.call(customElements,name, constructor, options)
    }

    customElements.get = (name: string) => {
        if(sameNameCount[name])return undefined
        else return oldGet.call(customElements, name)
    }
    
}