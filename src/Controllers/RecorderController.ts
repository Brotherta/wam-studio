import App from "../App";
import Track from "../Models/Track";
import {URLFromFiles} from "../Audio/Utils/UrlFiles";
import {audioCtx} from "../index";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";


export default class RecorderController {

    app: App;
    mic: MediaStreamAudioSourceNode | undefined;
    panNode: StereoPannerNode | undefined;

    constructor(app: App) {
        this.app = app;

    }

    addRecordListener(track: Track) {
        console.log("add recording track: " + track.id);
    }

    async clickArm(track: Track) {
        if (track.isArmed) {
            track.isArmed = false;
            track.element.unArm();
            if (this.app.hostController.playing) {
                this.stopRecording(track);
            }
            track.worker?.terminate();
            track.node?.port.postMessage({"stopRecording": true});
        }
        else {
            track.isArmed = true;
            track.element.arm();

            await this.setupWorker(track);
            await this.setupRecording(track);
        }
    }

    async setupRecording(track: Track) {
        track.node?.port.postMessage({
            "arm": true
        });

        if (this.mic === undefined || this.panNode === undefined) {
            var constraints = {
                audio: {
                    echoCancellation: false,
                    mozNoiseSuppression: false,
                    mozAutoGainControl: false
                }
            };
            let stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.mic = new MediaStreamAudioSourceNode(audioCtx, {
                mediaStream: stream
            });
            this.panNode = audioCtx.createStereoPanner();
            this.mic.connect(this.panNode);
        }
    }

    async setupWorker(track: Track) {
        let url1 = new URL('../Audio/Utils/wav-writer.js', import.meta.url);
        let url2 = new URL('../Audio/Utils/Ringbuffer/index.js', import.meta.url);
        await URLFromFiles([url1, url2]).then((e) => {
            track.worker = new Worker(e);
            track.worker.postMessage({
                command: "init",
                sab: track.sab,
                channelCount: 2,
                sampleRate: audioCtx.sampleRate
            });
        })
    }

    stopRecording(track: Track) {
        track.worker?.postMessage({
            command: "stopAndSendAsBuffer"
        });
        this.panNode?.disconnect()
    }

    startRecording(track: Track, playhead: number) {
        this.panNode!.connect(track.node!);

        let start = (playhead / audioCtx.sampleRate) * 1000;
        let region = this.app.waveFormController.createTemporaryRegion(track, start);

        track.worker?.postMessage({
            command: "startWorker"
        });

        track.worker!.onmessage = async (e) => {
            switch (e.data.command) {
                case "audioBufferCurrentUpdated": {
                    // Create an audio buffer from the PCM data.
                    // convert e.data into a Float32Array
                    const pcm = new Float32Array(e.data.buffer);
                    if (pcm.length > 0) {
                        // Create an AudioBuffer from the PCM data.
                        const audioBuffer = new OperableAudioBuffer({
                            length: pcm.length / 2,
                            sampleRate: audioCtx.sampleRate,
                            numberOfChannels: 2
                        });
                        const left = audioBuffer.getChannelData(0);
                        const right = audioBuffer.getChannelData(1);
                        for (let i = 0; i < pcm.length; i += 2) {
                            left[i / 2] = pcm[i];
                            right[i / 2] = pcm[i + 1];
                        }

                        console.log(audioBuffer);

                        console.log("Update temporary region : " + region.id);
                        this.app.waveFormController.updateTemporaryRegion(region, track, audioBuffer)
                    }
                    break;
                }
                case "audioBufferFinal": {
                    // Create an audio buffer from the PCM data.
                    // convert e.data into a Float32Array
                    const pcm = new Float32Array(e.data.buffer);

                    if (pcm.length > 0) {
                        // Create an AudioBuffer from the PCM data.
                        const audioBuffer = new OperableAudioBuffer({
                            length: pcm.length / 2,
                            sampleRate: audioCtx.sampleRate,
                            numberOfChannels: 2
                        });
                        const left = audioBuffer.getChannelData(0);
                        const right = audioBuffer.getChannelData(1);
                        for (let i = 0; i < pcm.length; i += 2) {
                            left[i / 2] = pcm[i];
                            right[i / 2] = pcm[i + 1];
                        }

                        // this.app.waveFormController.createWaveform(track, audioBuffer, start);
                        this.app.waveFormController.renderTemporaryRegion(region, track, audioBuffer);
                        track.modified = true;
                    }
                    console.log("Terminate worker of track : " + track.id);
                }
            }
        }
    }


}