import App from "../App";
import { MIDI } from "../Audio/MIDI/MIDI";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import { State } from "../Components/BPF";
import MIDIRegion from "../Models/Region/MIDIRegion";
import { RegionOf, RegionType } from "../Models/Region/Region";
import SampleRegion from "../Models/Region/SampleRegion";
import Track from "../Models/Track/Track";
import { audioCtx } from "../index";


/**
 * The current project version.
 * A project with a greater version number is not compatible.
 * A project with a different major version number is not compatible.
 * Increment the major version number when the project format changes in a way that is not backward compatible.
 * Increment the minor version number when the project format changes in a way that is backward but not forward compatible.
 */
const CURRENT_PROJECT_VERSION: [number,number]=[1,0]

/** Loaders to load regions. */
const regionLoaders: {
    [key: RegionType<any>] : {
        loader: (buffer:ArrayBuffer)=>Promise<RegionOf<any>>,
        extension: string,
    }
} = {
    [MIDIRegion.TYPE]:{
        loader: async buffer => new MIDIRegion(await MIDI.load(buffer),0),
        extension: "wamstudiomidi",
    },
    [SampleRegion.TYPE]:{
        loader: async buffer =>{
            const audioBuffer = await audioCtx.decodeAudioData(buffer);
            const opAudioBuffer = OperableAudioBuffer.make(audioBuffer);
            return new SampleRegion(opAudioBuffer,0)
        },
        extension: "wav",
    },
}


/** The project data format. */
export interface ProjectData {
    version: [major:number, minor:number];
    host: {
        playhead: number;
        tempo: number,
        time_signature: [number,number],
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
            let pluginData= pluginState ? {name:track.plugin!.name,state:pluginState} : undefined
            
            if (pluginData) {
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
                tempo: this._app.hostView.tempoSelector.tempo,
                time_signature: this._app.hostView.timeSignatureSelector.timeSignature,
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
        {
            let error_message=null
            let version = project.version;
            if(!Array.isArray(version) || version.length!=2)error_message= `The project version(${version}) is invalid, the project incompatible`
            if(version[0]<CURRENT_PROJECT_VERSION[0])error_message= `The project version(${version.join(".")}) is too old`
            else if(version[0]>CURRENT_PROJECT_VERSION[0])error_message= `The project version(${version.join(".")}) is too recent. Use a more recent version WAMStudio`
            else if(version[1]>CURRENT_PROJECT_VERSION[1])error_message= `The project version(${version.join(".")}) is too recent. Use a more recent version WAMStudio`
            if(error_message!=null){
                alert(`${error_message}. WAM Studio version: ${CURRENT_PROJECT_VERSION.join(".")}`)
                return
            }
        }

        let tracksJson = project.tracks
        this._app.hostController.stopAllTracks()
        this._app.tracksController.clearTracks()
        this._app.host.playhead = 0
        this._app.host.volume=project.host.volume
        this._app.hostView.tempoSelector.tempo = project.host.tempo
        this._app.hostView.timeSignatureSelector.timeSignature = project.host.time_signature

        if (project.host.plugin) {
            const plugin=await this._app.pluginsController.fetchPlugin(project.host.plugin.name)
            if(plugin){
                await this._app.host.connectPlugin(plugin);
            await this._app.host.plugin?.setState(project.host.plugin.state)
            }
        }

        // Load tracks
        for (const trackJson of tracksJson) {
            let track = await this._app.tracksController.createTrack();

            track.element.name = trackJson.name
            track.element.trackNameInput.value = trackJson.name

            track.isMuted= trackJson.muted
            track.isSolo= trackJson.solo
            track.balance= trackJson.balance
            track.volume= trackJson.volume
            this._app.tracksController.setColor(track, trackJson.color)

            const pluginData = trackJson.plugin;
            console.log("Load Plugin",pluginData)
            if (pluginData) {
                const plugin=await this._app.pluginsController.fetchPlugin(pluginData.name)
                if(plugin){
                    await this._app.pluginsController.connectPlugin(track,plugin);
                    await track.plugin?.setState(pluginData.state)
                    await this._app.automationController.updateAutomations(track);
                }
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
            xhr.responseType = "arraybuffer"

            // Loading
            xhr.onprogress = (event) => {
                if (event.lengthComputable) {
                    totalLoaded -= totalSize.get(xhr) || 0;  // remove old value
                    totalLoaded = Math.max(totalLoaded, 0);  // prevent negative values
                    totalSize.set(xhr, event.total);  // update total size
                    totalLoaded += event.loaded;  // update loaded size

                    let totalSizeSum = Array.from(totalSize.values()).reduce((a, b) => a + b, 0);

                    if (track.deleted) {
                        xhr.abort();
                        return;
                    }

                    track.element.progress(totalLoaded, totalSizeSum);
                }
            };

            // Finish Loading
            xhr.onload = async () => {
                if (xhr.status == 200) {
                    loadedRegions++;
                        
                    let audioArrayBuffer = xhr.response as ArrayBuffer
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
                // update progress bar on track element
                // Stop the request if the track has been removed
                if (track.deleted) {
                    xhr.abort();
                    return;
                }
                track.element.progress(event.loaded, event.total);
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