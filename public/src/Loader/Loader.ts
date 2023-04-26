import App from "../App";
import JSZip from "jszip";
import {bufferToWave} from "../Audio/Utils/audioBufferToFlac";
import APP_VERSION from "../version";


export default class Loader {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async saveProject() {
        const zip = new JSZip();
        const audio = zip.folder("audio")!;

        // TODO Total TRACK ACC
        let tracks = [];
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
                audio.file(name, blob);
                let regionJson = {
                    "id": region.id,
                    "path": `audio/${name}`,
                    "start": region.start,
                    "duration": region.duration
                }
                regions.push(regionJson);
            }

            let trackJson = {
                "track": {
                    "name": track.element.name,
                    "muted": track.isMuted,
                    "soloed": track.isSolo,
                    "volume": track.volume,
                    "pan": track.pannerNode.pan.value,
                    "plugins": hasPlugin ? pluginState : null,
                    "regions": regions,
                    "automations": automations
                }
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
            },
            "tracks": tracks
        }

        zip.file("project.json", JSON.stringify(project));

        let content = await zip.generateAsync({type: "blob"})

        const new_file = URL.createObjectURL(content);
        const link = document.createElement("a")
        link.href = new_file
        link.download = "project.zip"
        link.click()
        link.remove()
    }



    loadProject(_file: File) {
        // let reader = new FileReader();
        // reader.onload = async (e) => {
        //     let zip = await JSZip.loadAsync(e.target!.result);
        //     let project = JSON.parse(await zip.file("project.json")!.async("string"));
        //     let audio = zip.folder("audio")!;
        //
        //
        //     this.app.hostController.stopAll();
        //     this.app.tracksController.clearAllTracks();
        //
        //     this.app.tracksController.trackIdCount = project.host.trackAcc;
        //     this.app.regionsController.regionIdCounter = project.host.regionAcc;
        //
        //     this.app.host.timer = project.host.timer;
        //     this.app.host.playhead = project.host.playhead;
        //     this.app.host.isMuted = project.host.muted;
        //     this.app.host.volume = project.host.volume;
        //     this.app.hostController.playing = project.host.playing;
        //     this.app.recorderController.recording = project.host.recording;
        //
        //     for (let track of project.tracks) {
        //         let trackJson = track.track;
        //         let newTrack = this.app.tracksController.createTrack(trackJson.name);
        //         newTrack.isMuted = trackJson.muted;
        //         newTrack.isSolo = trackJson.soloed;
        //         newTrack.volume = trackJson.volume;
        //         newTrack.pannerNode.pan.value = trackJson.pan;
        //
        //         if (trackJson.plugins !== null) {
        //             await newTrack.plugin.initPlugin()
        //             await newTrack.plugin.instance!._audioNode.setState(trackJson.plugins);
        //         }
        //
        //         for (let region of trackJson.regions) {
        //             let buffer = await audio.file(region.path)!.async("arraybuffer");
        //             let audioBuffer = await this.app.audioContext.decodeAudioData(buffer);
        //             newTrack.addRegion(audioBuffer, region.start, region.duration);
        //         }
        //
        //         for (let automation of trackJson.automations) {
        //             let bpf = newTrack.automation.getBpfOfparam(automation.param);
        //             if (bpf !== undefined) {
        //                 bpf.state = automation.state;
        //             }
        //         }
        //     }
        // }
        // reader.readAsArrayBuffer(file);
    }
}