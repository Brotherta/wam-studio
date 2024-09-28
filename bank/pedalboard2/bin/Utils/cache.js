"use strict";
/**
 * A simple caching class that stores the result of a function call.
 */
class CoolCache {
    data = {};
    caching(id, fn) {
        if (id in this.data)
            return this.data[id];
        const result = fn();
        this.data[id] = result;
        return result;
    }
    clear() {
        this.data = {};
    }
}
