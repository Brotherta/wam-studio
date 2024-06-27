import { WamNode } from "@webaudiomodules/api";



/**
 * An audio graph, instanciable in an audio context and with a group id
 */
export default interface AudioGraph<T extends AudioGraphInstance>{
    /**
     * Instanciate the audio graph in the audio context and with the group id.
     * @param audioContext 
     * @param groupId 
     */
    instantiate(audioContext: BaseAudioContext, groupId: string): Promise<T>
}

/**
 * An instance of an audio graph in an audio context and with a group id.
 */
export interface AudioGraphInstance{
    /**
     * Connect the audio graph to a destination.
     * @param destination 
     */
    connect(destination: AudioNode): void

    /**
     * Connect the audio graph to an event destination.
     * @param destination 
     */
    connectEvents(destination: WamNode): void

    /**
     * Disconnect the audio graph from a destination or from all destinations.
     * @param destination 
     */
    disconnect(destination?: AudioNode): void

    /**
     * Disconnect the audio graph from an event destination or from all event destinations.
     * @param destination 
     */
    disconnectEvents(destination?: WamNode): void

    /**
     * Destroy the audio graph, making it unusable but freeing resources.
     */
    destroy():void
}