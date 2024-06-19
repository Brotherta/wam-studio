
/**
 * A audio buffer decorator that add some operations to the AudioBuffer class.
 * @example
 * // You can operate on any AudioBuffer:
 * val buffer = OperableAudioBuffer.make(audioBuffer)
 * buffer.reverse()
 * 
 * // You can directly create a new OperableAudioBuffer:
 * val buffer = OperableAudioBuffer.create({numberOfChannels: 2, length: 44100, sampleRate: 44100})
 * 
 * // You can operate on a subpart of an AudioBuffer:
 * val buffer = OperableAudioBuffer.view(audioBuffer, 1000, 10000)
 * buffer.reverse()
 * 
 * // You can also use the buffer as a normal AudioBuffer:
 * val buffer = OperableAudioBuffer.create({numberOfChannels: 2, length: 44100, sampleRate: 44100})
 * buffer.copyToChannel(new Float32Array(44100), 0)
 * 
 */
export default abstract class OperableAudioBuffer implements AudioBuffer {

    /** FACTORIES */
    protected constructor(){}

    /**
     * Create a new OperableBuffer with its audio buffer.
     * @param options The options to create the buffer.
     * @returns The new OperableBuffer.
     */
    static create(options: ConstructorParameters<typeof AudioBuffer>[0]){
        return new BufferOperableAudioBuffer(new AudioBuffer(options))
    }

    /**
     * Create a new OperableBuffer for a given AudioBuffer.
     * @param audio The audio buffer to wrap.
     * @returns The new OperableBuffer.
     */
    static make(audio: AudioBuffer) {
        return new BufferOperableAudioBuffer(audio)
    }

    /**
     * Create a new OperableBuffer for a subpart of an AudioBuffer.
     * The new operablebuffer share the same data as the original buffer.
     * @param audio The audio buffer to wrap.
     * @param start The start index of the subpart.
     * @param length The length of the subpart.
     * @returns The new OperableBuffer.
     * @throws {RangeError} If the subpart is out of bound.
     */
    static view(audio: AudioBuffer, start: number, length?: number){
        return new SubOperableAudioBuffer(audio, start, length)
    }

    /** ABSTRACT METHODS */

    /** Get the length of the buffer in samples. */
    abstract get length(): number

    /** Get the sample rate of the buffer. */
    abstract get sampleRate(): number

    /** Get the number of channels of the buffer. */
    abstract get numberOfChannels(): number

    /** Get the data of a channel. */
    abstract getChannelData(channel: number): Float32Array

    /**
     * Copy data from a channel of the buffer.
     * @param destination The destination buffer to copy to.
     * @param channelNumber The channel number to copy from.
     * @param bufferOffset The optional offset of the channel source buffer to start copying from.
     */
    copyFromChannel(destination: Float32Array, channelNumber: number, bufferOffset: number | undefined=0): void{
        if(channelNumber>=this.numberOfChannels)throw new Error("Invalid channel number")
        if(bufferOffset>this.length)throw new Error("Invalid buffer offset")
        const from = this.getChannelData(channelNumber)
        const length = Math.min(destination.length, from.length-bufferOffset)
        for(let i=0; i<length; i++) destination[i] = from[i+bufferOffset]
    }

    /**
     * Copy data to a channel of the buffer.
     * @param source The source data to copy.
     * @param channelNumber The channel number to copy to.
     * @param bufferOffset An optional offset in the buffer.
     */
    copyToChannel(source: Float32Array, channelNumber: number, bufferOffset: number | undefined=0): void{
        if(channelNumber>=this.numberOfChannels)throw new Error("Invalid channel number")
        if(bufferOffset>this.length)throw new Error("Invalid buffer offset")
        const target = this.getChannelData(channelNumber)
        const length = Math.min(source.length, target.length-bufferOffset)
        for(let i=0; i<length; i++) target[i+bufferOffset] = source[i]
    }
    
    /** Get the duration of the audio buffer in seconds */
    get duration(){ return this.length/this.sampleRate }


    /** ESSENTIALS OPERATIONS */

    /**
     * Mix a source buffer into this buffer.
     * This buffer will keep its length and channel count.
     * @param {AudioBufferView} srcBuffer The source buffer.
     */
    mix(srcBuffer: AudioBuffer) {
        const length = Math.min(this.length, srcBuffer.length);
        const numberOfChannels = Math.min(this.numberOfChannels, srcBuffer.numberOfChannels);

        for (let channel = 0; channel < numberOfChannels; channel++) {
            const dstChannel = this.getChannelData(channel);
            const srcChannel = srcBuffer.getChannelData(channel);
            for (let i = 0; i < length; i++) dstChannel[i] += srcChannel[i];
        }
    }

    /**
     * Create a view on a subpart of this buffer.
     * @param start  The start index of the subpart.
     * @param length  The length of the subpart.
     * @returns 
     */
    view(start: number, length?: number){ return OperableAudioBuffer.view(this, start, length) }

    /**
     * Modify this buffer by applying a map function to each sample.
     * @param map The function to apply to each sample.
     */
    apply(map: (value: number, index: number, channel: number) => number) {
        for(let channel=0; channel<this.numberOfChannels; channel++){
            const data = this.getChannelData(channel);
            for(let i=0; i<this.length; i++) data[i] = map(data[i], i, channel);
        }
    }


    /** SHORTCUT OPERATIONS */

    /**
     * Clone this buffer.
     * @returns 
     */
    clone(){
        const newBuffer = OperableAudioBuffer.create(this);
        newBuffer.mix(this);
        return newBuffer;
    }

    /**
     * Merge two buffer into a new buffer.
     * Work like mix, but the merged buffer is a new buffer and has enough length and channels to contain both buffer.
     * @param {AudioBuffer} that The buffer to merge with.
     * @param {number} start_offset The offset between the start of this buffer and the start of that buffer. It can be negative.
     */
    merge(that: AudioBuffer, start_offset: number = 0){
        let before
        let after
        if(start_offset>=0){
            before = this
            after = that
        }
        else{
            before = that
            after = this
            start_offset = -start_offset
        }
        const sampleRate = this.sampleRate;
        const length = Math.max(before.length, after.length + start_offset);
        const numberOfChannels = Math.max(before.numberOfChannels, after.numberOfChannels);

        const buffer = OperableAudioBuffer.create({numberOfChannels, length, sampleRate});
        buffer.mix(before);
        buffer.view(start_offset).mix(after);
        return buffer;
    }

    /**
     * Concatenate two buffer into a new buffer.
     * With just enough channels and length to contain both buffer.
     * @param {AudioBuffer} that
     * @param {number} [numberOfChannels]
     */
    concat(that: AudioBuffer) {
        const {sampleRate} = this;
        const length = this.length + that.length;
        const numberOfChannels = Math.max(this.numberOfChannels, that.numberOfChannels);

        const buffer = OperableAudioBuffer.create({numberOfChannels, length, sampleRate});
        buffer.mix(this);
        buffer.view(this.length).mix(that);
        return buffer;
    }

    /**
     * Reverse the buffer in time.
     */
    reverse() {
        for (let i = 0; i < this.numberOfChannels; i++) {
            const channel = this.getChannelData(i);
            channel.reverse();
        }
    }

    /**
     * Invert the buffer in amplitude.
     */
    inverse() {
        for (let i = 0; i < this.numberOfChannels; i++) {
            const channel = this.getChannelData(i);
            for (let j = 0; j < channel.length; j++) {
                channel[j] = -channel[j];
            }
        }
    }
    

    /**
     * Split the buffer into two buffer at a given index.
     * @param {number} position in sample
     */
    split(position: number) {
        if (position <= 0 || position >=this.length) throw new RangeError("Split point is out of bound");
        return [this.view(0, position).clone(), this.view(position).clone()];
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

    /**
     * Copy the content of this buffer into an array.
     * @param shared Is the created buffer a SharedArrayBuffer if supported. 
     * @returns 
     */
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

    /**
     * Return a new stereo buffer with the same content.
     * If this buffer is already stereo or more, return this buffer.
     * Else return a new stereo buffer with the same content by duplicating the mono channel.
     * @returns {OperableAudioBuffer}
     */
    makeStereo() {
        if (this.numberOfChannels > 1) return this;  // Already stereo or more.

        let newBuffer = OperableAudioBuffer.create({numberOfChannels: 2, length: this.length, sampleRate: this.sampleRate});
        newBuffer.copyToChannel(this.getChannelData(0), 0);
        newBuffer.copyToChannel(this.getChannelData(0), 1);

        return newBuffer;
    }
}

class BufferOperableAudioBuffer extends OperableAudioBuffer {

    constructor(private buffer: AudioBuffer) {
        super();
    }

    override get length() { return this.buffer.length }
    override get sampleRate() { return this.buffer.sampleRate }
    override get numberOfChannels() { return this.buffer.numberOfChannels }
    override getChannelData(channel: number) { return this.buffer.getChannelData(channel) }
}

class SubOperableAudioBuffer extends OperableAudioBuffer {

    new_length

    constructor(private buffer: AudioBuffer, private new_start: number, new_length?: number) {
        super();
        if(new_length==undefined) this.new_length = buffer.length - new_start;
        else this.new_length = new_length;
        if(new_start+this.new_length>buffer.length) throw new RangeError("Subpart is out of bound");
    }

    override get length() { return this.new_length }
    override get sampleRate() { return this.buffer.sampleRate }
    override get numberOfChannels() { return this.buffer.numberOfChannels }
    override getChannelData(channel: number) { return this.buffer.getChannelData(channel).subarray(this.new_start, this.new_start + this.new_length)}
}