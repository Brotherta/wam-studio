import { WamNode } from "@webaudiomodules/api"
import Playable from "../General/Playable"

export default interface RegionPlayer extends Playable{
    
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
     * Start playing the audio region with the playhead at the start position and for the duration.
     * @param start Start position in milliseconds
     * @param duration Duration in milliseconds
     */
    playEfficiently(start: number, duration: number): Promise<void>

    /**
     * Clear the region player.
     * This method should be called if the player is not used anymore.
     */
    dispose(): void


}