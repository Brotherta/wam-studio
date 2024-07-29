import { WamNode } from "@webaudiomodules/api";
import { RegionOf } from "../../../Models/Region/Region";
import type RecorderController from "../RecorderController";




/**
 * A region recorder is responsible of recording. It create a region and record the data in it.
 * Its output can be connected to a node for monitoring.
 * 
 * To add a new region recorder, you need to: 
 * - Implement this interface
 * - Create a new RecorderFactory in the RecorderController
 * 
 * Then you can:
 * - Arm the recorder using {@link RecorderController#armRecorder}
 * - You can disarm it using {@link RecorderController#disarmRecorder}
 * - Check if it is armed using {@link RecorderController#toggleArm}
 */
export interface RegionRecorder<T extends RegionOf<T>> {


    /* ~ REGION RECORDING ~ */

    /**
     * Connect the recorder directly to a node.
     * Its output will be connected to the node directly.
     * Used for the monitoring.
     * @param node 
     */
    connect(node: WamNode): void

    /**
     * Disconnect the recorder from a node.
     * @param node 
     */
    disconnect(node: WamNode): void


    /* ~ RECORDING CONTROL ~ */
    /**
     * Start the recording.
     * And return a initial region.
     * @param on_update - A callback called with a new part of the recorder region to append to the track.
     * @param on_stop - A callback called with the final region to append to the track.
     */
    start(on_part:(addedRegion:T)=>void, on_stop:(addedRegion:T)=>void): void
    
    /**
     * Stop the recording.
     * @returns a promise that resolve after the on_recording_stop callback is called.
     */
    stop(): Promise<void>


    /* ~ LIFE TIME ~ */
    /** Free the recorders ressources */
    dispose(): void
}