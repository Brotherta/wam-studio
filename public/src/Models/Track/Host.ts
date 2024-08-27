import { WamNode } from "@webaudiomodules/sdk";
import { audioCtx } from "../..";
import App from "../../App";
import AudioGraph, { AudioGraphInstance } from "../../Audio/Graph/AudioGraph";
import ObservePlayerNode from "../../Audio/Players/Observer/ObservePlayerNode";
import ObservePlayerWAM from "../../Audio/Players/Observer/ObservePlayerWAM";
import SoundProviderElement from "../../Components/Editor/SoundProviderElement";
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
    private hostNode: ObservePlayerNode


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

        this.latency = 0;
        this.hostGroupId = "";

        this.recording = false;

        this.volume=1;
    }

    /**
     * Initialize the host node. It is used to control the global volume and the playhead.
     * It is asynchronous because it needs to load the WAM SDK and the AudioPlayerNode.
     */
    override async init() {
        const {default: initializeWamHost} = await import("@webaudiomodules/sdk/src/initializeWamHost");
        await audioCtx.audioWorklet.addModule(new URL('../../Audio/HostProcessor.js', import.meta.url));

        const [hostGroupId] = await initializeWamHost(audioCtx);
        this.hostGroupId = hostGroupId;
        // @ts-ignore
        this.groupId = hostGroupId

        await super.init()

        
        this.hostNode = (await ObservePlayerWAM.createInstance(hostGroupId,audioCtx)).audioNode as ObservePlayerNode
        this.hostNode.on_update.add(playhead=>{
            this.onPlayHeadMove.forEach(it=>it(playhead,true))
            this._playhead = playhead
        })
        this.hostNode.connect(this.audioInputNode)
        this.outputNode.connect(audioCtx.destination)

        this.playhead = 0;
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
    public onPlayHeadMove= new Set<(position:number, movedByPlaying: boolean)=>void>()

    private _playhead: number

    public override get playhead(){ return this._playhead }
    public override set playhead(value: number){
        this._playhead=value
        this.hostNode.playhead=value
        this.onPlayHeadMove.forEach(it=>it(value,false))
        for(const track of this.tracks) track.playhead=value
    }


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
        this.hostNode.isPlaying=true
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
        this.hostNode.isPlaying=false
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
        this.hostNode.setLoop(range)
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
    
    dispose(): void {
        this.soundProvider.dispose()
        for(const track of this.tracks) track.dispose()
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
