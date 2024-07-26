
export abstract class BaseFriendlyIterable<T> {
    
    abstract [Symbol.iterator](): Iterator<T>

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

    /**
     * Returns the index of the first element of the iterator where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the iterator, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element index. Otherwise, find returns -1.
     */
    findIndex(predicate: (value: T, index: number) => boolean): number{
        let index=0
        for(let value of this){
            if(predicate(value,index))return index
            index++
        }
        return -1
    }

    /**
     * Returns the index of the first occurrence of a value in an iterator, or -1 if it is not present.
     * @param value The value to locate in the iterator.
     */
    indexOf(value: T): number{
        return this.findIndex(v=>v===value)
    }

    /**
     * Determines whether the specified callback function returns true for any element of an iterator.
     * @param predicate A function that accepts up to two arguments. some calls the predicate function for each element of the iterator until the predicate returns true, or until the end of the iterator.
     */
    some(predicate: (value: T, index: number) => boolean): boolean{ return this.findIndex(predicate)!=-1 }

    /**
     * Determines whether all the members of an iterator satisfy the specified test.
     * @param predicate A function that accepts up to two arguments. every calls the predicate function for each element of the iterator until the predicate returns false, or until the end of the iterator.
     */
    every(predicate: (value: T, index: number) => boolean): boolean{ return this.findIndex((value,index)=>!predicate(value,index))==-1 }

    /**
     * Returns a new iterator that contains the elements of the original iterator that satisfy the specified predicate.
     * @param predicate A function that accepts up to two arguments. filter calls the predicate function one time for each element of the iterator.
     */
    map<U>(callbackfn: (value: T, index: number) => U): U[]{
        const result: U[]=[]
        let index=0
        for(let value of this){
            result.push(callbackfn(value,index))
            index++
        }
        return result
    }

    /**
     * Applies a function against an accumulator and each element in the iterator (from left to right) to reduce it to a single value.
     * @param callbackfn A function that accepts up to three arguments. The reduce method calls the callbackfn function one time for each element in the iterator.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T): T{
        let index=0
        let previousValue: T|undefined
        for(let value of this){
            if(previousValue==undefined)previousValue=value
            else previousValue=callbackfn(previousValue,value,index)
            index++
        }
        if(previousValue==undefined)throw new Error("Reduce of empty iterator with no initial value")
        return previousValue
    }

    /**
     * Checks if the iterable contains the specified value.
     */
    includes(value: T): boolean{
        return this.some(v=>v===value)
    }
    
}

/**
 * A generator function wrapper that add a friendly interface to the generator and useful helper functions.
 */
export default class FriendlyIterable<T> extends BaseFriendlyIterable<T>{

    #factory: ()=>Iterator<T>

    constructor(factory: ()=>Iterator<T>){
        super()
        this.#factory = factory;
    }

    [Symbol.iterator](){
        return this.#factory()
    }

}