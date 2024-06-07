import { audioCtx } from "../..";
import App from "../../App";
import AudioPlayerNode from "../../Audio/AudioNode";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import TrackElement from "../../Components/TrackElement";
import { BACKEND_URL, MAX_DURATION_SEC } from "../../Env";
import Plugin from "../Plugin";
import Region from "../Region/Region";
import TrackOf, { Track } from "./Track";

/**
 * Host class that contains the master track.
 * It is used to control the global volume and the playhead.
 */
export default class HostTrack extends TrackOf<Region> {

    /**
     * Id of the host group.
     */
    public hostGroupId: string

    /**
     * The host playhead position in sample.
     */
    public playhead: number

    /**
     * Latency of the host.
     */
    public latency: number

    /**
     * Host node.
     */
    public hostNode: AudioPlayerNode | undefined

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
        super(-1, new TrackElement());
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
        this.hostNode.setAudio(operableAudioBuffer.toArray());
        this.outputNode.connect(this.hostNode);
    }

    public override update(context: AudioContext, playhead: number): void {
        for(const track of this.tracks){
            if (track.modified)track.update(context, playhead)
        }
    }

    protected override _connectPlugin(node: AudioNode): void {
        this.mainNode.connect(node)
    }

    protected override _disconnectPlugin(node: AudioNode): void {
        this.mainNode.disconnect(node)
    }


    /* PLAY AND PAUSE */
    private _playing: boolean=false

    public get isPlaying(){
        return this._playing
    }

    public override play(): void {
        // Setup children tracks
        for(const track of this.tracks){
            track.loop(this.looping)
            track.outputNode.connect(this.mainNode)
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

        // Update tracks that are modifie while playing.
        const host=this
        setTimeout(function updateTrack(){
            for(const track of host.tracks){
                if (track.modified)track.update(audioCtx, 0)
            }
            if (host._playing) setTimeout(updateTrack, 100)
        },100)
    }

    public override pause(): void {
        for(const track of this.tracks) track.pause()
        this.hostNode?.pause()
        this._playing=false
    }


    /** LOOP */
    public override loop(value: boolean): void {
        this.looping=value
        this.hostNode?.loop(value)
        for(const track of this.tracks) track.loop(value)
    }

    private leftTime: number=0
    private rightTime: number=10
    public override _onLoopChange(leftTime: number, rightTime: number): void {
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