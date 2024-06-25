import App from "../App";
import { MIDI } from "../Audio/MIDI";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import { State } from "../Components/BPF";
import MIDIRegion from "../Models/Region/MIDIRegion";
import { RegionOf, RegionType } from "../Models/Region/Region";
import SampleRegion from "../Models/Region/SampleRegion";
import Track from "../Models/Track/Track";
import { audioCtx } from "../index";


// TODO A better way to check compatibility with the project version without having to add all the compatible versions in the array.
/** The current project version */
const CURRENT_PROJECT_VERSION="project-1.0"

/**
 * The list of compatible versions of the project format.
 * Allow some backward compatibility.
 */
const compatible_version=[CURRENT_PROJECT_VERSION]

/** Loaders to load regions. */
const regionLoaders: {
    [key: RegionType<any>] : {
        loader: (editor:Blob)=>Promise<RegionOf<any>>,
        extension: string,
    }
} = {
    [MIDIRegion.TYPE]:{
        loader: async blob => new MIDIRegion(await MIDI.load(blob),0),
        extension: "wamstudiomidi",
    },
    [SampleRegion.TYPE]:{
        loader: async blob =>{
            const audioBuffer = await audioCtx.decodeAudioData(await blob.arrayBuffer());
            const opAudioBuffer = OperableAudioBuffer.make(audioBuffer);
            return new SampleRegion(opAudioBuffer,0)
        },
        extension: "wav",
    },
}


/** The project data format. */
export interface ProjectData {
    version: string;
    host: {
        playhead: number;
        volume: number;
        plugin?: {
            name: string;
            state: any;
        };
    }
    tracks:{
        name: string;
        muted: boolean;
        solo: boolean;
        balance: number;
        volume: number;
        color: string;
        plugin?: {
            name: string;
            state: any;
        };
        automations:{
            param: string;
            state: State
        }[];
        regions:{
            type: string;
            content_name: string;
            start: number;
        }[]
    }[];
}

/**
 * The region content format.
 * Separated from the project data to allow loading regions asynchronously.
 */
export interface RegionContent{
    content_name:string;
    blob:Blob;
}

export default class Loader {
    _app: App;

    constructor(app: App) {
        this._app = app;
    }

    /**
     * Save the current project.
     * @returns The current project data.
     */
    async saveProject(): Promise<[ProjectData,RegionContent[]]> {

        let pluginHostState = await this._app.host.plugin?.getState();
        
        // Save the tracks
        let contents: RegionContent[] = [];
        let tracks: ProjectData['tracks'] = [];
        for (let track of this._app.tracksController.tracks) {
            // Add automations to the track
            let automations: ProjectData['tracks'][0]['automations'] = [];
            let pluginState=await track.plugin?.getState()
            let pluginData= pluginState ? undefined : {name:track.plugin!.name,state:pluginState}
            
            if (pluginState) {
                let parameters = await track.plugin!.instance!._audioNode.getParameterInfo();
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

            // Add regions to the track
            let regions: ProjectData['tracks'][0]['regions'] = [];
            for (let region of track.regions) {
                let content_name=`track-${track.id}-region-${region.id}`

                const extension=regionLoaders[region.regionType]?.extension
                if(extension)content_name+=`.${extension}`

                contents.push({
                    content_name,
                    blob:region.save()
                });
                regions.push({
                    content_name,
                    type: region.regionType,
                    start: region.start,
                });
            }

            tracks.push({
                name: track.element.name,
                color: track.color,
                muted: track.isMuted,
                solo: track.isSolo,
                volume: track.volume,
                balance: track.balance,
                plugin: pluginData,
                regions: regions,
                automations: automations
            });
        }

        let project: ProjectData = {
            version: CURRENT_PROJECT_VERSION,
            host: {
                playhead: this._app.host.playhead,
                volume: this._app.host.volume,
                plugin: pluginHostState
            },
            tracks: tracks
        }
        console.log("Save Project:",project,contents)
        return [project,contents]
    }

    async loadProject(data: ProjectData, contents: (id:string)=>XMLHttpRequest) {
        let project: ProjectData = data;
        console.log("Load Project:", project)

        // Version check
        let version = project.version;
        if (!compatible_version.includes(version)){
            alert(`Incompatible project version: ${version}. Expected: ${compatible_version.join(", ")}`);
            return;
        }

        let tracksJson = project.tracks;
        this._app.hostController.stopAllTracks();
        this._app.tracksController.clearTracks();
        this._app.host.playhead = 0;
        this._app.host.volume=project.host.volume;

        if (project.host.plugin) {
            //Remember: this._app.host.pluginWAM
            //await this._app.host.plugin?.instantiate(audioCtx,this._app.host.hostGroupId);
            const plugin=await this._app.pluginsController.fetchPlugin(project.host.plugin.name)
            if(!plugin)return
            await this._app.host.connectPlugin(plugin);
            await this._app.host.plugin?.setState(project.host.plugin.state)
            //TODO this._app.pluginsController.connectPedalBoard(this._app.host);
            //this._app.pluginsView.movePluginLoadingZone(this._app.host);
        }

        // Load tracks
        for (const trackJson of tracksJson) {
            let track = await this._app.tracksController.createTrack();

            track.element.name = trackJson.name;
            track.element.trackNameInput.value = trackJson.name;

            track.isMuted= trackJson.muted
            track.isSolo= trackJson.solo
            track.balance= trackJson.balance;
            track.volume= trackJson.volume;
            this._app.tracksController.setColor(track, trackJson.color);

            const pluginData = trackJson.plugin;
            if (pluginData) {
                const plugin=await this._app.pluginsController.fetchPlugin(pluginData.name)
                if(!plugin)return
                await this._app.host.connectPlugin(plugin);
                await this._app.host.plugin?.setState(pluginData.state)
                //await track.plugin.initPlugin(this._app.host.pluginWAM, audioCtx);
                this._app.pluginsView.movePluginLoadingZone(track);
                await this._app.automationController.updateAutomations(track);

                let automations = trackJson.automations;
                for (let automation of automations) {
                    let bpf = track.automation.getBpfOfParam(automation.param);
                    
                    if (bpf !== undefined) {
                        bpf.state = automation.state;
                    }
                }
            }

            let regions = trackJson.regions;
            this.loadTrackRegions(track, regions, contents);
        }
    }

    loadTrackRegions(track: Track, regions: ProjectData['tracks'][0]['regions'], contents: (id:string)=>XMLHttpRequest) {
        let loadedRegions = 0;
        let totalSize = new Map();
        let totalLoaded = 0;

        for (let region of regions) {
            const decoder=regionLoaders[region.type]?.loader
            if(!decoder)continue

            let xhr = contents(region.content_name)
            xhr.responseType = 'blob'

            // Loading
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

            // Finish Loading
            xhr.onload = async () => {
                if (xhr.status == 200) {
                    loadedRegions++;
                        
                    let audioArrayBuffer = xhr.response as Blob
                    let newRegion = await decoder(audioArrayBuffer)

                    if (track.deleted) {
                        xhr.abort();
                        return;
                    }

                    newRegion.start = region.start;
                    this._app.regionsController.addRegion(track, newRegion);

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

    loadTrackUrl(track: Track, url: string) {
        console.log("Load Track" +url)

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
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
                        let operableAudioBuffer = OperableAudioBuffer.make(audioBuffer);
                        operableAudioBuffer = operableAudioBuffer.makeStereo();
                        this._app.regionsController.addRegion(track, new SampleRegion(operableAudioBuffer,0));
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