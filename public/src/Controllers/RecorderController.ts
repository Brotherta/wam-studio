import App from "../App";
import { URLFromFiles } from "../Audio/Utils/UrlFiles";
import RegionTrack from "../Models/Track/RegionTrack";


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
    async setupRecording(track: RegionTrack) {
        /*TODO track.node?.port.postMessage({"arm": true});

        if (track.micRecNode === undefined) {
            if (this.app.settingsController.constraints === undefined) {
                await this.app.settingsController.updateMediaDevices();
            }
            let stream = await navigator.mediaDevices.getUserMedia(this.app.settingsController.constraints);
            track.micRecNode = new MediaStreamAudioSourceNode(audioCtx, {mediaStream: stream,});
            track.micRecNode.connect(track.recordingInputNode);
        }*/
    }

    /**
     * Sets up the Web Worker for the given track.
     *
     * @param track - The track to set up the Web Worker for.
     */
    async setupWorker(track: RegionTrack) {
        let url1 = new URL('../Audio/Utils/wav-writer.js', import.meta.url);
        let url2 = new URL('../Audio/Utils/Ringbuffer/index.js', import.meta.url);
        await URLFromFiles([url1, url2]).then((e) => {
            /*TODO track.worker = new Worker(e);
            track.worker.postMessage({
                command: "init",
                sab: track.sab,
                channelCount: 2,
                sampleRate: audioCtx.sampleRate
            });*/
        })
    }

    /**
     * Starts monitoring on the given track.
     *
     * @param track - The track to start monitoring.
     */
    startMonitoring(track: RegionTrack) {
        if (track.isArmed) track.monitored = true
    }

    /**
     * Stops monitoring on the given track.
     *
     * @param track - The track to stop monitoring.
     */
    stopMonitoring(track: RegionTrack) {
        track.monitored = false
    }

    /**
     * Stops recording all armed tracks.
     */
    stopRecordingAllTracks() {
        for (let track of this.app.tracksController.tracks) {
            if (track.isArmed) {
                this.stopRecording(track);
            }
        }
    }

    /**
     * Starts recording on the given track.
     *
     *
     * @param track - The track to start recording on.
     * @param playhead - The current playhead position in milliseconds.
     */
    startRecording(track: RegionTrack, playhead: number) {
        /*TODO this.app.host.recording = true;
        track.recordingOutputNode.connect(track.node!);

        let start = (playhead / audioCtx.sampleRate) * 1000;
        let region = this.app.regionsController.createTemporaryRegion(track, start);

        track.worker?.postMessage({ command: "startWorker" });

        track.node?.port.postMessage({ "startRecording": true });

        track.worker!.onmessage = async (e) => {
            switch (e.data.command) {
                case "audioBufferCurrentUpdated": {
                    // Create an audio buffer from the PCM data.
                    // convert e.data into a Float32Array
                    const pcm = new Float32Array(e.data.buffer);
                    if (pcm.length > 0) {
                        // Create an AudioBuffer from the PCM data.
                        const audioBuffer = OperableAudioBuffer.create({
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
                        const new_start=(this.app.host.playhead-audioBuffer.length)/audioBuffer.sampleRate*1000
                        this.app.regionsController.updateTemporaryRegion(region, track, new SampleRegion(0,audioBuffer,new_start,region.id));
                    }
                    break;
                }
                case "audioBufferFinal": {
                    // Create an audio buffer from the PCM data.
                    // convert e.data into a Float32Array
                    const pcm = new Float32Array(e.data.buffer);

                    if (pcm.length > 0) {
                        // Create an AudioBuffer from the PCM data.
                        const audioBuffer = OperableAudioBuffer.create({
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
        }*/
    }

    /**
     * Stops recording on the given track.
     *
     * @param track
     */
    stopRecording(track: RegionTrack) {
        /* TODO this.app.host.recording = false;
        track.worker?.postMessage({ command: "stopAndSendAsBuffer" });
        track.node?.port.postMessage({ "stopRecording": true });
        track.recordingOutputNode?.disconnect(track.node!);*/
    }

    /**
     * Toggles the armed status of the given track.
     *
     * @param track - The track to toggle the armed status of.
     */
    async clickArm(track: RegionTrack) {
        track.isArmed = !track.isArmed;

        if (track.isArmed) {
            await this.setupWorker(track);
            await this.setupRecording(track);
        }
        else {
            if (this.app.host.isPlaying) this.stopRecording(track);
            //track.worker?.terminate();
            //TODO track.node?.port.postMessage({"stopRecording": true});
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
            let armed = this.app.tracksController.tracks.find((e) => e.isArmed);
            // if (armed === undefined) {
            //     alert("No track armed");
            //     return;
            // }
            if (!this.app.host.isPlaying) {
                this.app.hostController.play(true);
            }
            else if(!this.app.host.inRecordingMode){
                this.app.hostController.play();
                this.app.hostController.play(true);

            }
            for (let track of this.app.tracksController.tracks) {
                if (track.isArmed) {
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
    clickMonitoring(track: RegionTrack) {
        track.monitored = !track.monitored
        if (track.monitored) {
            this.startMonitoring(track);
        }
        else {
            this.stopMonitoring(track);
        }
    }
}