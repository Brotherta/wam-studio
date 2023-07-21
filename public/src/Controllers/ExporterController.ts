import App from "../App";
import {audioCtx} from "../index";
import Plugin from "../Models/Plugin";
import JSZip from "jszip";


export default class ExporterController {

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async exportSongs(masterTrack: boolean, tracksIds: number[], name: string) {
        if (!masterTrack && tracksIds.length == 0) {
            return;
        }

        const zip = new JSZip();

        let maxDuration = this.app.hostController.maxTime / 1000; // in seconds
        let offlineCtx = new OfflineAudioContext(2, audioCtx.sampleRate * maxDuration, audioCtx.sampleRate);

        const {default: initializeWamHost} = await import("@webaudiomodules/sdk/src/initializeWamHost");
        const [hostGroupId] = await initializeWamHost(offlineCtx);

        const masterGainNode = offlineCtx.createGain();

        let nodes: AudioNode[] = [];
        let sources: AudioBufferSourceNode[] = [];
        let plugins: Plugin[] = [];
        let tracks = this.app.tracksController.trackList.filter((track) => tracksIds.includes(track.id));

        for (let track of tracks) {
            console.log("Exporting track " + track.id);
            let gainNode = offlineCtx.createGain();
            let pannerNode = offlineCtx.createStereoPanner();
            let sourceNode = offlineCtx.createBufferSource();
            let plugin = new Plugin(this.app);

            nodes.push(gainNode, pannerNode);
            sources.push(sourceNode);
            plugins.push(plugin);

            sourceNode.buffer = track.audioBuffer as AudioBuffer;
            gainNode.gain.value = track.gainNode.gain.value;
            pannerNode.pan.value = track.pannerNode.pan.value;

            await plugin.initPlugin(this.app.host.pluginWAM, audioCtx, offlineCtx, hostGroupId)
            document.getElementById("loading-zone")!.appendChild(plugin.dom);
            let state = await track.plugin.instance!._audioNode.getState();
            if (state.current.length > 0) {
                await plugin.setStateAsync(state);
            }

            sourceNode.connect(plugin.instance?._audioNode!).connect(gainNode).connect(pannerNode).connect(offlineCtx.destination);
            sourceNode.start();

            let renderedBuffer = await offlineCtx.startRendering()
            // blobs.push(this.bufferToWave(renderedBuffer));
            let blob = this.bufferToWave(renderedBuffer);
            zip.file(`Track-${track.element.name}.wav`, blob);


            pannerNode.disconnect(offlineCtx.destination);
            if (masterTrack) {
                pannerNode.connect(masterGainNode);
            }
        }

        if (masterTrack) {
            masterGainNode.connect(offlineCtx.destination);
            for (let source of sources) {
                source.start(0);
            }
            await offlineCtx.startRendering().then((renderedBuffer) => {
                // blobs.push(this.bufferToWave(renderedBuffer));
                let blob = this.bufferToWave(renderedBuffer);
                zip.file(`Master.wav`, blob);
            });
        }

        for (let node of nodes) {
            node.disconnect();
        }
        for (let source of sources) {
            source.disconnect();
        }
        for (let plugin of plugins) {
            plugin.instance?._audioNode.disconnect();
            plugin.unloadPlugin();
        }

        let content = await zip.generateAsync({type:"blob"});
        const newFile = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = newFile;
        link.download = name;
        link.click();
        link.remove();

        /*let track = this.app.tracksController.trackList[0]!;

        let gainNode = offlineCtx.createGain();
        let pannerNode = offlineCtx.createStereoPanner();

        // const {default: initializeWamHost} = await import("@webaudiomodules/sdk/src/initializeWamHost");
        // const [hostGroupId] = await initializeWamHost(offlineCtx);

        let plugin = new Plugin(this.app);
        await plugin.initPlugin(this.app.host.pluginWAM, audioCtx, offlineCtx, hostGroupId)
        document.getElementById("loading-zone")!.appendChild(plugin.dom);

        let state = await track.plugin.instance!._audioNode.getState();
        await plugin.setStateAsync(state);

        let source = offlineCtx.createBufferSource();
        source.buffer = track.audioBuffer as AudioBuffer;
        source.connect(plugin.instance?._audioNode!).connect(gainNode).connect(pannerNode).connect(offlineCtx.destination);

        gainNode.gain.value = track.gainNode.gain.value;
        pannerNode.pan.value = track.pannerNode.pan.value;

        source.start();

        offlineCtx.startRendering().then((renderedBuffer) => {
            console.log('Rendering completed successfully');

            let blob = this.bufferToWave(renderedBuffer);
            let url = URL.createObjectURL(blob);
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.href = url;
            a.download = name;
            a.click();
            a.remove();
        })*/
    }

    async exportProject() {

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