import App from "../App";
import Track from "../Models/Track";
import {URLFromFiles} from "../Audio/Utils/UrlFiles";
import {audioCtx} from "../index";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";


export default class RecorderController {

    app: App;
    recording: boolean;

    constructor(app: App) {
        this.app = app;
        this.recording = false;
    }

    // Handlers methods

    async clickArm(track: Track) {
        if (track.isArmed) {
            track.isArmed = false;
            track.element.unArm();
            if (this.app.hostController.playing) {
                this.stopRecording(track);
            }
            track.worker?.terminate();
            track.node?.port.postMessage({"stopRecording": true});
            if (track.isMonitored) {
                this.stopMonitoring(track);
            }
        }
        else {
            track.isArmed = true;
            track.element.arm();

            await this.setupWorker(track);
            await this.setupRecording(track);
        }
    }

    clickRecord() {
        if (this.recording) {
            this.stopRecordingAllTracks();
            this.recording = false;
            this.app.hostController.clickOnPlayButton();
        }
        else {
            let armed = this.app.tracksController.trackList.find((e) => e.isArmed);
            if (armed === undefined) {
                alert("No track armed");
                return;
            }

            this.recording = true;
            if (!this.app.hostController.playing) {
                this.app.hostController.clickOnPlayButton(true);
            }
            for (let track of this.app.tracksController.trackList) {
                if (track.isArmed) {
                    this.startRecording(track, this.app.host.playhead);
                }
            }
        }
        this.app.hostView.pressRecordingButton(this.recording);
    }

    clickMonitoring(track: Track) {
        if (!track.isMonitored) {
            this.startMonitoring(track);
        }
        else {
            this.stopMonitoring(track);
        }
    }

    startMonitoring(track: Track) {
        if (track.isArmed) {
            track.isMonitored = true;
            track.element.monitorOn();
            if (track.plugin.initialized) {
                track.monitorSlitterNode.connect(track.plugin.instance?._audioNode!);
            } else {
                track.monitorSlitterNode.connect(track.pannerNode);
            }
        }
    }

    stopMonitoring(track: Track) {
        track.isMonitored = false;
        track.element.monitorOff();
        if (track.plugin.initialized) {
            track.monitorSlitterNode.disconnect(track.plugin.instance?._audioNode!);
        }
        else {
            track.monitorSlitterNode.disconnect(track.pannerNode);
        }
    }


    // Setup methods

    async setupRecording(track: Track) {
        track.node?.port.postMessage({
            "arm": true
        });

        if (track.micRecNode === undefined) {
            let stream = await navigator.mediaDevices.getUserMedia(this.app.settingsController.constraints);
            track.micRecNode = new MediaStreamAudioSourceNode(audioCtx, {
                mediaStream: stream
            });

            track.micRecNode.connect(track.monitorSlitterNode)
                .connect(track.panRecNode);
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

    // Recording methods

    stopRecordingAllTracks() {
        for (let track of this.app.tracksController.trackList) {
            if (track.isArmed) {
                this.stopRecording(track);
            }
        }
    }

    startRecording(track: Track, playhead: number) {
        this.recording = true;
        track.panRecNode.connect(track.node!);

        let start = (playhead / audioCtx.sampleRate) * 1000;
        let region = this.app.waveFormController.createTemporaryRegion(track, start);

        track.worker?.postMessage({
            command: "startWorker"
        });

        track.node?.port.postMessage({
            "startRecording": true,
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

                        this.app.waveFormController.renderTemporaryRegion(region, track, audioBuffer, this.app.host.latency);
                        track.modified = true;
                    }
                }
            }
        }
    }

    stopRecording(track: Track) {
        this.recording = false;
        track.worker?.postMessage({
            command: "stopAndSendAsBuffer"
        });
        track.node?.port.postMessage({
            "stopRecording": true
        });
        track.panRecNode?.disconnect(track.node!);
    }
}