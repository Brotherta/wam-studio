import { audioCtx } from "../..";
import App from "../../App";
import AudioPlayerNode from "../../Audio/AudioNode";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import TrackElement from "../../Components/TrackElement";
import { BACKEND_URL, MAX_DURATION_SEC } from "../../Env";
import Plugin from "../Plugin";
import Track from "./Track";
/**
 * Host class that contains the master track.
 * It is used to control the global volume and the playhead.
 */
export default class HostTrack extends Track {

    /**
     * Id of the host group.
     */
    public hostGroupId: string

    /**
     * Latency of the host.
     */
    public latency: number

    /**
     * Host node.
     */
    private hostNode: AudioPlayerNode | undefined

    /**
     * WAM instance.
     */
    public pluginWAM: any

    /**
     * Boolean that indicates if the host is recording.
     */
    public recording: boolean

    private looping: boolean

    /**
     * The node whom the children tracks outputNodes are connected.
     */
    public mainNode: GainNode

    metronome: any;
    metronomeOn: any;
    MetronomeElement: any;
    
    private tracks: Iterable<Track>

    /**
     * Create a new host track, a compisite track composed of multiple tracks.
     * @param app The app
     * @param tracks Its children tracks
     */
    constructor(app: App, tracks: Iterable<Track>) {
        super(new TrackElement());
        this.tracks=tracks
        this.playhead = 0;
        this.latency = 0;
        this.hostGroupId = "";

        this.recording = false;
        this.looping = false;

        this.volume=1;
        this.plugin = new Plugin(app);
        this.mainNode = audioCtx.createGain();
        this.outputNode.connect(audioCtx.destination)
        this.postInit()
    }

    /**
     * Initialize the host node. It is used to control the global volume and the playhead.
     * It is asynchronous because it needs to load the WAM SDK and the AudioPlayerNode.
     */
    async initWAM() {
        const {default: WAM} = await import(/* webpackIgnore: true */BACKEND_URL+"/src/index.js");
        this.pluginWAM = WAM;

        const {default: initializeWamHost} = await import("@webaudiomodules/sdk/src/initializeWamHost");
        const {default: AudioPlayerNode} = await import("../../Audio/AudioNode");
        await audioCtx.audioWorklet.addModule(new URL('../../Audio/HostProcessor.js', import.meta.url));

        const [hostGroupId] = await initializeWamHost(audioCtx);
        this.hostGroupId = hostGroupId;

        let audio = audioCtx.createBuffer(2, MAX_DURATION_SEC * audioCtx.sampleRate, audioCtx.sampleRate)
        const operableAudioBuffer = OperableAudioBuffer.make(audio);
        
        this.hostNode = new AudioPlayerNode(audioCtx, 2);
        this.hostNode.port.onmessage = (event) => {
            if(event.data.playhead){
                const playhead = (event.data.playhead/audioCtx.sampleRate)*1000;
                this.onPlayHeadMove?.(playhead)
                this._playhead = playhead;
            }
            else if(event.data.volume){
                this.current_volume = event.data.volume;
            }
        }
        this.hostNode.setAudio(operableAudioBuffer.toArray());
        this.outputNode.connect(this.hostNode);
    }

    private previousTracks: Track[]=[]
    public override update(context: AudioContext, playhead: number): void {
        // Cleanup
        for(const track of this.previousTracks){
            try{
                track.outputNode.disconnect(this.mainNode)
                track.monitoredOutputNode.disconnect(this.outputNode)
            }catch(_){}
        }
        this.previousTracks=[]

        // Connections
        for(const track of this.tracks){
            this.previousTracks.push(track)
            if (track.modified){
                track.update(context, playhead)
                track.playhead=this.playhead
                track.modified=false
            }
            if (this.inRecordingMode)track.monitoredOutputNode.connect(this.mainNode)
            else track.outputNode.connect(this.mainNode)
        }
    }

    override _connect(node: AudioNode): void {
        this.mainNode.connect(node)
    }

    override _disconnect(node: AudioNode): void {
        this.mainNode.disconnect(node)
    }


    /* PLAYHEAD */
    /** Called when the playhead is moved, with the new position in milliseconds */
    public onPlayHeadMove?: (position:number)=>void

    private _playhead: number

    public override get playhead(){ return this._playhead }
    public override set playhead(value: number){
        this._playhead=value
        this.hostNode?.port.postMessage({playhead: value*audioCtx.sampleRate/1000});
        this.onPlayHeadMove?.(value)
        for(const track of this.tracks) track.playhead=value
    }


    /* ANALYSIS */
    public current_volume=0


    /* PLAY AND PAUSE */
    private _playing: boolean=false

    public get isPlaying(){
        return this._playing
    }

    public override play(): void {
        // Setup children tracks
        for(const track of this.tracks){
            track.loop(this.looping)
            track.updateLoopTime(this.leftTime, this.rightTime)
        }

        // Setup host node for playhead movement, loop, volume display
        if(this.hostNode){
            this.hostNode?.loop(this.looping)
            this.hostNode.port.postMessage({
                loopStart: Math.floor(this.leftTime / 1000 * audioCtx.sampleRate),
                loopEnd: Math.floor(this.rightTime / 1000 * audioCtx.sampleRate),
            })
        }

        // Play
        for(const track of this.tracks) track.play()
        this.hostNode?.play()
        this._playing=true

        // Check for updates while playing
        const host=this
        setTimeout(function updateTrack(){
            if(host.modified)host.update(audioCtx, host.playhead)
            if (host._playing) setTimeout(updateTrack, 300)
        },300)
    }

    public override pause(): void {
        for(const track of this.tracks) track.pause()
        this.hostNode?.pause()
        this._playing=false
    }

    
    /** MONITORING */
    private _recordingMode=false
    set inRecordingMode(value: boolean){
        this._recordingMode=value
        this.modified=true
    }
    get inRecordingMode(){return this._recordingMode}


    /** LOOP */
    public override loop(value: boolean): void {
        this.looping=value
        this.hostNode?.loop(value)
        for(const track of this.tracks) track.loop(value)
    }

    private leftTime: number=0
    private rightTime: number=10
    public override updateLoopTime(leftTime: number, rightTime: number): void {
        super.updateLoopTime(leftTime, rightTime)
        this.leftTime=leftTime
        this.rightTime=rightTime
        this.hostNode?.port.postMessage({
            loopStart: Math.floor(this.leftTime / 1000 * audioCtx.sampleRate),
            loopEnd: Math.floor(this.rightTime / 1000 * audioCtx.sampleRate),
        })
        for(const track of this.tracks) track.updateLoopTime(leftTime, rightTime)
    }

    /**
     * Is the host looping?
     */
    public get doLoop(){ 
        return this.looping
    }

    protected override _isModified(): boolean {
        for(const track of this.tracks){
            if (track.modified) return true
        }
        return false
    }
}