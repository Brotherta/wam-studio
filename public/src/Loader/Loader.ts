import App from "../App";
import Track from "../Models/Track";
import Parameter from "../Models/Parameter";
import i18n from "../i18n";

export default class Loader {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async saveProject() {
        let tracks = [];
        for (let track of this.app.tracksController.trackList) {
                let hasPlugin = track.plugin.initialized;
                let pluginState = null;

                if (hasPlugin) {
                    pluginState = await track.plugin.instance!._audioNode.getState();
                }

                let binds = [];
                for (let bind of track.bindControl.binds) {
                    let bindParameters = [];
                    for (let bindParam of bind.parameters) {
                        bindParameters.push({
                            "param": bindParam.parameterName,
                            "min": bindParam.min,
                            "max": bindParam.max,
                            "currentMax": bindParam.currentMax,
                            "currentMin": bindParam.currentMin,
                            "discreteStep": bindParam.discreteStep
                        });
                    }
                    binds.push({
                        "name": bind.name,
                        "currentValue": bind.currentValue,
                        "parameters": bindParameters
                    });
                }

                let preset = track.bindControl.advElement.presetsSelect.value;

                tracks.push({
                    "name": track.element.name, // TODO: saving track name in japanese? or save in english?
                    "id": track.id,
                    "url": track.url ? track.url : null,
                    "tag": track.tag,
                    "muted": track.isMuted,
                    "soloed": track.isSolo,
                    "volume": track.volume,
                    "pan": track.pannerNode.pan.value,
                    "plugin": hasPlugin ? pluginState : null,
                    "presetName": preset ? preset : null,
                    "binds": binds,
                });
        }

        return {
            "songName": this.app.hostView.headerTitle.innerHTML,
            "tracks": tracks
        }
    }

    async loadProject(json: any) {

        this.app.hostController.playing = false;
        this.app.hostController.stop();
        this.app.tracksController.clearAllTracks();
        this.app.host.timer = 0;
        this.app.host.playhead = 0;
        this.app.tracksController.trackIdCount = 1;


        this.app.hostView.headerTitle.innerHTML = json.songName;

        for (let trackJson of json.tracks) {
            let track: Track;
            if (trackJson.url === null) {
                track = await this.app.tracksController.newEmptyTrack();
                await this.app.tracksController.initTrackComponents(track);
            }
            else {
                track = await this.app.tracksController.newEmptyTrack(trackJson);
                await this.app.tracksController.initTrackComponents(track);
                await this.app.tracksController.loadTrackUrl(track);
            }

            track.id = trackJson.id;
            track.tag = trackJson.tag;
            track.plugin.state = trackJson.plugin;

            await track.plugin.setStateAsync(trackJson.plugin);

            track.element.name = trackJson.name;
            // Change displayed language to japanese if it's set to japanese
            if (i18n.language === "ja") {
                track.element.trackNameInput.value = i18n.t(trackJson.tag);
            } else {
                track.element.trackNameInput.value = trackJson.name;
            }
            if (trackJson.muted) track.element.mute();
            if (trackJson.soloed) track.element.solo();
            track.setVolume(trackJson.volume);
            track.setBalance(trackJson.pan);
            track.volumeSlider.slider.value = (trackJson.volume*100).toString();
            track.volumeSlider.valueLabel.innerText = (trackJson.volume*100).toString();
            track.element.balanceSlider.value = trackJson.pan;

            if (trackJson.presetName) {
                track.bindControl.advElement.presetsSelect.value = trackJson.presetName;
                track.bindControl.trackBindElement.presetsSelect.value = trackJson.presetName;
            }

            let paramInfo = await track.plugin.instance!._audioNode.getParameterInfo();

            if (trackJson.binds) {
                for (let bindJson of trackJson.binds) {
                    let bind = await this.app.bindsController.createBind(track, bindJson.name, bindJson.currentValue);

                    for (let parameterJson of bindJson.parameters) {
                        let parameter = await this.app.bindsController.createParameter(track, bindJson.name);
                        parameter?.refreshParam(paramInfo);

                        let parameterClone = new Parameter(parameterJson.param, parameterJson.max, parameterJson.min, parameterJson.discreteStep);
                        parameterClone.currentMax = parameterJson.currentMax;
                        parameterClone.currentMin = parameterJson.currentMin;

                        await this.app.bindsController.updateParameter(track, bind!, parameter!, parameterClone);
                    }
                    await this.app.bindsController.updateBindValue(track, bind!, bindJson.currentValue);
                }
                await this.app.bindsController.selectBind(track);
            }
        }

        setTimeout(() => {
            this.app.pluginsView.mount.innerHTML = "";
            this.app.pluginsView.hideFloatingWindow();
        }, 500);

    }
}