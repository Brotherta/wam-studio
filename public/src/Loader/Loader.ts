import App from "../App";
import JSZip from "jszip";
import {bufferToWave} from "../Audio/Utils/audioBufferToFlac";
import APP_VERSION from "../version";
import {BACKEND_URL} from "../Env";
import * as path from "path";
import {audioCtx} from "../index";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";


export default class Loader {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async saveProject() {
        const zip = new JSZip();
        const audio = zip.folder("audio")!;

        let wavs = [];
        // TODO Total TRACK ACC
        let tracks = [];

        let pluginHostState = null;
        if (this.app.host.plugin.initialized) {
            pluginHostState = await this.app.host.plugin.instance!._audioNode.getState();
        }

        for (let track of this.app.tracksController.trackList) {
            let hasPlugin = track.plugin.initialized;
            let pluginState = null;

            let automations = [];
            if (hasPlugin) {
                pluginState = await track.plugin.instance!._audioNode.getState();
                let parameters = await track.plugin.instance!._audioNode.getParameterInfo();
                for (let param in parameters) {
                    let bpf = track.automation.getBpfOfparam(param);
                    if (bpf !== undefined) {
                        if (bpf.state.points.length > 0) {
                            automations.push({
                                "param": param,
                                "state": bpf.state
                            })
                        }
                    }
                }
            }

            // TODO Total REGION ACC
            let regions = [];
            for (let region of track.regions) {
                let name = `Track-${track.id}_Region-${region.id}.wav`
                let blob = bufferToWave(region.buffer);
                // audio.file(name, blob);
                wavs.push({
                    "name": name,
                    "blob": blob
                });
                let regionJson = {
                    "id": region.id,
                    "path": `audio/${name}`,
                    "start": region.start,
                    "duration": region.duration
                }
                regions.push(regionJson);
            }

            let trackJson = {
                "id": track.id,
                "name": track.element.name,
                "color": track.color,
                "muted": track.isMuted,
                "soloed": track.isSolo,
                "volume": track.volume,
                "pan": track.pannerNode.pan.value,
                "plugins": hasPlugin ? pluginState : null,
                "regions": regions,
                "automations": automations
            }
            tracks.push(trackJson);
        }

        let project = {
            "host": {
                "version": APP_VERSION,
                "timer": this.app.host.timer,
                "playhead": this.app.host.playhead,
                "muted": this.app.host.isMuted,
                "volume": this.app.host.volume,
                "playing": this.app.hostController.playing,
                "recording": this.app.recorderController.recording,
                "trackAcc": this.app.tracksController.trackIdCount,
                "regionAcc": this.app.regionsController.regionIdCounter,
                "plugin": pluginHostState
            },
            "tracks": tracks
        }

        // zip.file("project.json", JSON.stringify(project));
        //
        // let content = await zip.generateAsync({type: "blob"})
        //
        // const new_file = URL.createObjectURL(content);
        // const link = document.createElement("a")
        // link.href = new_file
        // link.download = "project.zip"
        // link.click()
        // link.remove()
        return {
            "project": project,
            "wavs": wavs
        }
    }



    async loadProject(data: any) {
        let project = data.data;

        let version = project.host.version;
        if (version !== APP_VERSION) {
            alert("Incompatible project version");
            return;
        }
        let muted = project.host.muted;
        let volume = project.host.volume;
        let playing = project.host.playing;
        let recording = project.host.recording;
        let timer = project.host.timer;
        let playhead = project.host.playhead;
        let trackAcc = project.host.trackAcc;
        let regionAcc = project.host.regionAcc;

        let tracksJson = project.tracks;

        this.app.hostController.playing = false;
        this.app.hostController.stopAll();
        this.app.tracksController.clearAllTracks();
        this.app.host.timer = 0;
        this.app.host.playhead = 0;
        this.app.tracksController.trackIdCount = 1;
        this.app.host.setVolume(project.host.volume);

        if (project.host.plugin !== null) {
            await this.app.host.plugin.initPlugin();
            this.app.pluginsController.connectPlugin(this.app.host);
            this.app.pluginsView.movePluginLoadingZone(this.app.host);
            await this.app.host.plugin.instance?._audioNode.setState(project.host.plugin);
        }

        // TODO WORKER FOR LOADING
        for (const trackJson of tracksJson) {
            let track = await this.app.tracksController.newEmptyTrack();
            track.id = trackJson.id;

            await this.app.tracksController.initTrackComponents(track);


            track.element.name = trackJson.name;
            track.element.trackNameInput.value = trackJson.name;

            if (trackJson.muted) {
                track.mute();
                track.element.mute();
            }
            if (trackJson.soloed) {
                track.isSolo = true;
                track.element.solo();
            }

            track.setBalance(trackJson.pan);
            track.setVolume(trackJson.volume);
            track.element.volumeSlider.value = (trackJson.volume*100).toString();
            track.element.balanceSlider.value = trackJson.pan;
            this.app.tracksView.setColor(track, trackJson.color);

            let plugins = trackJson.plugins;
            if (plugins !== null) {
                await track.plugin.initPlugin();
                this.app.pluginsController.connectPlugin(track);
                this.app.pluginsView.movePluginLoadingZone(track);
                await track.plugin.instance?._audioNode.setState(plugins);

                let state = await track.plugin.instance?._audioNode.getState();

                let statePluginPromise = new Promise<void>((resolve, reject) => {
                    const interval = setInterval(async () => {
                        if (state.current.length === plugins.current.length) {
                            await this.app.automationController.getAllAutomations(track);
                            clearInterval(interval);
                            resolve();
                        }
                        state = await track.plugin.instance?._audioNode.getState();
                    }, 100);
                });
                await statePluginPromise;

                let automations = trackJson.automations;
                for (let automation of automations) {
                    let bpf = track.automation.getBpfOfparam(automation.param);
                    if (bpf !== undefined) {
                        bpf.state = automation.state;
                    }
                }
            }

            let regions = trackJson.regions;
            this.app.tracksController.loadTrackRegions(track, regions, data.id);
        }

        // let reader = new FileReader();
        // reader.onload = async (e) => {
        //     let zip = await JSZip.loadAsync(e.target!.result);
        //     let project = JSON.parse(await zip.file("project.json")!.async("string"));
        //     let audio = zip.folder("audio")!;
        // ...
        // ...
        // ...
        // }
        //
        // reader.readAsArrayBuffer(file);
    }
}