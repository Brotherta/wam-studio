function mod(n, m) {
    return ((n % m) + m) % m;
}
class MeasureProcessor extends AudioWorkletProcessor {
    constructor(...args) {
        super(args);
        this.interval = 1 * globalThis.sampleRate;
        this.remaining = this.interval;
        this.start = 0;
        this.tapped = false;

        // Noise burst synthesis parameter
        this.sq_frames = 64;
        this.sq_remaining = 64;
        this.sq_period = 16;
        this.sq_amp = 0.8;
        // A ring buffer that always keep the last 1000ms of audio to be able to find
        // the beginning of the noise burst a peak has been found.
        this.ringbuf = new Float32Array(globalThis.sampleRate);
        this.write_idx = 0;
        var self = this;
        this.port.onmessage = function(e) {
            self.threshold = e.data.threshold;
        }
    }
    // record a single sample in the ring buffer
    record(sample) {
        this.ringbuf[this.write_idx] = sample;
        this.write_idx = mod(this.write_idx+1, this.ringbuf.length);
    }
    // get a sample from the ring buffer. idx is an offset in the past, 0 is the
    // sample most recently written to the ring buffer
    get_past_sample(idx) {
        var not_wrapped = this.write_idx - 1 - idx;
        var i = mod(this.write_idx-1-idx,this.ringbuf.length);
        return this.ringbuf[i];
    }
    process(inputs, outputs) {
        var input = inputs[0];
        if (!input.length) {
            return true;
        }
        var mono_input = input[0];
        var mono_output = outputs[0][0];
        for (var i = 0; i < mono_input.length; i++) {
            // This matches on a positive peak
            if (mono_input[i] > this.threshold && this.tapped) {
                // try to find the beginning of the pattern, because what's been found
                // is probably a peak, which is in the middle of the burst. Scan
                // back the last 10ms or so.
                var idx_first_zero_crossing = -1;
                var scan_back_idx = 0;
                while (scan_back_idx++ != this.ringbuf.length) {
                    if (this.get_past_sample(scan_back_idx) < 0) {
                        idx_first_zero_crossing = scan_back_idx;
                        break;
                    }
                }
                // we expect zero crossing around each 8 frames. Stop when that's not
                // the case anymore. This is not very good, this should be scanning
                // window + correlation maximisation.
                var sign = true;
                var current_period = 0;
                while (scan_back_idx++ != this.ringbuf.length) {
                    var computed_period = (scan_back_idx - idx_first_zero_crossing) / this.sq_period;
                    if (sign != Math.sign(this.get_past_sample(scan_back_idx))) {
                        // zero crossing, fuzz match
                        if (Math.abs(current_period - computed_period) > 2) {
                            // too far away from the generated burst, break and consider this
                            // the beginning of the burst.
                            break;
                        }
                    }
                }
                // send back frames from the past to the main thread to display in debug
                // mode
                var frames_delay = (globalThis.currentFrame + i - scan_back_idx) - this.start;
                if (frames_delay > 0) {
                    var debugarray = new Float32Array(frames_delay * 2);
                    var rdIdx = 0;
                    for (var j = 0; j < debugarray.length; j++) {
                        debugarray[debugarray.length - j] = this.get_past_sample(j);
                    }
                    var latency_s = frames_delay / globalThis.sampleRate;
                    this.port.postMessage({latency: latency_s,
                        array: debugarray,
                        offset: scan_back_idx,
                        delay_frames: frames_delay});
                }
                this.tapped = false;
            }
            if (this.remaining == 0) {
                if (this.sq_remaining == this.sq_frames) {
                    this.tapped = true;
                    this.start = globalThis.currentFrame + i;
                    mono_input[i] = -1.0;
                }
                mono_output[i] = (this.sq_remaining % this.sq_period) >
                this.sq_period/2 ? this.sq_amp : -this.sq_amp;
                this.sq_remaining--;
                if (this.sq_remaining == 0) {
                    this.sq_remaining = this.sq_frames;
                    this.remaining = this.interval;
                }
            } else {
                this.remaining--;
            }
            this.record(mono_input[i] + mono_output[i]);
            mono_output[i] += mono_input[i];
        }
        return true;
    }
}

try {
    registerProcessor('measure-processor', MeasureProcessor);
} catch (error) {
    console.warn(error);
}

