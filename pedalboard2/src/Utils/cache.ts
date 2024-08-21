

/**
 * A simple caching class that stores the result of a function call.
 */
class CoolCache<D>{

    private data: {[key:string|number]:D} = {}

    caching(id: string|number, fn: ()=>D){
        if(id in this.data) return this.data[id]
        const result = fn()
        this.data[id] = result
        return result
    }

    clear(){
        this.data = {}
    }
}