import App from "../App";
import Track from "../Models/Track";

export default class Loader {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async saveProject(name: string) {

        if (false) {
            // check if project exists with this name
        }

        let tracks = [];
        for (let track of this.app.tracks.trackList) {
            let hasPlugin = track.plugin.initialized;
            let pluginState = null;

            if (hasPlugin) {
                pluginState = await track.plugin.instance!._audioNode.getState();
            }

            let control = this.app.trackControlController.getControl(track.id);
            let binds = [];

            if (control) {
                for (let bind of control.binds) {
                    let bindParameters = [];
                    for (let bindParam of bind.bindParameters) {
                        console.log(bindParam)
                        bindParameters.push({
                            "param": bindParam.selected,
                            "originalMin": bindParam.originalMin,
                            "originalMax": bindParam.originalMax,
                            "min": bindParam.min,
                            "max": bindParam.max
                        });
                    }
                    binds.push({
                        "name": bind.bindName,
                        "value": bind.trackBindElement.slider.value,
                        "parameters": bindParameters
                    });
                }
            }

            tracks.push({
                "name": track.element.name,
                "id": track.id,
                "url": track.url ? track.url : null,
                "muted": track.isMuted,
                "soloed": track.isSolo,
                "volume": track.volume,
                "pan": track.pannerNode.pan.value,
                "plugin": hasPlugin ? pluginState : null,
                "binds": binds
            });
        }

        let date = new Date().toISOString();
        let project = {
            "name": name,
            "date": date,
            "trackIdCount": this.app.tracks.trackIdCount,
            "tracks": tracks
        }

        let fileName = `${name}_${date}.json`;
        let blob = new Blob([JSON.stringify(project)], {type: "application/json"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        a.remove();
    }

    async loadProject(json: any) {
        let cover = document.createElement("div");
        cover.classList.add("cover");

        let coverText = document.createElement("div");
        coverText.classList.add("cover-text");
        coverText.textContent = "Loading project";

        cover.appendChild(coverText);
        document.body.appendChild(cover);



        this.app.hostController.playing = false;
        this.app.hostController.stopAll();
        this.app.tracksController.clearAllTracks();
        this.app.trackControlController.clearAllControls();
        this.app.host.timer = 0;
        this.app.host.playhead = 0;
        this.app.tracks.trackIdCount = 1;

        this.app.pluginsView.showFloatingWindow();
        this.app.controlsView.showAdvancedWindow();

        let trackInitializedPromise = json.tracks.map(async (trackJson: any) => {
            let track: Track;
            if (trackJson.url === null) {
                track = await this.app.tracks.newEmptyTrack();
            }
            else {
                track = await this.app.tracks.newTrackUrl(trackJson.url);
            }

            await this.app.tracksController.initTrackComponents(track);
            track.element.name = trackJson.name;
            track.isMuted = trackJson.muted;
            track.isSolo = trackJson.soloed;
            track.volume = trackJson.volume;
            track.pannerNode.pan.value = trackJson.pan;

            if (trackJson.plugin) {
                await track.plugin.initPlugin();
                this.app.pluginsView.mount.appendChild(track.plugin.dom);
                this.app.tracksController.connectPlugin(track);

                let statePlugin = new Promise<void>(async(resolve) => {
                    setTimeout(() => {
                        const checkState = setInterval(async () => {
                            if (await track.plugin.instance!._audioNode.getState()) {
                                await track.plugin.instance!._audioNode.setState(trackJson.plugin);
                                clearInterval(checkState);
                                resolve();
                            }
                        }, 10);
                    }, 1000);

                });
                await statePlugin;
            }
        });

        await Promise.all(trackInitializedPromise);

        let trackBindInitializedPromise = json.tracks.map(async (trackJson: any) => {
            let track = this.app.tracks.getTrack(trackJson.id);
            let control = this.app.trackControlController.getControl(track!.id);

            let bindInitializedPromise = trackJson.binds.map(async (bindJson: any) => {
                await this.app.trackControlController.createBindJsonAsync(control!, bindJson.name);
                let bind = control!.binds[control!.binds.length - 1];
                bind.trackBindElement.slider.value = bindJson.value;

                for (let parameterJson of bindJson.parameters) {
                    let parameter = await this.app.trackControlController.addParameterAsync(control!, bind);
                    parameter.originalMax = parameterJson.originalMax;
                    parameter.originalMin = parameterJson.originalMin;
                    parameter.setMax(parameterJson.max);
                    parameter.setMin(parameterJson.min);
                    parameter.selected = parameterJson.param;
                    parameter.options.value = parameterJson.param;
                }
                control!.advancedElement.parametersContainer.innerHTML = "";
            });

            await Promise.all(bindInitializedPromise);
        });

        await Promise.all(trackBindInitializedPromise);

        this.app.controlsView.advancedMount.innerHTML = "";
        this.app.pluginsView.mount.innerHTML = "";
        this.app.pluginsView.hideFloatingWindow();
        this.app.controlsView.closeAdvanced();

        cover.remove();
    }
}