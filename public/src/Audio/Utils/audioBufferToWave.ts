import {audioCtx} from "../../index";

function bufferToWave(abuffer: AudioBuffer) {
    var numOfChan = abuffer.numberOfChannels,
        length = abuffer.length * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this demo)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {           // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true);        // write 16-bit sample
            pos += 2;
        }
        offset++                                     // next source sample
    }

    // create Blob
    return new Blob([view], { type: "audio/wav" });

    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}

function combineBuffers(buffers: AudioBuffer[]) {
    // Get the max length from all buffers
    let maxLength = Math.max(...buffers.map(buffer => buffer.length));

    // Create a new buffer with the max length
    let outputBuffer = audioCtx.createBuffer(
        buffers[0].numberOfChannels,
        maxLength,
        buffers[0].sampleRate
    );

    // For each buffer, for each channel, copy the data into the outputBuffer
    buffers.forEach(buffer => {
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            let outputData = outputBuffer.getChannelData(channel);
            let inputData = buffer.getChannelData(channel);

            for (let i = 0; i < inputData.length; i++) {
                outputData[i] += inputData[i];
            }
        }
    });
    return outputBuffer;
}

function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    link.remove();
}


export {downloadBlob, combineBuffers, bufferToWave}