import { WamNode } from "@webaudiomodules/sdk";
import { audioCtx } from "../..";
import App from "../../App";
import AudioPlayerNode from "../../Audio/AudioNode";
import AudioGraph, { AudioGraphInstance } from "../../Audio/Graph/AudioGraph";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import SoundProviderElement from "../../Components/Editor/SoundProviderElement";
import { MAX_DURATION_SEC } from "../../Env";
import { ReadOnlyObservableArray } from "../../Utils/observable/observables";
import SoundProvider, { SoundProviderGraphInstance } from "./SoundProvider";
import Track, { TrackGraphInstance } from "./Track";
/**
 * Host class that work as the master sound provider.
 * Its output is the combined output of all the tracks.
 */
export default class Host extends SoundProvider {

    /**
     * Id of the host group.
     */
    public hostGroupId: string

    /**
     * Latency of the host in milliseconds.
     */
    public latency: number

    /**
     * Host node.
     */
    private hostNode: AudioPlayerNode | undefined


    /**
     * Boolean that indicates if the host is recording.
     */
    public recording: boolean

    metronome: any;
    metronomeOn: any;
    MetronomeElement: any;
    
    private tracks: ReadOnlyObservableArray<Track>

    public inRecordingMode=false

    /**
     * Create a new host track, a compisite track composed of multiple tracks.
     * @param app The app
     * @param tracks Its children tracks
     */
    constructor(app: App, audioContext: BaseAudioContext, tracks: ReadOnlyObservableArray<Track>) {
        super(new SoundProviderElement(),"NO_GROUP_ID", audioContext);
        this.tracks=tracks
        this.tracks_listener_remove= this.onTrackRemove.bind(this)
        this.tracks_listener_add= this.onTrackAdd.bind(this)
        this.tracks.addListener("remove",this.tracks_listener_remove)
        this.tracks.addListener("add",this.tracks_listener_add)
        this.tracks.forEach(it=>this.onTrackAdd(it))

        this.playhead = 0;
        this.latency = 0;
        this.hostGroupId = "";

        this.recording = false;

        this.volume=1;
        this.outputNode.connect(audioCtx.destination)
    }

    /**
     * Initialize the host node. It is used to control the global volume and the playhead.
     * It is asynchronous because it needs to load the WAM SDK and the AudioPlayerNode.
     */
    async initWAM() {
        const {default: initializeWamHost} = await import("@webaudiomodules/sdk/src/initializeWamHost");
        const {default: AudioPlayerNode} = await import("../../Audio/AudioNode");
        await audioCtx.audioWorklet.addModule(new URL('../../Audio/HostProcessor.js', import.meta.url));

        const [hostGroupId] = await initializeWamHost(audioCtx);
        this.hostGroupId = hostGroupId;
        // @ts-ignore
        this.groupId = hostGroupId

        let audio = audioCtx.createBuffer(2, MAX_DURATION_SEC * audioCtx.sampleRate, audioCtx.sampleRate)
        const operableAudioBuffer = OperableAudioBuffer.make(audio);
        
        this.hostNode = new AudioPlayerNode(audioCtx, 2);
        this.hostNode.port.onmessage = (event) => {
            if(event.data.playhead){
                const playhead = (event.data.playhead/audioCtx.sampleRate)*1000
                this.onPlayHeadMove.forEach(it=>it(playhead))
                this._playhead = playhead;
            }
            else if(event.data.volume){
                this.current_volume = event.data.volume;
            }
        }
        this.hostNode.setAudio(operableAudioBuffer.toArray());
        this.outputNode.connect(this.hostNode);
    }

    public override update(context: AudioContext, playhead: number): void {
        for(const track of this.tracks){
            track.playhead=this.playhead
            if (track.modified){
                track.update(context, playhead)
                track.modified=false
            }
        }
    }

    /* PLAYHEAD */
    /** Called when the playhead is moved, with the new position in milliseconds */
    public onPlayHeadMove= new Set<(position:number)=>void>()

    private _playhead: number

    public override get playhead(){ return this._playhead }
    public override set playhead(value: number){
        this._playhead=value
        this.hostNode?.port.postMessage({playhead: value*audioCtx.sampleRate/1000});
        this.onPlayHeadMove.forEach(it=>it(value))
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
        // Update loop time
        this.setLoop(this.loopRange)

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


    /** ON CHANGE */
    private tracks_listener_remove: (removed:Track)=>void
    private tracks_listener_add: (added:Track)=>void

    private onTrackAdd(track: Track){
        track.outputNode.connect(this.audioInputNode)
        track.setLoop(this.loopRange)
        track.playhead=this.playhead
        if(this._playing) track.play()
        else track.pause()
    }

    private onTrackRemove(track: Track){
        track.outputNode.disconnect(this.audioInputNode)
    }


    /** LOOP */
    override setLoop(range: [number, number] | null): void {
        super.setLoop(range)
        if(this.loopRange){
            this.hostNode?.loop(true)
            this.hostNode?.port.postMessage({
                loopStart: Math.floor(this.loopRange[0] / 1000 * audioCtx.sampleRate),
                loopEnd: Math.floor(this.loopRange[1] / 1000 * audioCtx.sampleRate),
            })
        }
        else this.hostNode?.loop(false)
        for(const track of this.tracks) track.setLoop(this.loopRange)
    }

    protected override _isModified(): boolean {
        for(const track of this.tracks){
            if (track.modified) return true
        }
        return false
    }

    onDestroy(){
        for(const track of this.tracks) this.onTrackRemove(track)
        this.tracks.removeListener("remove",this.tracks_listener_remove)
        this.tracks.removeListener("add",this.tracks_listener_add)
    }

    /** Audio Graph Creation */
    /**
     * Get the sound provider graph of this sound provider.
     */
    get host_graph(){
        const that=this
        return this._host_graph=this._host_graph ?? {
        async instantiate(audioContext: BaseAudioContext, groupId: string) {
            // Create sound provider graph
            const audioProviderInstance=await that.sound_provider_graph.instantiate(audioContext,groupId)

            // Create players graph
            const tracks=await Promise.all([...that.tracks].map(it=>it.track_graph.instantiate(audioContext,groupId)))
            for(const track of tracks){
                track.connect(audioProviderInstance.inputNode)
                if(audioProviderInstance.plugin)track.connectEvents(audioProviderInstance.plugin.audioNode)
            }
            return new HostGraphInstance(audioProviderInstance,tracks)
        }
        }
    }

    private _host_graph: AudioGraph<HostGraphInstance>|null=null
}


export class HostGraphInstance implements AudioGraphInstance{

    constructor(
        public soundProvider: SoundProviderGraphInstance,
        public tracks: TrackGraphInstance[]
    ){}

    connect(destination: AudioNode): void { this.soundProvider.connect(destination) }
    connectEvents(destination: WamNode): void { this.soundProvider.connectEvents(destination) }
    disconnect(destination?: AudioNode | undefined): void { this.soundProvider.disconnect(destination) }
    disconnectEvents(destination?: WamNode | undefined): void { this.soundProvider.disconnectEvents(destination) }
    
    destroy(): void {
        this.soundProvider.destroy()
        for(const track of this.tracks) track.destroy()
    }

    set playhead(value: number){
        for(const track of this.tracks) track.playhead=value
    }

    public play(): void {
        for(const track of this.tracks) track.isPlaying=true
    }

    public playEfficiently(start: number, duration: number): Promise<void>{
        return Promise.all(this.tracks.map(player=>player.playEfficiently(start,duration))).then(()=>{})
    }

}
