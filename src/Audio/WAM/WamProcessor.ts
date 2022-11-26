// @ts-nocheck
import { AudioWorkletGlobalScope } from "@webaudiomodules/api";

const getProcessor = (moduleId: string) => {

    // @ts-ignore
    const audioWorkletGlobalScope: AudioWorkletGlobalScope = globalThis;
    const { registerProcessor } = audioWorkletGlobalScope;


    const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);

    const { WamProcessor } = ModuleScope;

    class MyWamProcessor extends WamProcessor {
        
        audio: Float32Array[][] | undefined;
        playhead: number = 0;

        // @ts-ignore
        constructor(options) {
            super(options);
        }

        async _onMessage(e: any) {
            await super._onMessage(e);
            if (e.data.audio) {
                this.audio = e.data.audio;
            }
            else if (e.data.position) {
                this.playhead = e.data.position;
                this.port.postMessage({playhead: this.playhead});
            }
            else if (e.data.removeAudio) {
                this.audio = undefined;
            }
        }

        static get parameterDescriptors() {
            return [
                {
                    name: "playing",
                    minValue: 0,
                    maxValue: 1,
                    defaultValue: 0,
                },
                {
                    name: "loop",
                    minValue: 0,
                    maxValue: 1,
                    defaultValue: 0, 
                }
            ];
        }

        _process() {}

        // @ts-ignore
        process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>) {
            if (!this.audio) return true;
            // console.log("play");
            
            const bufferSize: number = outputs[0][0].length;
            const audioLength: number = this.audio[0].length;

            const output: Float32Array[] = outputs[0];
            
            for (let i = 0; i < bufferSize; i++) {
                const playing = !!(i < parameters.playing.length ? parameters.playing[i] : parameters.playing[0]);
                const loop = !!(i < parameters.loop.length ? parameters.loop[i] : parameters.loop[0]);
                if (!playing) continue; // Not playing
                if (this.playhead >= audioLength) { // Play was finished
                    if (loop) this.playhead = 0; // Loop just enabled, reset playhead
                    else continue; // EOF without loop
                }
                const channelCount = Math.min(this.audio.length, output.length);
                for (let channel = 0; channel < channelCount; channel++) {
                    output[channel][i] = this.audio[channel][this.playhead];
                }
                this.playhead++;
            }

            return true;
        }

    }

    try {
        // @ts-ignore
        registerProcessor(moduleId, MyWamProcessor);
    } catch (error) {
        //console.warn(error);
    }
    return MyWamProcessor;
}

export default getProcessor;