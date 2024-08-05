
export type ArrayLinkId<T> = [(i:T,id:number)=>void, (i:T,id:number)=>void] & {__LINK_ID_INTERNAL__:"__LINK_ID_INTERNAL__"}

export class ReadonlyObservableArray<T> {

    protected _array: T[] = []

    readonly on_add = new Set<(item: T, index: number) => void>()
    readonly on_remove = new Set<(item: T, index: number) => void>()

    /**
     *    Add a callback to be called when an item is added to the array
     * and add a callback to be called when an item is removed from the
     * array.
     * 
     *    The first callback is first called for each item in the array.
     * And the second will be casted for each item in the array after
     * unlink is called.
     * 
     * @param on_link A callback to be called for each item in the array when present and when linked.
     * @param on_unlink A callback to be called for each item when no more present or when unlinked.
     */
    link(on_link:(it:T,i:number)=>void, on_unlink:(it:T,i:number)=>void): ArrayLinkId<T>{
        this.on_add.add(on_link)
        this.on_remove.add(on_unlink)
        this._array.forEach((item, index) => on_link(item, index))
        return [on_link, on_unlink] as ArrayLinkId<T>
    }

    /**
     * Remove callbacks addeds by the link method.
     * And call the on_unlink callback for each item in the array.
     * @param id 
     */
    unlink(id: ArrayLinkId<T>){
        this.on_add.delete(id[0])
        this.on_remove.delete(id[1])
        this._array.forEach((item, index) => id[1](item, index))
    }

    /**
     * Get the item at the specified index
     * @param index The index of the item to get
     * @returns The item at the specified index
     */
    at(index: number): T {
        return this._array[index]
    }

    /** The length of the array */
    get length(): number {
        return this._array.length
    }

    /**
     * @returns An iterator for the array
     */
    [Symbol.iterator]() {
        return this._array[Symbol.iterator]()
    }

    /** @see Array#entries */
    entries(): IterableIterator<[number, T]> {
        return this._array.entries()
    }

    /** @see Array#indexOf */
    indexOf(item: T, fromIndex?: number): number {
        return this._array.indexOf(item,fromIndex)
    }

    /** @see Array#findIndex */
    findIndex(predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: any): number {
        return this._array.findIndex(predicate, thisArg)
    }

    /** @see Array#find */
    find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined {
        return this._array.find(predicate, thisArg)
    }

    /** @see Array#includes */
    includes(item: T, fromIndex?: number): boolean {
        return this._array.includes(item, fromIndex)
    }

    /** @see Array#forEach */
    forEach(callback: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
        this._array.forEach(callback, thisArg)
    }

    /** @see Array#filter */
    filter(callback: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[] {
        return this._array.filter(callback, thisArg)
    }
}

export class ObservableArray<T> extends ReadonlyObservableArray<T> {

    /**
     * @see Array#splice
     */
    splice(start: number, deleteCount: number, ...items: T[]): T[] {
        const removed = this._array.splice(start, deleteCount, ...items)
        removed.forEach((item, index) => this.on_remove.forEach(callback => callback(item, start + index)))
        items.forEach((item, index) => this.on_add.forEach(callback => callback(item, start + index)))
        return removed
    }

    /**
     * Add items to the end of the array
     * @see Array#push
     */
    push(...items: T[]): number {
        this.splice(this._array.length, 0, ...items)
        return length
    }

}


export type LinkId<T> = [(i:T)=>void, (i:T)=>void] & {__LINK_ID_INTERNAL__:"__LINK_ID_INTERNAL__"}

export class ReadonlyObservable<T> {

    constructor(protected _value: T){}

    readonly on_set = new Set<(value: T) => void>()
    readonly on_unset = new Set<(value: T) => void>()

    get value(){ return this._value }

    /**
     * Add a callback to be called when the value is set.
     * The first callback is first called with the current value.
     * And the second will be casted with the new value after.
     * @param on_link A callback to be called for each item in the array when present and when linked.
     * @param on_unlink A callback to be called for each item when no more present or when unlinked.
     */
    link(on_link:(it:T)=>void, on_unlink:(it:T)=>void): LinkId<T>{
        this.on_set.add(on_link)
        this.on_unset.add(on_unlink)
        on_link(this._value)
        return [on_link, on_unlink] as LinkId<T>
    }

    /**
     * Remove callbacks addeds by the link method.
     * And call the on_unlink for the current value.
     * @param id 
     */
    unlink(id: LinkId<T>){
        this.on_set.delete(id[0])
        this.on_unset.delete(id[1])
        id[1](this._value)
    }

}

export class Observable<T> extends ReadonlyObservable<T> {

    set value(value: T){
        const old_value = this._value
        this._value = value
        this.on_unset.forEach(callback => callback(old_value))
        this.on_set.forEach(callback => callback(value))
    }

    get value(): T { return this._value }

}