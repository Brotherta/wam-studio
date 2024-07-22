

export interface ObservedOptions<THIS,T>{
    get?(this: THIS, value: T): void
    set?(this: THIS, value: T): void
}

/**
 * Decorator to create an observed property.
 * Work like a simple property but a function is called when the value is setted or getted.
 */
export function observed<THIS>(options: ObservedOptions<THIS,any>){
    return function(prototype:THIS, name:string){
        const hidden="_"+name
        const {get,set}=options

        // Getter
        let getter: (this:any)=>any
        if(get) getter=function(){ get.call(this,this[hidden]); return this[hidden] }
        else getter=function(){return this[hidden]}

        // Setter
        let setter: (this:any, value:any)=>void
        if(set) setter=function(value){ set.call(this,value); this[hidden]=value}
        else setter=function(value){this[hidden]=value}

        // Set prototype
        Object.defineProperty(prototype, name, {
            set: setter,
            get: getter
        })
    }
}

export interface MappedOptions<THIS,T>{
    get?(this: THIS, value: T): T
    set?(this: THIS, value: T): T
}

/**
 * Decorator to create a mapped property.
 * Work like a simple property but the setter and getted value are mapped by functions.
 */
export function mapped<THIS,T>(options: MappedOptions<THIS,T>){
    return function(prototype:THIS, name:string){
        const hidden="_"+name
        const {get,set}=options

        // Getter
        let getter: (this:any)=>T
        if(get) getter=function(){return get.call(this,this[hidden])}
        else getter=function(){return this[hidden]}

        // Setter
        let setter: (this:any, value:T)=>void
        if(set) setter=function(value){this[hidden]=set.call(this,value)}
        else setter=function(value){this[hidden]=value}

        // Set prototype
        Object.defineProperty(prototype, name, {
            set: setter,
            get: getter
        })
    }
}