import { WamNode } from "@webaudiomodules/api"

export default interface RegionPlayer{
    
    /**
     * Connects the player to a node
     * @param node 
     */
    connect(node: AudioNode): void

    /**
     * Disconnects the player from a node
     * @param node 
     */
    disconnect(node: AudioNode): void

    /**
     * Connect the player events to a WamNode
     * @param node
     */
    connectEvents(node: WamNode): void

    /**
     * Disconnect the player events from a WamNode
     * @param node
     */
    disconnectEvents(node: WamNode): void

    /**
     * Is the region playing?
     */
    set isPlaying(value: boolean)
    get isPlaying(): boolean

    /**
     * The region cursor playhead position in milliseconds.
     */
    set playhead(value: number)
    get playhead(): number

    /**
     * Set the loop mode.
     */
    setLoop(start: number|false, end?: number): void

    /**
     * Clear the region player.
     * This method should be called if the player is not used anymore.
     */
    clear(): void


}