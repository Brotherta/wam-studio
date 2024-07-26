import { addFunctionModule, WamNode, WebAudioModule } from "@webaudiomodules/sdk";
import getSampleRecorderProcessor from "./SampleRecorderProcessor";

export default class SampleRecorderNode extends WamNode {

    static override async addModules(audioCtx: AudioContext, moduleId: any) {
        const {audioWorklet} = audioCtx;
        await super.addModules(audioCtx, moduleId);
        await addFunctionModule(audioWorklet, getSampleRecorderProcessor, moduleId);
    }

    constructor(module: WebAudioModule) {
        super(module,
            {
                numberOfInputs: 1,
                numberOfOutputs: 1,
                outputChannelCount: [2]
            });
    }

    /**
     * Send the audio to the audio worklet.
     * @param audio
     */
    setAudio(audio: Float32Array[]) {
        this.port.postMessage({audio});
    }

    /**
     * Remove the audio from the audio worklet.
     */
    removeAudio() {
        this.port.postMessage({"removeAudio": true})
    }

    play() {
        const playingParam = this.parameters.get("playing");
        if (playingParam) {
            playingParam.value = 1;
        } else {
            console.error('Parameter "playing" does not exist.');
        }
    }

    pause() {
        const playingParam = this.parameters.get("playing");
        if (playingParam) {
            playingParam.value = 0;
        } else {
            console.error('Parameter "playing" does not exist.');
        }
    }

    loop(active: boolean) {
        const loopingParam = this.parameters.get("loop");
        if (loopingParam) {
            loopingParam.value = active ? 1 : 0;
        } else {
            console.error('Parameter "looping" does not exist.');
        }
    }

    /**
     * Set the playhead position in sample
     */
    set playhead(value: number) {
        this.port.postMessage({playhead:value})
    }

    /**
     * Set the loop start and end in sample
     * @param start in sample
     * @param end in sample
     */
    setLoop(start:number, end:number){
        this.port.postMessage({
            loopStart: start,
            loopEnd: end,
        });
    }
}