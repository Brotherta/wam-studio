import { WamNode } from "@webaudiomodules/api";
import App from "../../../App";
import OperableAudioBuffer from "../../../Audio/OperableAudioBuffer";
import { RingBuffer } from "../../../Audio/Utils/Ringbuffer";
import { URLFromFiles } from "../../../Audio/Utils/UrlFiles";
import SampleRecorderNode from "../../../Audio/WAM/SampleRecorderNode";
import SampleRecorderWAM from "../../../Audio/WAM/SampleRecorderWAM";
import TrackElement from "../../../Components/Editor/TrackElement";
import { NUM_CHANNELS } from "../../../Env";
import SampleRegion from "../../../Models/Region/SampleRegion";
import { observed } from "../../../Utils/observable/class_annotation";
import { RegionRecorder } from "./RegionRecorder";

export class SampleRegionRecorder implements RegionRecorder<SampleRegion> {
    
    public worker: Worker;

    public sab: SharedArrayBuffer;

    public recorder: SampleRecorderNode;

    public app: App

    @observed({
        set(this: SampleRegionRecorder, value?: TrackElement) {
            if(value){
                value.isStereoMode=this.isStereo
                value.isMerge=this.isMerged
                value.isLeft=this.left
                value.isRight=this.right
                value.isSampleRecording=this.isRecording
                value.isSampleRecordVisible=true
            }
        },
    })
    public trackElement?: TrackElement

    private constructor(){}
    static async create(app: App, audioContext: BaseAudioContext, groupId: string): Promise<SampleRegionRecorder> {
        const recorder = new this()

        recorder.app=app

        // Build the worker file
        let url1 = new URL("../../../Audio/Utils/wav-writer.js", import.meta.url)
        let url2 = new URL("../../../Audio/Utils/Ringbuffer/index.js", import.meta.url)
        const file=await URLFromFiles([url1, url2])

        // Create the sab
        recorder.sab= RingBuffer.getStorageForCapacity(audioContext.sampleRate*2, Float32Array)

        // Create the nodes
        recorder.splitterNode= audioContext.createChannelSplitter(NUM_CHANNELS)
        recorder.mergerNode= audioContext.createChannelMerger(NUM_CHANNELS)
        recorder.recorder= (await SampleRecorderWAM.createInstance(groupId,audioContext,{})).audioNode as SampleRecorderNode
        recorder.linkNodes()
        recorder.mergerNode.connect(recorder.recorder)
        app.settingsController.updateMediaDevices()
        app.settingsController.soundInputNode.connect(recorder.splitterNode)
        recorder.recorder!.port.postMessage({ sab: recorder.sab });

        // Create the worker
        recorder.worker = new Worker(file)
        recorder.worker.postMessage({
            command: "init",
            sab: recorder.sab,
            channelCount: 2,
            sampleRate: audioContext.sampleRate,
        });
        recorder.recorder.port.postMessage({ arm: true });

        // Set the onmessage callback
        recorder.worker!.onmessage = async (e) => {
            if(["audioBufferCurrentUpdated","audioBufferFinal"].includes(e.data.command)){

                // Get the buffer
                const pcm = new Float32Array(e.data.buffer);
                console.log(pcm.length)
                let audioBuffer
                if(pcm.length>=2){
                    audioBuffer= OperableAudioBuffer.create({ length: pcm.length / 2, sampleRate: audioContext.sampleRate, numberOfChannels: NUM_CHANNELS})
                    const left = audioBuffer.getChannelData(0);
                    const right = audioBuffer.getChannelData(1);
                    for (let i = 0; i < pcm.length; i += 2) {
                        left[i / 2] = pcm[i];
                        right[i / 2] = pcm[i + 1];
                    }
                }
                else audioBuffer= null
                
                // Send message
                console.log(e.data.command, audioBuffer?.length)
                switch(e.data.command){
                    case "audioBufferCurrentUpdated":
                        if(audioBuffer)recorder.on_recording_update(new SampleRegion(audioBuffer,0))
                        break
                    case "audioBufferFinal":{
                        if(audioBuffer)recorder.on_recording_stop(new SampleRegion(OperableAudioBuffer.create({length:1, sampleRate:audioContext.sampleRate, numberOfChannels: NUM_CHANNELS}),0))
                        recorder.isRecording=false
                        recorder._stop_resolver?.()
                        break
                    }
                }
            }
        }
        return recorder;
        
    }

    private on_recording_update: (addedRegion: SampleRegion) => void = ()=>{}

    private on_recording_stop: (addedRegion: SampleRegion) => void = ()=>{}

    connect(node: WamNode): void { this.mergerNode.connect(node) }

    disconnect(node: WamNode): void { this.mergerNode.disconnect(node) }

    start(on_update:(addedRegion:SampleRegion)=>void, on_stop:(addedRegion:SampleRegion)=>void): void {
        this.isRecording=true
        this.linkNodes()
        this.on_recording_update=on_update
        this.on_recording_stop=on_stop
        this.worker.postMessage({ command: "startWorker" });
        this.recorder.port.postMessage({ "startRecording": true });
        console.log("start recording")
    }

    stop(): Promise<void> {
        this.linkNodes()

        // Setup the stop resolver
        const old_resolver= this._stop_resolver
        const new_promise= new Promise<void>(resolve=>{ this._stop_resolver=resolve })
        if(old_resolver) new_promise.then(()=>old_resolver())

        // Stop the worker
        this.worker.postMessage({ command: "stopAndSendAsBuffer" });
        this.recorder.port.postMessage({ "stopRecording": true });

        return new_promise
    }

    private _is_recording=false

    private _stop_resolver?: ()=>void

    dispose(): void {
        this.app.settingsController.soundInputNode.disconnect(this.splitterNode)
        this.recorder.port.postMessage({ "stopRecording": true });
        this.worker.terminate()
        this.recorder.destroy()
    }


    /* ~ CHANNEL CONFIGURATION ~ */

    private splitterNode: ChannelSplitterNode;
    
    private mergerNode: ChannelMergerNode;

    private linkNodes() {
        try {
            this.splitterNode.disconnect()
        } catch (e) { }

        if (this.isStereo) {
            if (this.isMerged) {
                this.splitterNode.connect(this.mergerNode, 0, 0);
                this.splitterNode.connect(this.mergerNode, 1, 0);
                this.splitterNode.connect(this.mergerNode, 0, 1);
                this.splitterNode.connect(this.mergerNode, 1, 1);
            } else {
                this.splitterNode.connect(this.mergerNode, 0, 0);
                this.splitterNode.connect(this.mergerNode, 1, 1);
            }
        } else {
            if (this.isMerged) {
                this.splitterNode.connect(this.mergerNode, 0, 0);
                this.splitterNode.connect(this.mergerNode, 0, 1);
            } else {
                if (this.left) {
                    this.splitterNode.connect(this.mergerNode, 0, 0);
                    this.splitterNode.connect(this.mergerNode, 0, 1);
                }
                if (this.right) {
                    this.splitterNode.connect(this.mergerNode, 1, 0);
                    this.splitterNode.connect(this.mergerNode, 1, 1);
                }
            }
        }
    }

    /** The stereo state of the track. It is used to know if the track is stereo or mono. */
    set isStereo(value: boolean) {
        this._stereo = value
        if(this.trackElement)this.trackElement.isStereoMode=value
        this.linkNodes()
    }
    get isStereo() { return this._stereo; }
    private _stereo = true;

    /**
     * Is the recorder listening to its input.
     * If not, its output will be silent.
     */
    private set isRecording(value: boolean) {
        this._is_recording = value
        if(this.trackElement)this.trackElement.isSampleRecording=value
    }
    get isRecording() { return this._is_recording; }

    /** The merge state of the track. It is used to know if the track is merged or not. */
    set isMerged(value: boolean) {
        this._merge = value
        if(this.trackElement)this.trackElement.isMerge=value
        this.linkNodes()
    }
    get isMerged() { return this._merge }
    private _merge = false;

    /** The left state of the track. It is used to know if the track is left or right when recording. */
    set left(value: boolean) {
        this._left = value
        if(this.trackElement)this.trackElement.isLeft=value
        this.linkNodes()
    }
    get left() { return this._left }
    private _left = true;

    /** The right state of the track. It is used to know if the track is left or right when recording. */
    set right(value: boolean) {
        this._right = value
        if(this.trackElement)this.trackElement.isRight=value
        this.linkNodes()
    }
    get right() { return this._right }
    private _right = false
}
