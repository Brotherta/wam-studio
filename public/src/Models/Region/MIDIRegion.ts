import { RegionOf } from "./Region";

/**
 * A note on a MIDI track.
 */
export class MIDINote{

    /**
     * Create a new MIDI note.
     * @param note The note frequency in Hz.
     * @param velocity The note velocity, between 0 and 1.
     * @param channel The MIDI channel, an integer.
     * @param duration The note duration in milliseconds.
     */
    constructor(
        public readonly note: number, 
        public readonly velocity: number, 
        public readonly channel: number, 
        public readonly duration: number,
    ){}
}

/**
 * A list of notes on a MIDI track played at the same time.
 */
export type MIDIInstant=Array<{offset:number, note:MIDINote}>

/**
 * A MIDI track, represented as a sequence of MIDIInstant.
 */
export class MIDI{

    /**
     * Create a new MIDI track.
     * @param instant_duration The duration of a single instant in milliseconds.
     * @param instants The MIDI instant sequence.
     */
    constructor(instant_duration: number, instants: MIDIInstant[]=[]){
        this.instant_duration=instant_duration
        this.instants=instants
    }

    /**
     * Create an empty MIDI track.
     * @param instant_duration 
     * @param duration 
     * @returns 
     */
    static empty(instant_duration: number, duration: number): MIDI{
        const instant_count=Math.floor(duration/instant_duration)
        const instants=[]
        for(let i=0; i<instant_count; i++){
            instants.push([])
        }
        return new MIDI(instant_duration, Array(Math.ceil(duration/instant_duration)).fill(()=>[]))
    }

    /**
     * Create a MIDI track from a string representation.
     * The grind should look like this:
     * `         0 4     0 0
     *    0   0 0         0
     *     0 0
     * `
     * @param str 
     * @param instant_duration 
     * @returns 
     */
    static fromString(str: string, instant_duration: number): MIDI{
        const lines=str.split("\n")
        const ret=new MIDI(instant_duration)
        for(let notei=0; notei<lines.length; notei++){
            let note=261.63+notei*15.60
            for(let instanti=0; instanti<lines[notei].length; instanti++){
                const char=lines[notei][instanti]
                if(char<'0' || '9'<char)continue
                const duration=instant_duration*(1+parseInt(char))
                ret.addNode(new MIDINote(note, 1, 0, duration), instanti*instant_duration)
            }
        }
        return ret
    }

    /** The MIDI instant sequence */
    instants: MIDIInstant[]

    /** The duration of a single instant in milliseconds */
    instant_duration: number

    get duration(): number { return this.instants.length*this.instant_duration; }

    /**
     * Add a note to the MIDI track
     * @param note The note to add.
     * @param start The start time of the note in milliseconds.
     */
    addNode(note: MIDINote, start: number): void {
        const instant_index=Math.floor(start/this.instant_duration)
        const offset=start-instant_index*this.instant_duration
        while(instant_index>=this.instants.length)this.instants.push([])
        this.instants[instant_index].push({offset,note})
    }

    /**
     * Clone a section of the MIDI
     * @param from The start time of the section to clone in milliseconds.
     * @param to The end time of the section to clone in milliseconds.
     */
    clone({from=0, to=Infinity}: {from?:number,to?:number}={}): MIDI {
        console.assert(from<=to)

        // Get instant index bounds and duration
        const from_index=Math.floor(Math.max(0,from)/this.instant_duration)
        const to_index=Math.min(this.instants.length,Math.floor(to/this.instant_duration))
        const duration=from-to

        // Clone the note sequence and dimish the note duration if needed
        const clone: MIDIInstant[]=[]
        for(let i=from_index; i<to_index; i++){
            const local_index=i-from_index
            const instant_start=(local_index*this.instant_duration)
            const copied_instant=this.instants[i]
            const last: MIDIInstant=[]
            clone.push(last)
            for(const notei in copied_instant){
                const note=copied_instant[notei]
                const final_duration=Math.min(duration, instant_start+note.offset+note.note.duration)-instant_start-note.offset
                last.push({offset:note.offset, note:new MIDINote(note.note.note, note.note.velocity, note.note.channel, final_duration)})
            }
        }

        // Remove the notes in the last instant but outside
        const last_instant=this.instants[to_index]
        const last_instant_start=(clone.length-1)*this.instant_duration
        for(let notei=0; notei<last_instant.length; notei++){
            const note=last_instant[notei]
            if(last_instant_start+note.offset>duration){
                last_instant.splice(notei,1)
                notei--
            }
        }

        // Return the cloned MIDI
        return new MIDI(this.instant_duration, clone)
    }

    /**
     * Merge another MIDI track into this one, with a given start offset, or at the end of the track.
     * @param other The MIDI track to merge.
     * @param start_offset The offset at which to merge the other track, if not specified, the other track is merged at the end of this track.
     */
    mergeWith(other: MIDI, start_offset: number=this.duration): void {
        other.forEachNote((note, start)=>{
            this.addNode(note, start+start_offset)
        })
    }

    /**
     * Iterate over all notes in the MIDI track.
     * @param callback The callback to call for each note.
     */
    forEachNote(callback: (note: MIDINote, start: number) => void): void {
        for(let i=0; i<this.instants.length; i++){
            const instant=this.instants[i]
            for(const note of instant){
                callback(note.note, i*this.instant_duration+note.offset)
            }
        }
    }

    /**
     * Clone the MIDI with a different instant duration.
     * @param new_instant_duration 
     * @returns 
     */
    withInstantDuration(new_instant_duration: number): MIDI {
        const new_midi=new MIDI(new_instant_duration)
        this.forEachNote((note, start)=>{
            new_midi.addNode(note, start)
        })
        return new_midi
    }
}

export default class MIDIRegion extends RegionOf<MIDIRegion>{

    midi: MIDI;

    constructor(trackId: number, midi: MIDI, start: number, regionId: number) {
        super(trackId, start, regionId);
        this.midi = midi;
    }
    
    override get duration(): number { return this.midi.duration; }

    override split(cut:number, id1:number, id2:number): [MIDIRegion, MIDIRegion] {
        console.assert(cut>this.duration)
        const first=this.midi.clone({to:cut})
        const second=this.midi.clone({from:cut})
        return [new MIDIRegion(this.trackId, first, this.start, id1), new MIDIRegion(this.trackId, second, this.start+cut, id2)]
    }

    override clone(id: number): MIDIRegion {
        return new MIDIRegion(this.trackId, this.midi.clone(), this.start, id);
    }

    override mergeWith(other: MIDIRegion): void {
        this.midi.mergeWith(other.midi)
    }

    override save(): Blob {
        return new Blob()//bufferToWave(this.buffer)
    }

}