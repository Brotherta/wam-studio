import { crashOnDebug } from "../App";

function escapeHtml(unsafe: String)
{
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Create a document fragment from a template string.
 * Support for nodes and iterable values.
 * Other values are stringified, and their special characters are escaped.
 * @param strings 
 * @param values 
 * @returns 
 */
export function doc(strings: TemplateStringsArray, ...values:any[]): DocumentFragment{
    let result= ""
    let nodes:Node[]= []

    // Built the inner html and fetch the nodes
    function addValue(value: any){
        if(value===null || value===undefined)result
        else if(value instanceof Node){
            result+=`<span id="_sam_frament_target_${nodes.length}"></span>`
            nodes.push(value)
        }
        else if(typeof value === "string")result+=escapeHtml(value)
        else if(typeof value[Symbol.iterator]==="function"){
            for(const v of value)addValue(v)
        }
        else result+=escapeHtml(value)
    }
    for(let i=0; i<values.length; i++){
        result+=strings[i]
        addValue(values[i])
    }
    result+=strings[strings.length-1]


    // Create the fragment and replace the placeholders
    const fragment= document.createRange().createContextualFragment(result)
    for(let i=0; i<nodes.length; i++){
        const target= fragment.getElementById(`_sam_frament_target_${i}`)
        target?.replaceWith(nodes[i])
    }
    return fragment
}

/**
 * Create an element from a template string with a specific tag type.
 * @param type The tag type.
 */
export function adoc<T extends keyof HTMLElementTagNameMap>(type: T): (strings: TemplateStringsArray, ...values:any[])=>HTMLElementTagNameMap[T]; 
/**
 * Create an element from a template string.
 */
export function adoc(strings: TemplateStringsArray, ...values:any[]): HTMLElement;
export function adoc(strings_or_type: TemplateStringsArray|keyof HTMLElementTagNameMap, ...values:any[]): any{
    if(typeof strings_or_type==="string"){
        return (strings: TemplateStringsArray, ...values:any[])=>{
            const ret= adoc(strings, ...values)
            if(ret?.tagName.toLowerCase()!==strings_or_type)crashOnDebug("Invalid tag type")
            return ret
        }
    }
    else{
        const fragment= doc(strings_or_type, ...values)
        if(fragment.children.length!==1)crashOnDebug("adoc html string must have a single root element")
        return fragment.firstElementChild
    }
}

export function createSelect<T>(target: HTMLSelectElement, noStr: string, items: Iterable<T>, optionFactory: (item: T)=>[name:string,id:string], select: (item: T|null)=>void, selected?: string|null|number){
    // Create map
    const itemMap: {[key:string]:{name:string, value:T}}= {}
    const itemArray: string[]= []
    for(const item of items){
        const [name,id]= optionFactory(item)
        itemMap[id]= {name:name, value:item}
        itemArray.push(id)
    }

    target.replaceChildren(doc`
        <option value="">${noStr}</option>
        ${ Object.entries(itemMap).map( ([id,{name,value}]) => doc`<option value="${id}">${name}</option>` ) }
    `)

    target.onchange = ()=>{
        if(target.value==="") select(null)
        else{
            const selected= itemMap[target.value]
            if(selected)select(selected.value)
        }
    }

    // Select
    {
        const selectedId= (()=>{
            if(selected===undefined || selected===null)return null
            if(typeof selected==="number"){
                selected= itemArray[selected>=0 ? selected : itemArray.length+selected]
            }
            return selected
        })()
        const selectedOption= selectedId!=null ? itemMap[selectedId] : null
        if(selectedOption!=null){
            target.value=selectedId!
            select(selectedOption.value)
        }
        else {
            target.value=""
            select(null)
        }
    }
}