

class AudioPlayerNode extends AudioWorkletNode {

    constructor(context: BaseAudioContext, channelCount: number) {

        super(context, "host-processor", {
            numberOfInputs: 1,
            numberOfOutputs: 2,
            outputChannelCount: [channelCount, channelCount],
        });
    }

    /**
     * Send the audio to the audio worklet.
     * @param audio
     */
    setAudio(audio: Float32Array[]) {
        this.port.postMessage({audio});
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
}

export default AudioPlayerNode;
