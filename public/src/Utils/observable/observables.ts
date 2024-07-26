import { BaseFriendlyIterable } from "../FriendlyIterable"


export interface ReadonlyObservableValue<T>{
    addListener(listener: (oldvalue:T, value:T)=>void): void
    removeListener(listener: (oldvalue:T, value:T)=>void): void
    get(): T
}

/**
 * An observable settable value.
 */
export class ObservableValue<T> implements ReadonlyObservableValue<T>{
    
    private listeners= new Set<(oldvalue:T, value:T)=>void>()
    private content: T

    constructor(private value?: T){
        // @ts-ignore
        this.content=value
    }

    addListener(listener: (oldvalue:T, value:T)=>void){
        this.listeners.add(listener)
    }

    removeListener(listener: (oldvalue:T, value:T)=>void){
        this.listeners.delete(listener)
    }

    get(){
        return this.content
    }

    set(value: T){
        const oldvalue=this.content
        this.content=value
        this.listeners.forEach(listener=>listener(oldvalue,value))
    }
    
}

export abstract class ReadOnlyObservableArray<T> extends BaseFriendlyIterable<T> implements RelativeIndexable<T>{
    protected onRemoveListener= new Set<(added_value:T)=>void>()
    protected onAddListener= new Set<(removed_value:T)=>void>()
    protected content: T[]

    addListener(event:"add"|"remove", listener: (added_value:T)=>void){
        if(event=="add") this.onAddListener.add(listener)
        else this.onRemoveListener
    }

    removeListener(event:"add"|"remove", listener: (removed_value:T)=>void){
        if(event=="add") this.onAddListener.delete(listener)
        else this.onRemoveListener.delete(listener)
    }

    get length(){ return this.content.length }

    get(index: number){ return this.content[index] }

    at(index: number): T | undefined { return this.content[index] }

    [Symbol.iterator](){ return this.content[Symbol.iterator]() }
}

export class ObservableArray<T> extends ReadOnlyObservableArray<T>{

    constructor(private value: T[]=[]){
        super()
        this.content=value
    }

    set(index: number, value: T){
        const oldvalue=this.content[index]
        this.content[index]=value
        this.onRemoveListener.forEach(listener=>listener(oldvalue))
        this.onAddListener.forEach(listener=>listener(value))
        this.content.find
    }

    splice(index: number, count: number, ...values: T[]){
        const removed=this.content.splice(index, count, ...values)
        removed.forEach(value=>this.onRemoveListener.forEach(listener=>listener(value)))
        values.forEach(value=>this.onAddListener.forEach(listener=>listener(value)))
        this.content.at
        return removed
    }

    override get length(){ return super.length }

    override set length(value: number){
        if(value<this.content.length){
            this.pop(this.content.length-value)
        }
    }

    clear(){ this.splice(0, this.content.length) }

    pop(count=1){ this.splice(this.content.length-1, count) }

    push(...values: T[]){ this.splice(this.content.length, 0, ...values) }

}