import { RATIO_MILLS_BY_PX } from "../../Env";

export type Region=RegionOf<any>

export default abstract class RegionOf<THIS extends RegionOf<THIS>> {
    // current start position
    start: number; // in milliseconds
    trackId: number;
    id: number;


    /**
     * @param trackId The unique ID of the track. 
     * @param start The start position of the region in milliseconds.
     * @param regionId The unique ID of the region.
     */
    constructor(trackId: number, start: number, regionId: number) {
        this.start = start;
        this.trackId = trackId;
        this.id = regionId;
    }

    /** Region duration in milliseconds */
    abstract get duration(): number

    /**  Region end in milliseconds */
    public get end(){ return this.start+this.duration }

    /**
     * Split the region into two region 
     * @param {number} cut The cut position in milliseconds relative to the region start
     */
    abstract split(cut:number, id1:number, id2: number): [THIS, THIS]

    /** Merge the region with another one */
    abstract mergeWith(other: THIS): void

    /** Clone the region. @param newid */
    abstract clone(id: number): THIS

    cloneWith(newid: number, {start}:{start?:number}): THIS{
        const clone=this.clone(newid)
        if(start!=null)clone.start=start
        return clone
    }

    /** Region start in PX */
    get pos(){ return this.start / RATIO_MILLS_BY_PX }

    /** Region width in PX */
    get width(){ return this.duration / RATIO_MILLS_BY_PX }

    /** Region end in PX */
    get endpos(){ return this.pos + this.width}

    /**
     * Save the region in a Blob.
     */
    abstract save(): Blob

    /**
     * Load the region from a Blob.
     */
    //async static load(blob: Blob, id: number): Promise<Region>{throw new Error("Not implemented")}

    updateStart(newStart: number) {
        this.start = newStart;
    }

}