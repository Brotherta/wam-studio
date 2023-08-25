import App from "../App";
import {audioCtx} from "../index";
import Plugin from "../Models/Plugin";
import JSZip from "jszip";
import Track from "../Models/Track";
import AudioNode from "../Audio/AudioNode";


export default class ExporterController {

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async exportSongs(masterTrack: boolean, tracksIds: number[], name: string) {
        if (!masterTrack && tracksIds.length === 0) {
            return;
        }
        if (name == "") name = "project";

        let buffers = [];
        let maxDuration = this.app.hostController.maxTime / 1000; // in seconds
        console.log(maxDuration/60);
        const {default: initializeWamHost} = await import("@webaudiomodules/sdk/src/initializeWamHost");

        for (let track of this.app.tracksController.trackList) {
            console.log("Exporting track " + track.id);

            let offlineCtx = new OfflineAudioContext(2, audioCtx.sampleRate * maxDuration, audioCtx.sampleRate);
            const [hostGroupId] = await initializeWamHost(offlineCtx);
            let {
                gainNode,
                pannerNode,
                sourceNode,
                plugin
            } = await this.rebuildTrackGraph(offlineCtx, track, hostGroupId);

            sourceNode.connect(plugin.instance?._audioNode!).connect(gainNode).connect(pannerNode).connect(offlineCtx.destination);
            sourceNode.start();

            let renderedBuffer = await offlineCtx.startRendering()
            let blob = this.bufferToWave(renderedBuffer);
            buffers.push(renderedBuffer);

            gainNode.disconnect();
            pannerNode.disconnect();
            sourceNode.disconnect();
            plugin.instance?._audioNode.disconnect();
            plugin.instance?._audioNode.disconnect();
            plugin.unloadPlugin();

            if (!tracksIds.includes(track.id)) continue;
            downloadBlob(blob, `${name}_track_${track.element.name}.wav`);
        }

        if (masterTrack) {
            console.log("Exporting track master");

            let offlineCtx = new OfflineAudioContext(2, audioCtx.sampleRate * maxDuration, audioCtx.sampleRate);
            let masterBuffer = combineBuffers(buffers);

            const masterGainNode = offlineCtx.createGain();
            masterGainNode.gain.value = this.app.host.gainNode.gain.value;

            let masterSourceNode = offlineCtx.createBufferSource();
            masterSourceNode.buffer = masterBuffer;

            masterSourceNode.connect(masterGainNode).connect(offlineCtx.destination);
            masterSourceNode.start();

            let renderedBuffer = await offlineCtx.startRendering()
            let blob = this.bufferToWave(renderedBuffer);

            masterGainNode.disconnect();
            masterSourceNode.disconnect();

            downloadBlob(blob, `${name}_master.wav`);
        }
    }

    async rebuildTrackGraph(offlineCtx: OfflineAudioContext, track: Track, hostGroupId: string) {
        let gainNode = offlineCtx.createGain();
        let pannerNode = offlineCtx.createStereoPanner();
        let sourceNode = offlineCtx.createBufferSource();
        let plugin = new Plugin(this.app);

        sourceNode.buffer = track.audioBuffer as AudioBuffer;
        gainNode.gain.value = track.gainNode.gain.value;
        pannerNode.pan.value = track.pannerNode.pan.value;

        await plugin.initPlugin(this.app.host.pluginWAM, audioCtx, offlineCtx, hostGroupId)
        document.getElementById("loading-zone")!.appendChild(plugin.dom);
        let state = await track.plugin.instance!._audioNode.getState();
        if (state.current.length > 0) {
            await plugin.setStateAsync(state);
        }
        return {gainNode, pannerNode, sourceNode, plugin};
    }

    bufferToWave(abuffer: AudioBuffer) {
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