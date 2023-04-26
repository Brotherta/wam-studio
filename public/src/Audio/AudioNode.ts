

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
}

export default AudioPlayerNode;
