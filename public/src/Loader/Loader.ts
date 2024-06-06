import App from "../App";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import { bufferToWave } from "../Audio/Utils/audioBufferToWave";
import { BACKEND_URL } from "../Env";
import SampleRegion from "../Models/Region/SampleRegion";
import SampleTrack from "../Models/Track/SampleTrack";
import { audioCtx } from "../index";
import APP_VERSION from "../version";


export default class Loader {
    _app: App;

    constructor(app: App) {
        this._app = app;
    }

    async saveProject() {
        let wavs = [];
        let tracks = [];

        let pluginHostState = null;
        if (this._app.host.plugin.initialized) {
            pluginHostState = await this._app.host.plugin.instance!._audioNode.getState();
        }

        for (let track of this._app.tracksController.sampleTracks) {
            let hasPlugin = track.plugin.initialized;
            let pluginState = null;

            let automations = [];
            if (hasPlugin) {
                pluginState = await track.plugin.instance!._audioNode.getState();
                let parameters = await track.plugin.instance!._audioNode.getParameterInfo();
                for (let param in parameters) {
                    let bpf = track.automation.getBpfOfParam(param);
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

            let regions = [];
            for (let region of track.regions) {
                let name = `Track-${track.id}_Region-${region.id}.wav`
                let blob = bufferToWave(region.buffer);
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
                "pan": track.balance,
                "plugins": hasPlugin ? pluginState : null,
                "regions": regions,
                "automations": automations
            }
            tracks.push(trackJson);
        }

        let project = {
            "host": {
                "version": APP_VERSION,
                "playhead": this._app.host.playhead,
                "muted": this._app.host.isMuted,
                "volume": this._app.host.volume,
                "trackAcc": this._app.tracksController.trackIdCount,
                "regionAcc": this._app.regionsController.regionIdCounter,
                "plugin": pluginHostState
            },
            "tracks": tracks
        }

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

        let tracksJson = project.tracks;

        this._app.hostController.stopAllTracks();
        this._app.tracksController.clearAllTracks();
        this._app.host.playhead = 0;
        this._app.tracksController.trackIdCount = 1;
        this._app.host.volume=project.host.volume;

        if (project.host.plugin !== null) {
            await this._app.host.plugin.initPlugin(this._app.host.pluginWAM, audioCtx);
            this._app.pluginsController.connectPedalBoard(this._app.host);
            this._app.pluginsView.movePluginLoadingZone(this._app.host);
            await this._app.host.plugin.instance?._audioNode.setState(project.host.plugin);
        }

        for (const trackJson of tracksJson) {
            let track = await this._app.tracksController.createEmptySampleTrack();
            track.id = trackJson.id;

            this._app.tracksController.addTrack(this._app.tracksController.sampleTracks, track);

            track.element.name = trackJson.name;
            track.element.trackNameInput.value = trackJson.name;

            if (trackJson.muted) track.isMuted=true
            if (trackJson.soloed) track.isSolo=true

            track.balance=trackJson.pan;
            track.volume=trackJson.volume;
            track.element.volumeSlider.value = (trackJson.volume*100).toString();
            track.element.balanceSlider.value = trackJson.pan;
            this._app.tracksView.setColor(track, trackJson.color);

            let plugins = trackJson.plugins;
            if (plugins !== null) {
                await track.plugin.initPlugin(this._app.host.pluginWAM, audioCtx);
                this._app.pluginsController.connectPedalBoard(track);
                this._app.pluginsView.movePluginLoadingZone(track);

                await track.plugin.setStateAsync(plugins);
                await this._app.automationController.updateAutomations(track);

                let automations = trackJson.automations;
                for (let automation of automations) {
                    console.log(automation.param);
                    
                    let bpf = track.automation.getBpfOfParam(automation.param);
                    console.log(bpf);
                    
                    if (bpf !== undefined) {
                        bpf.state = automation.state;
                    }
                }
            }

            let regions = trackJson.regions;
            this.loadTrackRegions(track, regions, data.id);
        }
    }

    loadTrackRegions(track: SampleTrack, regions: any, projectId: string) {
        let loadedRegions = 0;
        let totalSize = new Map();
        let totalLoaded = 0;

        for (let region of regions) {
            let url = `${BACKEND_URL}/projects/${projectId}/${region.path}`;

            let xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';

            xhr.onprogress = (event) => {
                if (event.lengthComputable) {
                    totalLoaded -= totalSize.get(xhr) || 0;  // remove old value
                    totalLoaded = Math.max(totalLoaded, 0);  // prevent negative values
                    totalSize.set(xhr, event.total);  // update total size
                    totalLoaded += event.loaded;  // update loaded size

                    let totalSizeSum = Array.from(totalSize.values()).reduce((a, b) => a + b, 0);
                    let percentComplete = (totalLoaded / totalSizeSum) * 100;

                    if (track.deleted) {
                        xhr.abort();
                        return;
                    }

                    track.element.progress(percentComplete, totalLoaded, totalSizeSum);
                }
            };

            xhr.onload = async () => {
                if (xhr.status == 200) {
                    loadedRegions++;
                    let audioArrayBuffer = xhr.response;
                    let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

                    if (track.deleted) {
                        xhr.abort();
                        return;
                    }

                    let opAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;
                    this._app.regionsController.createRegion(track, id=>new SampleRegion(track.id,opAudioBuffer,region.start,id));

                    // All regions have been loaded, call progressDone
                    if (loadedRegions === regions.length) {
                        track.element.progressDone();
                    }
                } else {
                    console.error('An error occurred fetching the track region:', xhr.statusText);
                }
            };

            xhr.onerror = () => {
                console.error('An error occurred fetching the track region');
            };

            xhr.send();
        }
    }

    loadTrackUrl(track: SampleTrack) {
        console.log("Load Track" +track.url)
        if (!track.url) return;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', track.url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onprogress = (event) => {
            if (event.lengthComputable) {
                let percentComplete = event.loaded / event.total * 100;
                // update progress bar on track element
                // Stop the request if the track has been removed
                if (track.deleted) {
                    xhr.abort();
                    return;
                }
                track.element.progress(percentComplete, event.loaded, event.total);
            }
        };

        xhr.onload = () => {
            if (xhr.status == 200) {
                let audioArrayBuffer = xhr.response;
                audioCtx.decodeAudioData(audioArrayBuffer)
                    .then((audioBuffer) => {
                        if (track.deleted) {
                            xhr.abort();
                            return;
                        }
                        let operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;
                        operableAudioBuffer = operableAudioBuffer.makeStereo();
                        this._app.regionsController.createRegion(track, id=>new SampleRegion(track.id,operableAudioBuffer,0,id));
                        track.element.progressDone();
                    });
            } else {
                // Error occurred during the request
                console.error('An error occurred fetching the track:', xhr.statusText);
            }
        };

        xhr.onerror = () => {
            console.error('An error occurred fetching the track');
        };

        xhr.send();
    }
}