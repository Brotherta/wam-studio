/**
 * A simple caching class that stores the result of a function call.
 */
declare class CoolCache<D> {
    private data;
    caching(id: string | number, fn: () => D): D;
    clear(): void;
}
