import { audioCtx } from "..";
import App from "../App";
import AudioPlayerNode from "../Audio/AudioNode";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import { MAX_DURATION_SEC, SAMPLE_RATE } from "../Utils";


export default class Host {

    app: App;
    audioCtx: AudioContext;
    hostGroupId: string = "";

    oldGlobalVolume: number;
    globalVolume: number;
    timer: number;
    playhead: number;

    hostNode: AudioPlayerNode | undefined;
    gainNode: GainNode;
    
    constructor(app: App) {
        this.app = app;
        this.audioCtx = audioCtx;
        this.globalVolume = 0.5;
        this.oldGlobalVolume = 0.0;
        this.timer = 0;
        this.playhead = 0;
        
        this.gainNode = this.audioCtx.createGain()
        this.setVolume(0.5);    
        this.gainNode.connect(this.audioCtx.destination);
    }

    async initWAM() {
        const {default: initializeWamHost} = await import("@webaudiomodules/sdk/src/initializeWamHost");
        const {default: AudioPlayerNode} = await import("../Audio/AudioNode");
        await this.audioCtx.audioWorklet.addModule(new URL('../Audio/HostProcessor.js', import.meta.url));

        const [hostGroupId] = await initializeWamHost(audioCtx);
        this.hostGroupId = hostGroupId;

        let audio = audioCtx.createBuffer(2, MAX_DURATION_SEC * SAMPLE_RATE, SAMPLE_RATE)
        const operableAudioBuffer = Object.setPrototypeOf(audio, OperableAudioBuffer.prototype) as OperableAudioBuffer;
        
        this.hostNode = new AudioPlayerNode(this.audioCtx, 2);
        this.hostNode.setAudio(operableAudioBuffer.toArray());

        this.hostNode.port.onmessage = ev => {
            if (ev.data.playhead) {
                this.playhead = ev.data.playhead;
            }
        }
    }



    setVolume(value: number) {
        this.globalVolume = value;
        this.gainNode.gain.value = this.globalVolume;
    }

    muteHost() {
        this.oldGlobalVolume = this.globalVolume;
        this.setVolume(0);
    }

    unmuteHost() {
        this.setVolume(this.oldGlobalVolume);
    }
}