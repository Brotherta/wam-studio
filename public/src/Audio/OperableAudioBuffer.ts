import {audioCtx} from "../index";

class OperableAudioBuffer extends AudioBuffer {
    clone() {
        const newBuffer = new OperableAudioBuffer(this);
        for (let i = 0; i < this.numberOfChannels; i++) {
            const channel = this.getChannelData(i);
            newBuffer.copyToChannel(channel, i);
        }
        return newBuffer;
    }

    reverse() {
        for (let i = 0; i < this.numberOfChannels; i++) {
            const channel = this.getChannelData(i);
            channel.reverse();
        }
    }

    inverse() {
        for (let i = 0; i < this.numberOfChannels; i++) {
            const channel = this.getChannelData(i);
            for (let j = 0; j < channel.length; j++) {
                channel[j] = -channel[j];
            }
        }
    }

    /**
     * @param {AudioBuffer} that
     * @param {number} [numberOfChannels]
     */
    concat(that: AudioBuffer, numberOfChannels = this.numberOfChannels) {
        const {sampleRate} = this;
        const length = this.length + that.length;
        const buffer = new OperableAudioBuffer({numberOfChannels, length, sampleRate});
        const from = this.length;
        for (let i = 0; i < numberOfChannels; i++) {
            if (i < this.numberOfChannels) buffer.copyToChannel(this.getChannelData(i), i);
            if (i < that.numberOfChannels) buffer.copyToChannel(that.getChannelData(i), i, from);
        }
        return buffer;
    }

    /**
     * @param {number} from
     * @returns {[OperableAudioBuffer, OperableAudioBuffer]}
     */
    split(from: number) {
        if (from < 0) throw new RangeError("Split point is out of bound");
        if (from >= this.length || from == 0) {
            return [this, null];
        }

        const {length, sampleRate, numberOfChannels} = this;
        const buffer1 = new OperableAudioBuffer({length: from, numberOfChannels, sampleRate});
        const buffer2 = new OperableAudioBuffer({length: length - from, numberOfChannels, sampleRate});
        for (let i = 0; i < numberOfChannels; i++) {
            const channel1 = buffer1.getChannelData(i);
            const channel2 = buffer2.getChannelData(i);
            this.copyFromChannel(channel1, i);
            this.copyFromChannel(channel2, i, from);
        }
        return [buffer1, buffer2];
    }

    /**
     * @param {number} channel
     * @param {number} index
     * @param {number} value
     */
    write(channel: number, index: number, value: number) {
        if (channel > this.numberOfChannels) throw new Error(`Channel written ${channel} out of range ${this.numberOfChannels}`);
        if (index > this.length) throw new Error(`Index written ${index} out of range ${this.length}`);
        this.getChannelData(channel)[index] = value;
    }

    toArray(shared = false) {
        const supportSAB = typeof SharedArrayBuffer !== "undefined";
        /** @type {Float32Array[]} */
        const channelData = [];
        const {numberOfChannels, length} = this;
        for (let i = 0; i < numberOfChannels; i++) {
            if (shared && supportSAB) {
                channelData[i] = new Float32Array(new SharedArrayBuffer(length * Float32Array.BYTES_PER_ELEMENT));
                channelData[i].set(this.getChannelData(i));
            } else {
                channelData[i] = this.getChannelData(i);
            }
        }
        return channelData;
    }

    static mix(buffer1: OperableAudioBuffer, buffer2: OperableAudioBuffer) {
        let srcBuffer;
        let dstBuffer;
        if (buffer1.numberOfChannels >= buffer2.numberOfChannels) {
            dstBuffer = buffer1;
            srcBuffer = buffer2;
        }
        else {
            dstBuffer = buffer2;
            srcBuffer = buffer1;
        }
        const {length, numberOfChannels} = dstBuffer;

        for (let channel = 0; channel < numberOfChannels; channel++) {
            let nbChannelSrc = channel;
            const dstChannel = dstBuffer.getChannelData(channel);
            if (channel >= srcBuffer.numberOfChannels) nbChannelSrc--;
            const srcChannel = srcBuffer.getChannelData(nbChannelSrc);
            for (let i = 0; i < length; i++) {
                dstChannel[i] = srcChannel[i] + dstChannel[i]
            }
        }
        return dstBuffer;
    }

    /**
     * Transform a mono buffer to a stereo buffer.
     * @returns {OperableAudioBuffer}
     */
    makeStereo() {
        if (this.numberOfChannels != 1) return this;  // Already stereo or more.

        let stereoBuf = audioCtx.createBuffer(2, this.length, this.sampleRate);
        let stereoBuffer = Object.setPrototypeOf(stereoBuf, OperableAudioBuffer.prototype) as OperableAudioBuffer;
        let channelData = this.getChannelData(0);

        stereoBuffer.copyToChannel(channelData, 0);  // Copy to left channel.
        stereoBuffer.copyToChannel(channelData, 1);  // Copy to right channel.

        return stereoBuffer;
    }
}

export default OperableAudioBuffer;