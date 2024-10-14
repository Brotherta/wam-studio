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
     * Starts recording on all armed tracks.
     * Don't play, just start recording.
     * The region are recordeds even if the playhead don't move.
     */
    async startRecordingAll(){
        if(!this.app.host.recording){
            for (let track of this.app.tracksController.tracks) await this.startRecording(track)
            this.app.hostView.updateRecordButton(true)
            this.app.host.recording=true
            this.app.hostView.updatePlayButton(this.app.host.isPlaying, true)
            for (let track of this.app.tracksController.tracks) if(track.recorders.armeds.size>0) this.app.host.forbidUpdate.add(track)
        }
    }

    /**
     * Stop recording on all armed tracks.
     * Don't stop playing, just stop recording.
     */
    async stopRecordingAll(){
        if(this.app.host.recording){
            for (let track of this.app.tracksController.tracks) await this.stopRecording(track)
            this.app.hostView.updateRecordButton(false)
            this.app.host.recording=false
            this.app.hostView.updatePlayButton(this.app.host.isPlaying, false)
            this.app.host.forbidUpdate.clear()
        }
    }

    get isRecording(){ return this.app.host.recording }

    /**
     * Starts recording on the given track.
     * @param track - The track to start recording on.
     * @param playhead - The current playhead position in milliseconds.
     */
    private async startRecording(track: Track) {
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
    private async stopRecording(track: Track) {
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
                this.app.regionsController.mergeRegionWith(region,addedRegion)
            }
        }
        recorder.start(onRecord,onRecord)
    }

    private async stopRecordingWith(track:Track, recorderType:CRecorderFactory<any>){
        let recorder= await track.recorders.get(recorderType)
        if(!recorder)return
        await recorder.stop()
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