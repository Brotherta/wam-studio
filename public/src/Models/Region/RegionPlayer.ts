
interface RegionPlayer{
    
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
     * Play the region
     */
    play(): void

    /**
     * Pause the region
     */
    pause(): void

    /**
     * Set the region cursor playhead position in milliseconds.
     */
    set playhead(value: number)

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