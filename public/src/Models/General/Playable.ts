
export default interface Playable{

    /** Is the playable playing? */
    set isPlaying(value: boolean)
    get isPlaying(): boolean

    /** The cursor position of the playable */
    set playhead(value: number)
    get playhead(): number

    /** Set the loop mode of the playable */
    setLoop(range: [number,number]|null): void
}