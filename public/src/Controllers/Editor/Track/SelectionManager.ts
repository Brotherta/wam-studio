import FriendlyIterable from "../../../Utils/FriendlyIterable"


/**
 * Manage selection and multiple selection of objects.
 */
export class SelectionManager<T>{

    //// OBSERVABLES ////
    readonly onPrimaryChange= new Set<(preivous:T|null, selected: T|null)=>void>()

    readonly onSecondaryAdd= new Set<(selected:T)=>void>()

    readonly onSecondaryRemove= new Set<(unselected:T)=>void>()



    //// SETTERS ////
    /**
     * Set the primary selected, unselecting all the secondary selected
     * @param selected The object to select, or null to unselect all.
     */
    set(selected: T|null){
        this._spliceSecondary(0, this._secondary.length)
        if(this._primary===selected) return
        this._setPrimary(selected)
    }

    /**
     * Select the primary selected adding the previous primary selected to the secondary selecteds
     * and keeping the secondary selecteds.
     * @param selected 
     * @returns 
     */
    add(selected: T){
        if(this._primary===selected) return
        if(this._primary)this._spliceSecondary(this._secondary.length, 0, this._primary)
        this._setPrimary(selected)
    }

    /**
     * Unselect an object, if the object is the primary selected, the primary selected
     * will be take the last secondary selected.
     * @param unselected 
     */
    remove(unselected: T){
        if(this._primary===unselected){
            if(this._secondary.length>0) this._setPrimary(this._secondary[this._secondary.length-1])
            else this._setPrimary(null)
        }
        else{
            const index= this._secondary.indexOf(unselected)
            if(index>=0) this._spliceSecondary(index, 1)
        }
    }

    /**
     * Toggle the selection state of an object.
     * If the object is selected, it will be unselected.
     * If the object is not selected, it will be selected.
     * @param target The object to toggle
     * @param multiselection Is in multiselection mode. If true, the previously selected is added to the secondary selecteds. 
     */
    toggle(target: T, multiselection=false){
        if(multiselection){
            if(this.isSelected(target)) this.remove(target)
            else this.add(target)
        }
        else{
            if(this.isSelected(target)) this.set(null)
            else this.set(target)
        }
    }



    //// GETTERS ////
    /** The primary selected object */
    get primary(){ return this._primary }

    set primary(selected: T|null){ this.set(selected) }

    /** The secondary selected objects */
    readonly secondaries= new FriendlyIterable(()=>this._secondary[Symbol.iterator]())

    get secondaryCount(){ return this._secondary.length }

    /** The selected objects */
    readonly selecteds= new FriendlyIterable(()=>{
        const ret=[...this._secondary]
        if(this._primary)ret.push(this._primary)
        return ret[Symbol.iterator]()
    })

    get selectedCount(){ return this._secondary.length+1 }

    isSelected(target: T){ return this.selecteds.includes(target) }



    //// INTERNALS ////
    private _primary: T|null = null

    private _secondary: T[] = []

    private _spliceSecondary(start: number, deleteCount: number, ...items: T[]){
        const toSelect= items.filter(sp => !this._secondary.includes(sp))
        const removed = this._secondary.splice(start, deleteCount, ...toSelect)
        removed.forEach(sp=>this.onSecondaryRemove.forEach(cb=>cb(sp)))
        toSelect.forEach(sp=>this.onSecondaryAdd.forEach(cb=>cb(sp)))
    }

    private _setPrimary(selected: T|null){
        if(this._primary==selected) return
        const oldPrimary = this._primary
        this._primary = selected

        if(selected && this._secondary.includes(selected)){
            this._spliceSecondary(this._secondary.indexOf(selected), 1)
        }

        this.onPrimaryChange.forEach(cb=>cb(oldPrimary, selected))
    }


}