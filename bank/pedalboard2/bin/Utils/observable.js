export class ReadonlyObservableArray {
    _array = [];
    on_add = new Set();
    on_remove = new Set();
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
    link(on_link, on_unlink) {
        this.on_add.add(on_link);
        this.on_remove.add(on_unlink);
        this._array.forEach((item, index) => on_link(item, index));
        return [on_link, on_unlink];
    }
    /**
     * Remove callbacks addeds by the link method.
     * And call the on_unlink callback for each item in the array.
     * @param id
     */
    unlink(id) {
        this.on_add.delete(id[0]);
        this.on_remove.delete(id[1]);
        this._array.forEach((item, index) => id[1](item, index));
    }
    /**
     * Get the item at the specified index
     * @param index The index of the item to get
     * @returns The item at the specified index
     */
    at(index) {
        return this._array[index];
    }
    /** The length of the array */
    get length() {
        return this._array.length;
    }
    /**
     * @returns An iterator for the array
     */
    [Symbol.iterator]() {
        return this._array[Symbol.iterator]();
    }
    /** @see Array#entries */
    entries() {
        return this._array.entries();
    }
    /** @see Array#indexOf */
    indexOf(item, fromIndex) {
        return this._array.indexOf(item, fromIndex);
    }
    /** @see Array#findIndex */
    findIndex(predicate, thisArg) {
        return this._array.findIndex(predicate, thisArg);
    }
    /** @see Array#find */
    find(predicate, thisArg) {
        return this._array.find(predicate, thisArg);
    }
    /** @see Array#includes */
    includes(item, fromIndex) {
        return this._array.includes(item, fromIndex);
    }
    /** @see Array#forEach */
    forEach(callback, thisArg) {
        this._array.forEach(callback, thisArg);
    }
    /** @see Array#filter */
    filter(callback, thisArg) {
        return this._array.filter(callback, thisArg);
    }
}
export class ObservableArray extends ReadonlyObservableArray {
    /**
     * @see Array#splice
     */
    splice(start, deleteCount, ...items) {
        const removed = this._array.splice(start, deleteCount, ...items);
        removed.forEach((item, index) => this.on_remove.forEach(callback => callback(item, start + index)));
        items.forEach((item, index) => this.on_add.forEach(callback => callback(item, start + index)));
        return removed;
    }
    /**
     * Add items to the end of the array
     * @see Array#push
     */
    push(...items) {
        this.splice(this._array.length, 0, ...items);
        return length;
    }
}
export class ReadonlyObservable {
    _value;
    constructor(_value) {
        this._value = _value;
    }
    on_set = new Set();
    on_unset = new Set();
    get value() { return this._value; }
    /**
     * Add a callback to be called when the value is set.
     * The first callback is first called with the current value.
     * And the second will be casted with the new value after.
     * @param on_link A callback to be called for each item in the array when present and when linked.
     * @param on_unlink A callback to be called for each item when no more present or when unlinked.
     */
    link(on_link, on_unlink) {
        this.on_set.add(on_link);
        this.on_unset.add(on_unlink);
        on_link(this._value);
        return [on_link, on_unlink];
    }
    /**
     * Remove callbacks addeds by the link method.
     * And call the on_unlink for the current value.
     * @param id
     */
    unlink(id) {
        this.on_set.delete(id[0]);
        this.on_unset.delete(id[1]);
        id[1](this._value);
    }
}
export class Observable extends ReadonlyObservable {
    set value(value) {
        const old_value = this._value;
        this._value = value;
        this.on_unset.forEach(callback => callback(old_value));
        this.on_set.forEach(callback => callback(value));
    }
    get value() { return this._value; }
    get readonly() { return this; }
}
