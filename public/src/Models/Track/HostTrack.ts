import { audioCtx } from "../..";
import App from "../../App";
import AudioPlayerNode from "../../Audio/AudioNode";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import TrackElement from "../../Components/TrackElement";
import { BACKEND_URL, MAX_DURATION_SEC } from "../../Env";
import Plugin from "../Plugin";
import { Region } from "../Region/Region";
import TrackOf from "./Track";

/**
 * Host class that contains the master track.
 * It is used to control the global volume and the playhead.
 */
export default class HostTrack extends TrackOf<Region> {

    /**
     * Id of the host group.
     */
    public hostGroupId: string;
    /**
     * Playhead of the host.
     */
    public playhead: number;
    /**
     * Latency of the host.
     */
    public latency: number;
    /**
     * Host node.
     */
    public hostNode: AudioPlayerNode | undefined;
    /**
     * WAM instance.
     */
    public pluginWAM: any;
    /**
     * Boolean that indicates if the host is playing.
     */
    public playing: boolean;
    /**
     * Boolean that indicates if the host is recording.
     */
    public recording: boolean;
    /**
     * Boolean that indicates if the host is looping.
     */
    public looping: boolean;

    /**
     * Volume of the host for the mute and unmute.
     */
    private muteBeforeMute: number;
    metronome: any;
    metronomeOn: any;
    MetronomeElement: any;
    
    constructor(app: App) {
        super(-1, new TrackElement());
        this.volume = 0.5;
        this.muteBeforeMute = this.volume
        this.playhead = 0;
        this.latency = 0;
        this.hostGroupId = "";

        this.muted = false;
        this.playing = false;
        this.recording = false;
        this.looping = false;

        this.volume=1;
        this.plugin = new Plugin(app);
        this.outputNode.connect(audioCtx.destination)
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
        const operableAudioBuffer = Object.setPrototypeOf(audio, OperableAudioBuffer.prototype) as OperableAudioBuffer;
        
        this.hostNode = new AudioPlayerNode(audioCtx, 2);
        this.hostNode.setAudio(operableAudioBuffer.toArray());
        this.outputNode.connect(this.hostNode);
    }

    /**
     * Set the start and end of the loop.
     *
     * @param leftTime - Start of the loop in milliseconds.
     * @param rightTime - End of the loop in milliseconds.
     */
    public override updateLoopTime(leftTime: number, rightTime: number): void {
        this.loopStart = leftTime;
        this.loopEnd = rightTime;
        
    }

    public override _onLoopChange(leftTime: number, rightTime: number): void {
        const startBuffer = Math.floor(leftTime / 1000 * audioCtx.sampleRate);
        const endBuffer = Math.floor(rightTime / 1000 * audioCtx.sampleRate);
        if (this.hostNode) {
            this.hostNode.port.postMessage({loop: this.looping, loopStart: startBuffer, loopEnd: endBuffer});
        }
    }

    public override update(context: AudioContext, playhead: number): void { }

    protected override _connectPlugin(node: AudioNode): void { }

    public override play(): void { }

    public override pause(): void { }

    public override loop(value: boolean): void { this.looping = value }

}