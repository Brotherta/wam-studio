import { binaryFindFirst } from "./array"


/**
 * A set of ranges with values between a defined minimum and maximum.
 * Ranges that overlaps are mergeds.
 * You can iterate over the ranges. And the part of the range set not covered by the ranges.
 */
export class RangeSet{

    constructor(private min: number, private max: number){}

    private ranges: [number,number][]=[]

    /**
     * Get the indexes of the ranges that overlaps the given range.
     * If no range overlaps the given range, return the index of the first range that starts after the given range.
     * If the given range is after all the ranges, return the length of the array of range.
     */
    get_overlaps(start:number, end:number): number[]|number{
        let crossing_index=binaryFindFirst(this.ranges, it=> it[1]>=start)
        if(crossing_index==-1) return this.ranges.length
        else{
            let crossing= this.ranges[crossing_index]
            if(end<crossing[0]) return crossing_index
            const overlaps=[]
            do{
                overlaps.push(crossing_index)
                crossing=this.ranges[crossing_index]
                if(end<crossing[0])break 
                crossing_index++
            }while(crossing_index<this.ranges.length)
            return overlaps
        }
    }

    /**
     * Get the list of ranges.
     * @returns 
     */
    get_ranges(): ReadonlyArray<[number,number]>{
        return this.ranges
    }

    /**
     * Add a range to the set.
     * @param start 
     * @param end 
     */
    add(start:number, end:number){
        const ret= this.get_overlaps(start,end)

        if(Array.isArray(ret)){
            const overlaps=ret.map(it=>this.ranges[it])
            console.log(overlaps)
            let min=start
            let max=end
            for(let o of overlaps){
                if(o[0]<min)min=o[0]
                if(o[1]>max)max=o[1]
            }
            overlaps[0][0]=min
            overlaps[0][1]=max
            ret.length--
            for(let i=ret.length-1; i>=1; i--) overlaps.splice(ret[i],1)
        }
        else{
            this.ranges.splice(ret,0,[start,end])
        }
    }

    /**
     * Add a range to the set.
     * @param start 
     * @param end 
     */
    remove(start:number, end:number){
        const indexes= this.get_overlaps(start,end)
        console.log(indexes)
        if(Array.isArray(indexes)){
            indexes.reverse()
            for(let index of indexes){
                const range= this.ranges[index]
                if(start <= range[0]){
                    if(end < range[1]) range[0]=end
                    else this.ranges.splice(index,1)
                }
                else{
                    if(end<range[1]) this.ranges.splice(index,1,[range[0],start],[end,range[1]])
                    else range[1]=start
                }
            }
        }
    }

    /**
     * Call a function for each range.
     * @param fn 
     */
    for_range(fn:(range:Readonly<[number,number]>)=>void){
        for(let range of this.ranges){
            fn(range)
        }
    }

    /**
     * Call a function for each range.
     * @param fn 
     */
    for_no_range(fn:(start:number,end:number)=>void){
        let last_end=this.min
        for(let range of this.ranges){
            if(last_end < range[0]) fn(last_end,range[0])
            last_end=range[1]
        }
        if(last_end < this.max) fn(last_end,this.max)
    }


}