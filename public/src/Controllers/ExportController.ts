import { initializeWamHost } from "@webaudiomodules/sdk";
import App from "../App";
import { bufferToWave, downloadBlob } from "../Audio/Utils/audioBufferToWave";
import { PluginInstance } from "../Models/Plugin";
import Track from "../Models/Track/Track";
import { audioCtx } from "../index";
import AutomationController from "./AutomationController";

/**
 * Controller class that binds the events of the exporter.
 */
export default class ExporterController {

    /**
     * Route Application.
     */
    _app: App;

    constructor(app: App) {
        this._app = app;
    }

    /**
     * Exports the project to audio files. If masterTrack is true, it will export the master track.
     *
     * @param masterTrack - If true, it will export the master track.
     * @param tracksIds - List of tracks ID to export.
     * @param name - Name of the project that will prefix the name of the files.
     */
    public async exportSongs(masterTrack: boolean, tracksIds: number[], name: string): Promise<void> {
        // Check if there are no tracks to export and if so, return early.
        if (!masterTrack && tracksIds.length === 0) {
            return;
        }
        // Set default name if empty.
        if (name == "") name = "project";

        let buffers = [];

        // Check if there's content to export.
        let maxDuration = this._app.regionsController.getMaxDurationRegions(); // in seconds
        if (maxDuration == 0) {
            alert("You can't export nothing...");
            return;
        }

        const { default: initializeWamHost } = await import("@webaudiomodules/sdk/src/initializeWamHost");

        // Process and export individual tracks.
        for (let track of this._app.tracksController.tracks) {
            let buffer = await this.processTrack(track, maxDuration, initializeWamHost);
            if (buffer) buffers.push(buffer);
            if (tracksIds.includes(track.id)) {
                this.exportTrackBuffer(buffer, `${name}_track_${track.element.name}.wav`);
            }
        }

        // Process and export the master track if requested.
        if (masterTrack) {
            await this.exportMasterTrack(buffers, name, maxDuration);
        }
    }

    /**
     * Processes a track and return its audio buffer.
     *
     * @param track - Track to process.
     * @param maxDuration - Maximum duration of the track.
     * @param initializeWamHost - Function to initialize the WAM host.
     *
     * @returns The audio buffer of the track.
     */
    private async processTrack(track: Track, maxDuration: number, initializeWamHost: any): Promise<AudioBuffer> {

        // Create offline audio context.
        let offlineCtx = new OfflineAudioContext(2, audioCtx.sampleRate * maxDuration, audioCtx.sampleRate)
        const [hostGroupId] = await initializeWamHost(offlineCtx)

        // Recreate the graph in the online audio context.
        const graph=await track.track_graph.instantiate(offlineCtx,hostGroupId)
        graph.connect(offlineCtx.destination)

        // Start source node and render.
        graph.playhead=0
        graph.isPlaying=true
        let renderedBuffer = await offlineCtx.startRendering();
        
        // Clean up everything.
        await graph.destroy()

        return renderedBuffer

        /* ALTERNATIVE FOR TEST, OUTPUT TO ONLINE AUDIO CONTEXT */
        /*let offlineCtx = new AudioContext({ sampleRate: audioCtx.sampleRate })
        const [hostGroupId] = await initializeWamHost(offlineCtx)
        const graph=await track.track_graph.instantiate(offlineCtx,hostGroupId)
        graph.connect(offlineCtx.destination)
        console.log("WILL SET PLAYHEADs")
        graph.playhead=0
        console.log("PLAYHEADS sets")
        graph.isPlaying=true
        return new AudioBuffer({length:10, sampleRate:audioCtx.sampleRate, numberOfChannels:2})*/
    }

    /**
     * Processes and export the master track.
     *
     * @param buffers - List of buffers to combine.
     * @param name - Name of the project.
     * @param maxDuration - Maximum duration of the track.
     *
     * @returns The audio buffer of the master track.
     */
    private async exportMasterTrack(buffers: AudioBuffer[], name: string, maxDuration: number): Promise<void> {
        /*console.log("Exporting track master");

        let offlineCtx = new OfflineAudioContext(2, audioCtx.sampleRate * maxDuration, audioCtx.sampleRate);
        let masterBuffer = combineBuffers(buffers);

        // Create master gain and source nodes.
        const masterGainNode = offlineCtx.createGain();
        masterGainNode.gain.value = this._app.host.volume;

        let masterSourceNode = offlineCtx.createBufferSource();
        masterSourceNode.buffer = masterBuffer;

        // Connect nodes, start, and render.
        masterSourceNode.connect(masterGainNode).connect(offlineCtx.destination);
        masterSourceNode.start();

        let renderedBuffer = await offlineCtx.startRendering();

        // Clean up connections.
        masterGainNode.disconnect();
        masterSourceNode.disconnect();*/

        // Create offline audio context.
        let offlineCtx = new OfflineAudioContext(2, audioCtx.sampleRate * maxDuration, audioCtx.sampleRate)
        //let offlineCtx = audioCtx
        const [hostGroupId] = await initializeWamHost(offlineCtx)

        // Recreate the graph in the online audio context.
        const graph=await this._app.host.host_graph.instantiate(offlineCtx,hostGroupId)
        graph.connect(offlineCtx.destination)

        // Start source node and render.
        graph.play()

        let renderedBuffer = await offlineCtx.startRendering();

        // Clean up everything.
        await graph.destroy()

        this.exportTrackBuffer(renderedBuffer, `${name}_master.wav`);
    }

    /**
     * Export a given audio buffer as a WAV file.
     *
     * @param buffer - Audio buffer to export.
     * @param fileName - Name of the file.
     * @private
     */
    private exportTrackBuffer(buffer: AudioBuffer, fileName: string): void {
        let blob = bufferToWave(buffer);
        downloadBlob(blob, fileName);
    }


    // TODO Find how it is useful, the base track audio graph should work as good
    /**
     * Rebuilds the track graph to export it. It will create a new gain node, panner node and source node.
     * It uses an offline audio context to render the track. It also creates a new plugin instance if the track has one.
     *
     * @param offlineCtx - Offline audio context to render the track.
     * @param track - Track to export.
     * @param hostGroupId - Host group ID.
     * @private
     */
    /*private async rebuildTrackGraph(offlineCtx: OfflineAudioContext, track: RegionTrack, hostGroupId: string) {
        let gainNode = offlineCtx.createGain()
        let pannerNode = offlineCtx.createStereoPanner()
        let sourceNode = offlineCtx.createBufferSource()
        let plugin = new Plugin(this._app)

        sourceNode.buffer = track.audioBuffer as AudioBuffer
        gainNode.gain.value = track.volume
        pannerNode.pan.value = track.balance

        if (track.plugin.initialized) {
            await plugin.initPlugin(this._app.host.pluginWAM, audioCtx, offlineCtx, hostGroupId)
            document.getElementById("loading-zone")!.appendChild(plugin.dom)
            let state = await track.plugin.instance!._audioNode.getState()
            if (state.current.length > 0) {
                await plugin.setStateAsync(state)
            }
        }
        return {gainNode, pannerNode, sourceNode, plugin}
    }*/

    /**
     * Applies the automation to the plugin.
     * TODO: Doesn't work on offline audio context. Must investigate.
     *
     * @param track - Track to export.
     * @param plugin - Plugin to apply the automation.
     * @param offlineAudioContext - Offline audio context to render the track.
     * @private
     */
    private applyAutomation(track:Track, plugin: PluginInstance, offlineAudioContext: OfflineAudioContext) {
        plugin.audioNode.clearEvents();
        let automation = track.automation;
        let events = [];
        for (let bpf of automation.bpfList) {
            let point = bpf.lastPoint;
            if (point == null) {
                continue;
            }
            let list = [];
            for (let x = 0; x < point[0]; x += 0.1) {
                list.push(bpf.getYfromX(x));
            }
            let start = AutomationController.getStartingPoint(point[0]*1000, 0, list.length);
            let paramID = bpf.paramID;
            let t = 0;
            for (let i = start; i < list.length; i++) {
                events.push({ type: 'wam-automation', data: { id: paramID, value: list[i] }, time: offlineAudioContext.currentTime + t })
                t += 0.1;
            }
        }
        events.sort((a, b) => a.time - b.time);
        // @ts-ignore
        plugin.instance?._audioNode.scheduleEvents(...events);
    }
}