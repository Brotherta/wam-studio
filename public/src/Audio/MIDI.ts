
/**
 * A note on a MIDI track with a frequency, a velocity, a channel and a duration.
 * Non-mutable so that it can be shared between multiple MIDI tracks instead of cloned, saving memory and CPU time.
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
 * A list of notes on a MIDI track played in the same small time interval.
 */
export type MIDIInstant=Array<{offset:number, note:MIDINote}>


/**
 * A view of a MIDI track, abstracting the way the MIDI track is stored.
 * You can get all instants and the instant duration.
 * The track has a fixed duration, some instant can be out of the track.
 * The duration of the track is at the end of note that ends the latest.
 */
export abstract class MIDIView{

    /** Get the duration of the MIDIView */
    abstract get duration(): number

    /** The duration of a single instant in milliseconds. */
    abstract get instant_duration(): number

    /** The number of instants in the MIDI track. */
    abstract get instant_count(): number

    /**
     * Iterate over all notes in the MIDI track.
     * @param callback The callback to call for each note.
     */
    abstract forEachNote(callback: (note: MIDINote, start: number) => void):void

    /**
     * Add a note to the MIDI track inside the already existing instants.
     * @param note The note to add.
     * @param start The start time of the note in milliseconds.
     */
    abstract putNote(note: MIDINote, start: number): void

    /**
     * Merge another MIDI track into this one.
     * @param instant_index 
     * @param note_index 
     * @param newend 
     */
    mergeFrom(other: MIDIView): void {
        other.forEachNote((note, start)=>{
            this.putNote(note, start)
        })
    }

    /**
     * Clone a section of the MIDI
     * @param from The start time of the section to clone in milliseconds.
     * @param to The end time of the section to clone in milliseconds.
     */
    clone(): MIDI {
        const cloned=new MIDI(this.instant_duration, this.duration)
        cloned.mergeFrom(this)
        return cloned
    }

    /**
     * Clone the MIDI with a different instant duration.
     * @param new_instant_duration 
     * @returns 
     */
    withInstantDuration(new_instant_duration: number): MIDI {
        const new_midi=new MIDI(new_instant_duration, this.instant_count*new_instant_duration)
        this.forEachNote((note, start)=>{
            new_midi.putNote(note, start)
        })
        new_midi.pack()
        return new_midi
    }

    /** Create a mutable view on a subpart of the MIDI Track */
    view(start: number, duration?: number){
        return new SubMIDI(this,start,duration)
    }

    /**
     * Mix to midi into a new MIDI that contains both
     * @param other
     * @param start an offset from this MIDI to the other MIDI in milliseconds.
     */
    merge(other: MIDIView, start: number){
        const max_duration= Math.max(this.duration,start+other.duration)
        const empty=MIDI.empty(this.instant_duration, max_duration)
        empty.mergeFrom(this)
        empty.view(start).mergeFrom(other)
        return empty
    }
}


/**
 * A MIDI track, represented as a sequence of MIDIInstant.
 */
export class MIDI extends MIDIView{
    

    /* FACTORIES */

    /**
     * Create a new MIDI track.
     * @param instant_duration The duration of a single instant in milliseconds.
     * @param instants The MIDI instant sequence.
     */
    constructor(instant_duration: number, duration:number){
        super()
        this._instant_duration=instant_duration
        this._instants=[]
        while(this._instants.length*this.instant_duration<duration) this._instants.push([])
        this._duration=duration
    }

    /**
     * Create an empty MIDI track.
     * @param instant_duration The instant duration in milliseconds.
     * @param duration 
     * @returns 
     */
    static empty(instant_duration: number, duration: number): MIDI{
        return new MIDI(instant_duration, duration)
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
        let max_length=0
        for(const line of lines)max_length=Math.max(max_length,line.length)
        const ret=new MIDI(instant_duration,max_length*instant_duration)

        for(let notei=0; notei<lines.length; notei++){
            let note=261.63+notei*15.60
            for(let instanti=0; instanti<lines[notei].length; instanti++){
                const char=lines[notei][instanti]
                if(char<'0' || '9'<char)continue
                const duration=instant_duration*(1+parseInt(char))
                ret.putNote(new MIDINote(note, 1, 0, duration), instanti*instant_duration)
            }
        }
        return ret
    }


    /* DURATION */
    private _duration:number=0

    override get duration(): number {
        return this._duration
    }

    override set duration(value: number){
        this._duration=value
        const target_count=Math.ceil(this.duration/this.instant_duration)
        while(this._instants.length<target_count)this._instants.push([])
        while(this._instants.length>target_count)this._instants.pop()
    }


    /* INSTANT DURATION */
    private _instant_duration:number
    
    override get instant_duration(): number {
        return this._instant_duration
    }

    override set instant_duration(value:number) {
        this._instant_duration=value
        this.forEachNote((note, start)=>{
            if(start+note.duration>this._duration) this._duration=start+note.duration
        })
    }


    /* INSTANTS */
    private _instants: MIDIInstant[]

    get instants(){return this._instants}
    
    override get instant_count(): number {
        return this._instants.length
    }

    instantAt(index: number): MIDIInstant {
        return this._instants[index]
    }

    
    /* PUT NODE / FOR NODE */
    /**
     * Iterate over all notes in the MIDI track.
     * @param callback The callback to call for each note.
     */
    override forEachNote(callback: (note: MIDINote, start: number) => void): void {
        const max_instant_count=Math.min(this.instant_count,Math.ceil(this.duration/this.instant_duration))
        for(let i=0; i<this.instant_count; i++){
            const instant=this.instantAt(i)
            for(const note of instant){
                const start=i*this.instant_duration+note.offset
                if(start>=this.duration)continue
                if(start+note.note.duration>this.duration) callback({...note.note, duration: this.duration-start}, start)
                else callback(note.note, start)
            }
        }
    }

    /**
     * Add a note to the MIDI track inside the already existing instants.
     * @param note The note to add.
     * @param start The start time of the note in milliseconds.
     */
    override putNote(note: MIDINote, start: number): void {
        const instant_index=Math.floor(start/this.instant_duration)
        const offset=start-instant_index*this.instant_duration
        if(instant_index>=this.instant_count)return
        const list=this.instantAt(instant_index)
        list.push({offset,note})
    }


    /**
     * Change the duration and the allocated instants so it can contains all notes and not more.
     */
    pack(){
        let target_duration=0
        this.forEachNote((note,start)=>{
            if(start+note.duration>target_duration)target_duration=start+note.duration
        })
        this.duration=target_duration
    }
}

/**
 * A view of a MIDI track, abstracting the way the MIDI track is stored.
 * You can get all instants and the instant duration.
 * The duration of the track is at the end of note that ends the latest.
 * /!\ Any modification on the original midi can invalid its sub midis.
 */
export class SubMIDI extends MIDIView{

    public readonly sub_instant_start
    public readonly sub_instant_count
    public readonly subduration


    constructor(public readonly decorated: MIDIView, public readonly substart:number, subduration?:number){
        super()
        if(!subduration)subduration=decorated.duration-substart
        this.subduration=subduration
        this.sub_instant_start=Math.floor(this.substart/decorated.instant_duration)
        this.sub_instant_count=Math.ceil(subduration/decorated.instant_duration)
    }

    /* DURATION */
    override get duration(): number {
        return this.subduration
    }

    /** The duration of a single instant in milliseconds. */
    get instant_duration(){return this.decorated.instant_duration}

    /** The number of instants in the MIDI track. */
    get instant_count(){return this.decorated.instant_count}

    /**
     * Iterate over all notes in the MIDI track.
     * @param callback The callback to call for each note.
     */
    override forEachNote(callback: (note: MIDINote, start: number) => void): void {
        this.decorated.forEachNote((note,start)=>{
            const newstart=start-this.substart
            if(newstart>=0 && newstart<=this.duration)callback(note,start-this.substart)
        })
    }

    /**
     * Add a note to the MIDI track inside the already existing instants.
     * @param note The note to add.
     * @param start The start time of the note in milliseconds.
     */
    override putNote(note: MIDINote, start: number): void {
        if(start<this.duration)this.decorated.putNote(note, start+this.substart)
    }


}