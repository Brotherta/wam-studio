import App from "../App";
import SampleTrack from "../Models/Track/SampleTrack";
import {URLFromFiles} from "../Audio/Utils/UrlFiles";
import {audioCtx} from "../index";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import SampleRegion from "../Models/Region/SampleRegion";


export default class RecorderController {

    app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Sets up the recording functionality for the given track.
     *
     * @param track - The track to set up recording for.
     */
    async setupRecording(track: SampleTrack) {
        track.node?.port.postMessage({
            "arm": true
        });

        if (track.micRecNode === undefined) {
            if (this.app.settingsController.constraints === undefined) {
                await this.app.settingsController.updateMediaDevices();
            }
            let stream = await navigator.mediaDevices.getUserMedia(this.app.settingsController.constraints);
            track.micRecNode = new MediaStreamAudioSourceNode(audioCtx, {
                mediaStream: stream,
            });

            track.micRecNode.connect(track.splitterNode);
        }
    }

    /**
     * Sets up the Web Worker for the given track.
     *
     * @param track - The track to set up the Web Worker for.
     */
    async setupWorker(track: SampleTrack) {
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

    /**
     * Starts monitoring on the given track.
     *
     * @param track - The track to start monitoring.
     */
    startMonitoring(track: SampleTrack) {
        if (track.armed) {
            track.monitored = true
        }
    }

    /**
     * Stops monitoring on the given track.
     *
     * @param track - The track to stop monitoring.
     */
    stopMonitoring(track: SampleTrack) {
        track.monitored = false
    }

    /**
     * Stops recording all armed tracks.
     */
    stopRecordingAllTracks() {
        for (let track of this.app.tracksController.sampleTracks) {
            if (track.armed) {
                this.stopRecording(track);
            }
        }
    }

    /**
     * Starts recording on the given track.
     *
     *
     * @param track - The track to start recording on.
     * @param playhead - The current playhead position.
     */
    startRecording(track: SampleTrack, playhead: number) {
        this.app.host.recording = true;
        track.mergerNode.connect(track.node!);

        let start = (playhead / audioCtx.sampleRate) * 1000;
        let region = this.app.regionsController.createTemporaryRegion(track, start);

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

                        this.app.regionsController.updateTemporaryRegion(region, track, new SampleRegion(0,audioBuffer,0,region.id));
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

                        this.app.regionsController.renderTemporaryRegion(region, track, new SampleRegion(0,audioBuffer,0,region.id));
                        track.modified = true;
                    }
                }
            }
        }
    }

    /**
     * Stops recording on the given track.
     *
     * @param track
     */
    stopRecording(track: SampleTrack) {
        this.app.host.recording = false;
        track.worker?.postMessage({
            command: "stopAndSendAsBuffer"
        });
        track.node?.port.postMessage({
            "stopRecording": true
        });
        track.mergerNode?.disconnect(track.node!);
    }

    /**
     * Toggles the armed status of the given track.
     *
     * @param track - The track to toggle the armed status of.
     */
    async clickArm(track: SampleTrack) {
        track.armed = !track.armed;

        if (track.armed) {
            track.element.arm();

            await this.setupWorker(track);
            await this.setupRecording(track);
        }
        else {
            track.element.unArm();
            if (this.app.host.playing) {
                this.stopRecording(track);
            }
            track.worker?.terminate();
            track.node?.port.postMessage({"stopRecording": true});
            if (track.monitored) {
                this.stopMonitoring(track);
            }
        }
    }

    /**
     * Toggles the recording status of the controller.
     */
    record() {
        const recording = !this.app.host.recording;
        this.app.host.recording = recording;
        if (recording) {
            let armed = this.app.tracksController.sampleTracks._tracks.find((e) => e.armed);
            // if (armed === undefined) {
            //     alert("No track armed");
            //     return;
            // }
            if (!this.app.host.playing) {
                this.app.hostController.play(true);
            }
            for (let track of this.app.tracksController.sampleTracks) {
                if (track.armed) {
                    this.startRecording(track, this.app.host.playhead);
                }
            }
        }
        else {
            this.stopRecordingAllTracks();
            this.app.hostController.play();
        }
        this.app.hostView.updateRecordButton(recording);
    }

    /**
     * Toggles the monitoring status of the given track.
     *
     * @param track - The track to toggle the monitoring status of.
     */
    clickMonitoring(track: SampleTrack) {
        track.monitored = !track.monitored
        if (track.monitored) {
            track.element.monitorOn();
            this.startMonitoring(track);
        }
        else {
            track.element.monitorOff();
            this.stopMonitoring(track);
        }
    }

    /**
     * Toggles between stereo and mono mode for the given track.
     *
     * @param track - The track to toggle the mode of.
     */
    clickMode(track: SampleTrack) {
        track.stereo = !track.stereo;
        if (track.stereo) {
            track.element.setStereo();
            track.splitterNode.disconnect();
            if (track.merge) {
                // Connect left and right channels to both output channels
                track.splitterNode.connect(track.mergerNode, 0, 0);
                track.splitterNode.connect(track.mergerNode, 0, 1);
                track.splitterNode.connect(track.mergerNode, 1, 0);
                track.splitterNode.connect(track.mergerNode, 1, 1);
            }
            else {
                // Connect left and right channels to their respective output channels
                track.splitterNode.connect(track.mergerNode, 0, 0);
                track.splitterNode.connect(track.mergerNode, 1, 1);
            }

        }
        else {
            track.element.setMono();
            track.splitterNode.disconnect();
            if (track.left) {
                // Connect left channel to both output channels
                track.splitterNode.connect(track.mergerNode, 0, 0);
                track.splitterNode.connect(track.mergerNode, 0, 1);
            }
            if (track.right) {
                // Connect right channel to both output channels
                track.splitterNode.connect(track.mergerNode, 1, 0);
                track.splitterNode.connect(track.mergerNode, 1, 1);
            }
        }
    }

    /**
     * Toggles the left channel in mono mode for the given track.
     *
     * @param track - The track to toggle the left channel of.
     */
    clickLeft(track: SampleTrack) {
        track.element.clickLeft();
        track.left = !track.left;
        if (track.left) {
            // Connect left channel to both output channels
            track.splitterNode.connect(track.mergerNode, 0, 0);
            track.splitterNode.connect(track.mergerNode, 0, 1);
        }
        else {
            track.splitterNode.disconnect(track.mergerNode, 0, 0);
            track.splitterNode.disconnect(track.mergerNode, 0, 1);
        }

    }

    /**
     * Toggles the right channel in mono mode for the given track.
     *
     * @param track - The track to toggle the right channel of.
     */
    clickRight(track: SampleTrack) {
        track.element.clickRight();
        track.right = !track.right;
        if (track.right) {
            // Connect right channel to both output channels
            track.splitterNode.connect(track.mergerNode, 1, 0);
            track.splitterNode.connect(track.mergerNode, 1, 1);
        }
        else {
            track.splitterNode.disconnect(track.mergerNode, 1, 0);
            track.splitterNode.disconnect(track.mergerNode, 1, 1);
        }

    }

    /**
     * Toggles the merging of left and right channels for the given track.
     *
     * @param track - The track to toggle merging for.
     */
    clickMerge(track: SampleTrack) {
        track.element.clickMerge();
        track.merge = !track.merge;
        if (track.merge) {
            track.splitterNode.disconnect();

            // Connect left and right channels to both output channels
            track.splitterNode.connect(track.mergerNode, 0, 0);
            track.splitterNode.connect(track.mergerNode, 0, 1);
            track.splitterNode.connect(track.mergerNode, 1, 0);
            track.splitterNode.connect(track.mergerNode, 1, 1);
        }
        else {
            track.splitterNode.disconnect();
            // Connect left and right channels to their respective output channels
            track.splitterNode.connect(track.mergerNode, 0, 0);
            track.splitterNode.connect(track.mergerNode, 1, 1);
        }
    }
}