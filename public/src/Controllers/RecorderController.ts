import { audioCtx } from "..";
import App from "../App";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import { URLFromFiles } from "../Audio/Utils/UrlFiles";
import SampleRegion from "../Models/Region/SampleRegion";
import Track from "../Models/Track/Track";


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
    async setupRecording(track: Track) {
        const {sampleRecorder}=track
        sampleRecorder.recorder?.port.postMessage({"arm": true});

        if (sampleRecorder.micRecNode === undefined) {
            if (this.app.settingsController.constraints === undefined) {
                await this.app.settingsController.updateMediaDevices();
            }
            let stream = await navigator.mediaDevices.getUserMedia(this.app.settingsController.constraints);
            sampleRecorder.micRecNode = new MediaStreamAudioSourceNode(audioCtx, {mediaStream: stream,});
            sampleRecorder.micRecNode.connect(sampleRecorder.recordingInputNode);
        }
    }

    /**
     * Sets up the Web Worker for the given track.
     *
     * @param track - The track to set up the Web Worker for.
     */
    async setupWorker(track: Track) {
        let url1 = new URL('../Audio/Utils/wav-writer.js', import.meta.url);
        let url2 = new URL('../Audio/Utils/Ringbuffer/index.js', import.meta.url);
        await URLFromFiles([url1, url2]).then((e) => {
            const {sampleRecorder}=track
            sampleRecorder.worker = new Worker(e);
            sampleRecorder.worker.postMessage({
                command: "init",
                sab: sampleRecorder.sab,
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
    startMonitoring(track: Track) {
        if (track.isArmed) track.monitored = true
    }

    /**
     * Stops monitoring on the given track.
     *
     * @param track - The track to stop monitoring.
     */
    stopMonitoring(track: Track) {
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
    startRecording(track: Track, playhead: number) {
        this.app.host.recording = true;
        const {sampleRecorder}=track
        sampleRecorder.recordingOutputNode.connect(sampleRecorder.recorder!);

        let region = new SampleRegion(OperableAudioBuffer.create({
            length: 1, 
            sampleRate: audioCtx.sampleRate,
            numberOfChannels: 2
        }), playhead)
        this.app.regionsController.addRegion(track, region);

        sampleRecorder.worker?.postMessage({ command: "startWorker" });

        sampleRecorder.recorder?.port.postMessage({ "startRecording": true });

        sampleRecorder.worker!.onmessage = async (e) => {
            if(track.deleted) return
            console.log(e.data.command)
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
                        const new_start=this.app.host.playhead-audioBuffer.length/audioBuffer.sampleRate*1000-this.app.host.latency
                        this.app.regionsController.updateTemporaryRegion(region, track, new SampleRegion(audioBuffer,new_start));
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
                        const new_start=this.app.host.playhead-audioBuffer.length/audioBuffer.sampleRate*1000-this.app.host.latency
                        this.app.regionsController.updateTemporaryRegion(region, track, new SampleRegion(audioBuffer,new_start));
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
    stopRecording(track: Track) {
        this.app.host.recording = false;
        const {sampleRecorder}=track
        sampleRecorder.worker?.postMessage({ command: "stopAndSendAsBuffer" });
        sampleRecorder.recorder?.port.postMessage({ "stopRecording": true });
        sampleRecorder.recordingOutputNode?.disconnect(sampleRecorder.recorder!);
    }

    /**
     * Toggles the armed status of the given track.
     *
     * @param track - The track to toggle the armed status of.
     */
    async clickArm(track: Track) {
        track.isArmed = !track.isArmed;

        if (track.isArmed) {
            await this.setupWorker(track);
            await this.setupRecording(track);
            if(this.app.host.isPlaying) this.startRecording(track,this.app.host.playhead)
        }
        else {
            if (this.app.host.isPlaying) this.stopRecording(track);
            const {sampleRecorder}=track
            sampleRecorder.worker?.terminate();
            sampleRecorder.recorder?.port.postMessage({"stopRecording": true});
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
    clickMonitoring(track: Track) {
        track.monitored = !track.monitored
        if (track.monitored) {
            this.startMonitoring(track);
        }
        else {
            this.stopMonitoring(track);
        }
    }
}