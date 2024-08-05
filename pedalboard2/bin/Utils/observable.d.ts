export type ArrayLinkId<T> = [(i: T, id: number) => void, (i: T, id: number) => void] & {
    __LINK_ID_INTERNAL__: "__LINK_ID_INTERNAL__";
};
export declare class ReadonlyObservableArray<T> {
    protected _array: T[];
    readonly on_add: Set<(item: T, index: number) => void>;
    readonly on_remove: Set<(item: T, index: number) => void>;
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
    link(on_link: (it: T, i: number) => void, on_unlink: (it: T, i: number) => void): ArrayLinkId<T>;
    /**
     * Remove callbacks addeds by the link method.
     * And call the on_unlink callback for each item in the array.
     * @param id
     */
    unlink(id: ArrayLinkId<T>): void;
    /**
     * Get the item at the specified index
     * @param index The index of the item to get
     * @returns The item at the specified index
     */
    at(index: number): T;
    /** The length of the array */
    get length(): number;
    /**
     * @returns An iterator for the array
     */
    [Symbol.iterator](): IterableIterator<T>;
    /** @see Array#entries */
    entries(): IterableIterator<[number, T]>;
    /** @see Array#indexOf */
    indexOf(item: T, fromIndex?: number): number;
    /** @see Array#findIndex */
    findIndex(predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: any): number;
    /** @see Array#find */
    find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined;
    /** @see Array#includes */
    includes(item: T, fromIndex?: number): boolean;
    /** @see Array#forEach */
    forEach(callback: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
    /** @see Array#filter */
    filter(callback: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];
}
export declare class ObservableArray<T> extends ReadonlyObservableArray<T> {
    /**
     * @see Array#splice
     */
    splice(start: number, deleteCount: number, ...items: T[]): T[];
    /**
     * Add items to the end of the array
     * @see Array#push
     */
    push(...items: T[]): number;
}
export type LinkId<T> = [(i: T) => void, (i: T) => void] & {
    __LINK_ID_INTERNAL__: "__LINK_ID_INTERNAL__";
};
export declare class ReadonlyObservable<T> {
    protected _value: T;
    constructor(_value: T);
    readonly on_set: Set<(value: T) => void>;
    readonly on_unset: Set<(value: T) => void>;
    get value(): T;
    /**
     * Add a callback to be called when the value is set.
     * The first callback is first called with the current value.
     * And the second will be casted with the new value after.
     * @param on_link A callback to be called for each item in the array when present and when linked.
     * @param on_unlink A callback to be called for each item when no more present or when unlinked.
     */
    link(on_link: (it: T) => void, on_unlink: (it: T) => void): LinkId<T>;
    /**
     * Remove callbacks addeds by the link method.
     * And call the on_unlink for the current value.
     * @param id
     */
    unlink(id: LinkId<T>): void;
}
export declare class Observable<T> extends ReadonlyObservable<T> {
    set value(value: T);
    get value(): T;
}
