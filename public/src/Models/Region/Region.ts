import type RegionController from "../../Controllers/Editor/Region/RegionController";
import { RATIO_MILLS_BY_PX } from "../../Env";
import RegionPlayer from "./RegionPlayer";

/**
 * A region on a Track.
 * You can add new region types by extending this class. You should also:
 * - Create a new RegionPlayer class for the new region type.
 * - Write a valid mergeWith method. If not, the regions will make no sound.
 * - Create a new RegionView class for the new region type.
 * - Make sure regionType is unique for each region type.
 * - Associate the regionType to a RegionView factory in {@link RegionController#regionViewFactories}
 */
export default abstract class Region{

    /** The region start in milliseconds */
    start: number;
    trackId: number=-1;
    id: number=-1;

    /**
     * @param trackId The unique ID of the track. 
     * @param start The start position of the region in milliseconds.
     * @param regionId The unique ID of the region.
     */
    constructor(start: number) {
        this.start = start;
    }

    /** Region duration in milliseconds */
    abstract get duration(): number

    /**  Region end in milliseconds */
    public get end(){ return this.start+this.duration }

    /**
     * Split the region into two region 
     * @param {number} cut The cut position in milliseconds relative to the region start
     */
    abstract split(cut:number): [Region, Region]

    /** Clone the region. @param newid */
    abstract clone(): Region

    abstract cloneWith({start}:{start?:number}): Region

    /** Create a new region of the same type. */
    abstract emptyAlike(start: number, duration: number): Region

    /** Region start in PX */
    get pos(){ return this.start / RATIO_MILLS_BY_PX }

    /** Region width in PX */
    get width(){ return this.duration / RATIO_MILLS_BY_PX }

    /** Region end in PX */
    get endpos(){ return this.pos + this.width}

    /** Create a region player, that can be used to play the content of the region. */
   abstract createPlayer(groubid: string, audioContext: BaseAudioContext): Promise<RegionPlayer>

    /**
     * Save the region in a Blob.
     */
    abstract save(): Blob

    abstract get regionType(): RegionType<any>

    /**
     * Load the region from a Blob.
     */
    //async static load(blob: Blob, id: number): Promise<Region>{throw new Error("Not implemented")}

    /**
     * Merge many regions into a single region.
     * @param regions 
     * @returns 
     */
    static mergeAll<T extends RegionOf<T>>(regions: T[], fromStart:boolean=false): T{
        console.assert(regions.length>0, "No region to merge")

        // Get size
        let start=Infinity
        let end=-Infinity
        for(const region of regions){
            if(region.start<start)start=region.start
            if(region.end>end)end=region.end
        }
        let duration=end-start

        if(fromStart){
            duration+=start
            start=0
        }

        // Merge
        const merged=regions[0].emptyAlike(start, duration)
        for(const region of regions){
            merged.mergeWith(region)
        }

        return merged
    }
}

export type RegionType<T extends RegionOf<T>> = string

export abstract class RegionOf<THIS extends RegionOf<THIS>> extends Region {

    /**
     * Split the region into two region
     * @param cut The position in milliseconds relative to the region start
     */
    abstract override split(cut:number): [THIS, THIS]

    abstract override emptyAlike(start: number, duration: number): THIS

    /**
     * Merge another region into this region.
     * The don't have to be consecutive, and they can overlap.
     * The start of this region can be changed if the other region starts before.
     */
    abstract mergeWith(other: THIS): void

    abstract override clone(): THIS

    override cloneWith({start}:{start?:number}): THIS{
        const clone=this.clone()
        if(start!=null)clone.start=start
        return clone
    }

    abstract override  get regionType(): RegionType<THIS>

    isCompatibleWith(other: Region): other is RegionOf<THIS>{
        return other instanceof RegionOf && other.regionType===this.regionType
    }

}