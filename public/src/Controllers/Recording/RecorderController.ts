import App from "../../App";
import { RegionOf } from "../../Models/Region/Region";
import Track from "../../Models/Track/Track";
import { RegionRecorder } from "./Recorders/RegionRecorder";
import { SampleRegionRecorder } from "./Recorders/SampleRegionRecorder";


export type RecorderFactory<T extends RegionRecorder<any>> = (app: App, track: Track) => Promise<T>

export default class RecorderController {

    static SAMPLE_RECORDER:RecorderFactory<SampleRegionRecorder>= async (app,track) =>{
        const recorder= await SampleRegionRecorder.create(app, track.audioContext, track.groupId)
        recorder.trackElement= track.element
        return recorder
    }

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    /** Starts monitoring on the given track. */
    startMonitoring(track: Track) { if(track._recording_recorder.size>0) track.monitored= true }

    /** Stops monitoring on the given track. */
    stopMonitoring(track: Track) { track.monitored = false }

    /** Stops recording all armed tracks. */
    stopRecordingAllTracks() {
        for (let track of this.app.tracksController.tracks) {
            this.stopRecording(track);
        }
    }

    /** Activate a recorder on the given track. */
    armRecorder(track: Track, recorder: RecorderFactory<any>) {
        if(!track._recording_recorder.has(recorder)){
            track._recording_recorder.add(recorder)
            if(this.app.host.recording) this.startRecordingWith(track,recorder)
        }
    }

    /** Deactivate a recorder on the given track. */
    disarmRecorder(track: Track, recorder: RecorderFactory<any>) {
        if(track._recording_recorder.delete(recorder)){
            if(track._recording_recorder.size==0) track.monitored=false
            if(this.app.host.recording) this.stopRecordingWith(track,recorder)
        }
    }

    /** Toggle the armed status of the given recorder on the given track. */
    toggleArm(track: Track, recorder: RecorderFactory<any>, force?: boolean) {
        if(force!==undefined){
            if(force) this.armRecorder(track,recorder)
            else this.disarmRecorder(track,recorder)
        }
        else{
            if(track._recording_recorder.has(recorder)) this.disarmRecorder(track,recorder)
            else this.armRecorder(track,recorder)
        }
    }

    /** Check if the given recorder is armed on the given track. */
    isArmed(track: Track, recorder: RecorderFactory<any>) {
        return track._recording_recorder.has(recorder)
    }

    /**
     * Starts recording on the given track.
     * @param track - The track to start recording on.
     * @param playhead - The current playhead position in milliseconds.
     */
    async startRecording(track: Track, playhead: number) {
        this.app.host.recording = true;

        // Start the recorders
        const promises= [...track._recording_recorder.values()].map(recorder=>this.startRecordingWith(track,recorder))
        
        // Wait till they are all started
        await Promise.all(promises)
    }

    /**
     * Stops recording on the given track.
     * @param track - The track to stop recording on.
     */
    async stopRecording(track: Track) {
        this.app.host.recording = false;

        // Stop the recorders
        const promises= [...track._recording_recorder.values()].map(recorder=>this.stopRecordingWith(track,recorder))
        
        // Wait till they are all stopped
        await Promise.all(promises)
    }

    /** Get a recorder of a track, creating it if it does not exist. */
    async getRecorder<T extends RegionRecorder<any>>(track: Track, recorder: RecorderFactory<T>): Promise<T> {
        let rec=track.recorders.get(recorder) as T
        if(!rec){
            rec= await recorder(this.app,track)
            track.addRecorder(recorder,rec)
        }
        return rec
    }

    /**
     * Start recording a region on the given track with the given recorder type.
     * @param track The track to record on
     * @param recorderType The type of recorder to use
     */
    private async startRecordingWith(track:Track, recorderType:RecorderFactory<RegionRecorder<any>>){
        const recorder= await this.getRecorder(track,recorderType)

        // Start the recording
        const playhead=this.app.host.playhead
        let region: RegionOf<any>
        recorder.start(
            (addedRegion)=>{
                console.log("Region",region)
                if(region===undefined){
                    addedRegion.start=playhead
                    region=addedRegion
                    this.app.regionsController.addRegion(track,addedRegion)
                }
                else{
                    addedRegion.start=region.end
                    region.mergeWith(addedRegion)
                    this.app.regionsController.removeRegion(region)
                    this.app.regionsController.addRegion(track,region)
                }
            },
            (addedRegion)=>{
                addedRegion.start=region.end
                region.mergeWith(addedRegion)
                this.app.regionsController.removeRegion(region)
                this.app.regionsController.addRegion(track,region)
            }
        )
    }

    private async stopRecordingWith(track:Track, recorderType:RecorderFactory<any>){
        let recorder= track.recorders.get(recorderType)
        if(!recorder)return
        await recorder.stop()
    }

    /** Toggles the recording status of the controller. */
    async record() {
        const recording = !this.app.host.recording;
        this.app.host.recording = recording;
        if (recording) {
            let firstArmed = this.app.tracksController.tracks.find((e) => e._recording_recorder.size>0);

            // Start the recorders
            for (let track of this.app.tracksController.tracks) {
                await this.startRecording(track, this.app.host.playhead);
            }

            // Start the host recording
            if (!this.app.host.isPlaying) {
                this.app.hostController.play(true);
            }
            else if(!this.app.host.inRecordingMode){
                this.app.hostController.play();
                this.app.hostController.play(true);
            }
            
        }
        else {
            // Stop the recorders
            for (let track of this.app.tracksController.tracks) {
                await this.stopRecording(track);
            }
            this.app.hostController.play();
        }
        this.app.hostView.updateRecordButton(recording);
    }

    /**
     * Toggles the monitoring status of the given track.
     *
     * @param track - The track to toggle the monitoring status of.
     */
    clickMonitoring(track: Track) {
        track.monitored = !track.monitored
        if (track.monitored) {
            this.startMonitoring(track);
        }
        else {
            this.stopMonitoring(track);
        }
    }
}