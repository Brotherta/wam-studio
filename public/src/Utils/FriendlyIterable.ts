

/**
 * A generator function wrapper that add a friendly interface to the generator and useful helper functions.
 */
export default class FriendlyIterable<T>{

    #factory: ()=>Iterator<T>

    constructor(factory: ()=>Iterator<T>){
        this.#factory = factory;
    }

    [Symbol.iterator](){
        return this.#factory()
    }

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to two arguments. forEach calls the callbackfn function one time for each element in the array.
     */
    forEach(callbackfn:(value:T, index:number)=>void){
        let index=0
        for(let value of this){
            callbackfn(value,index)
            index++
        }
    }


    /**
     * Returns the value of the first element of the iterator where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the iterator, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     */
    find(predicate: (value: T, index: number) => boolean): T|undefined{
        let index=0
        for(let value of this){
            if(predicate(value,index))return value
            index++
        }
        return undefined
    }

}