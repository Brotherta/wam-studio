import App from "../../App";
import { RegionOf } from "../../Models/Region/Region";
import Track from "../../Models/Track/Track";
import { MIDIRegionRecorder } from "./Recorders/midi/MIDIRegionRecorder";
import { RegionRecorder } from "./Recorders/RegionRecorder";
import { RecorderFactory } from "./Recorders/RegionRecorderManager";
import { SampleRegionRecorder } from "./Recorders/SampleRegionRecorder";



export type CRecorderFactory<T extends RegionRecorder<any>> = RecorderFactory<{app:App,track:Track},T>

export default class RecorderController {

    /* -~- RECORDERS -~- */
    static SAMPLE_RECORDER:CRecorderFactory<SampleRegionRecorder>= async ({app,track}) =>{
        const recorder= await SampleRegionRecorder.create(app, track.audioContext, track.groupId)
        recorder.trackElement= track.element
        return recorder
    }

    static MIDI_RECORDER:CRecorderFactory<MIDIRegionRecorder>= async ({app,track}) => {
        const recorder= await MIDIRegionRecorder.create(app)
        recorder.element=track.element
        return recorder
    }

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    /** Starts monitoring on the given track. */
    startMonitoring(track: Track) { if(track.recorders.armeds.size>0) track.monitored= true }

    /** Stops monitoring on the given track. */
    stopMonitoring(track: Track) { track.monitored = false }

    /** Stops recording all armed tracks. */
    stopRecordingAllTracks() {
        for (let track of this.app.tracksController.tracks) {
            this.stopRecording(track);
        }
    }

    /** Activate a recorder on the given track. */
    armRecorder(track: Track, recorder: CRecorderFactory<any>) {
        if(!track.recorders.isArmed(recorder)){
            track.recorders.arm(recorder)
            if(this.app.host.recording) this.startRecordingWith(track,recorder)
        }
    }

    /** Deactivate a recorder on the given track. */
    disarmRecorder(track: Track, recorder: CRecorderFactory<any>) {
        if(track.recorders.disarm(recorder)){
            if(track.recorders.armeds.size==0) track.monitored=false
            if(this.app.host.recording) this.stopRecordingWith(track,recorder)
        }
    }

    /** Toggle the armed status of the given recorder on the given track. */
    toggleArm(track: Track, recorder: CRecorderFactory<any>, force?: boolean) {
        if(force!==undefined){
            if(force) this.armRecorder(track,recorder)
            else this.disarmRecorder(track,recorder)
        }
        else{
            if(track.recorders.isArmed(recorder)) this.disarmRecorder(track,recorder)
            else this.armRecorder(track,recorder)
        }
    }

    /** Check if the given recorder is armed on the given track. */
    isArmed(track: Track, recorder: CRecorderFactory<any>) {
        return track.recorders.isArmed(recorder)
    }

    /**
     * Starts recording on the given track.
     * @param track - The track to start recording on.
     * @param playhead - The current playhead position in milliseconds.
     */
    async startRecording(track: Track, playhead: number) {
        this.app.host.recording = true;

        // Start the recorders
        const promises= [...track.recorders.armeds].map(recorder=>this.startRecordingWith(track,recorder))
        
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
        const promises= [...track.recorders.armeds].map(recorder=>this.stopRecordingWith(track,recorder))
        
        // Wait till they are all stopped
        await Promise.all(promises)
    }

    /**
     * Start recording a region on the given track with the given recorder type.
     * @param track The track to record on
     * @param recorderType The type of recorder to use
     */
    private async startRecordingWith(track:Track, recorderType:CRecorderFactory<RegionRecorder<any>>){
        const recorder= await track.recorders.get(recorderType)

        // Start the recording
        const playhead=this.app.host.playhead
        let region: RegionOf<any>
        let onRecord = (addedRegion: RegionOf<any>)=>{
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
        }
        recorder.start(onRecord,onRecord)
    }

    private async stopRecordingWith(track:Track, recorderType:CRecorderFactory<any>){
        let recorder= await track.recorders.get(recorderType)
        if(!recorder)return
        await recorder.stop()
    }

    /** Toggles the recording status of the controller. */
    async record() {
        const recording = !this.app.host.recording;
        this.app.host.recording = recording;
        if (recording) {
            let firstArmed = this.app.tracksController.tracks.find((e) => e.recorders.armeds.size>0);

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