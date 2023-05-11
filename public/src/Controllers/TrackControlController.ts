// import App from "../App";
// import TrackControl from "../Models/TrackControl";
// import Track from "../Models/Track";
// import TrackControlElement from "../Components/TrackControlElement";
// import AdvancedControlElement from "../Components/AdvancedControlElement";
// import BindOld from "../Models/BindOld";
// import BindParameterElement from "../Components/BindParameterElement";
// import TrackBindControlElement from "../Components/TrackBindControlElement";
// import {getMinMax} from "../Utils/Normalizer";
// import Preset from "../Models/Preset";
//
//
// export default class TrackControlController {
//
//     app: App;
//
//     controls: TrackControl[];
//
//     constructor(app: App) {
//         this.app = app;
//         this.controls = [];
//         this.loadPresets();
//     }
//
//     async loadPresets() {
//     }
//
//     addControl(control: TrackControl) {
//         this.controls.push(control);
//     }
//
//     removeControl(trackId: number) {
//         let index = this.controls.findIndex(control => control.trackId === trackId);
//         this.controls.splice(index, 1);
//     }
//
//     getControl(trackId: number): TrackControl | undefined {
//         return this.controls.find(control => control.trackId === trackId);
//     }
//
//     addTrackControl(track: Track) {
//         let controlElement = document.createElement('control-element') as TrackControlElement;
//         controlElement.trackId = track.id;
//         controlElement.id = "control-" + track.id;
//
//         let advancedElement = document.createElement('advanced-element') as AdvancedControlElement;
//         advancedElement.id = "advanced-" + track.id;
//
//         let control = new TrackControl(track.id, controlElement, advancedElement);
//         this.addControl(control);
//         this.app.controlsView.addControl(control.controlElement);
//         advancedElement.control = control;
//
//         advancedElement.tag = track.tag;
//         let presets = this.app.presetsController.getAllPresets(track.tag);
//         let defaultPreset = presets.find(p => p.name == "Default");
//         if (defaultPreset != undefined) {
//             advancedElement.selectedPreset = defaultPreset;
//             control.binds = defaultPreset.binds;
//             // @ts-ignore
//             if (advancedElement.presetsOptions.find(p => p == defaultPreset.name) == undefined) {
//                 advancedElement.presetsOptions.push(defaultPreset.name);
//             }
//         }
//         this.app.controlsView.advancedMount.appendChild(control.advancedElement);
//         control.advancedElement.hidden = true;
//
//         track.element.settingsBtn.addEventListener('click', async () => {
//             await this.refreshPluginsParameters(track, control);
//             control.advancedElement.updatePresetsOptions();
//             this.app.controlsView.hideAllAdvanced();
//             control.advancedElement.hidden = false;
//             this.app.controlsView.advancedWindow.hidden = false;
//             this.app.controlsView.advancedTitle.innerText = "Advanced Settings - " + track.element.name;
//         });
//     }
//
//     removeTrackControl(track: Track) {
//         this.removeControl(track.id);
//         this.app.controlsView.removeControl(track.id);
//         this.app.controlsView.closeAdvanced();
//     }
//
//     clearAllControls() {
//         for (let control of this.controls) {
//             this.app.controlsView.removeControl(control.trackId);
//         }
//         this.controls = [];
//     }
//
//     async refreshPluginsParameters(track: Track, control: TrackControl) {
//         let plugin = track.plugin;
//         if (plugin.initialized) {
//             let params = await plugin.instance?._audioNode.getParameterInfo();
//             if (params != undefined) control.advancedElement.refreshBindParams(params);
//         }
//     }
//
//     defineAdvancedControlListeners(control: TrackControl) {
//         let advElement = control.advancedElement;
//         let track = this.app.tracks.getTrack(control.trackId)!
//
//         advElement.removeBindButton.addEventListener('click', () => {
//            this.removeBind(control);
//         });
//         advElement.addParamButton.addEventListener('click', () => {
//             this.addParameterToBind(control);
//         });
//         advElement.newBindButton.addEventListener('click', () => {
//             this.createBindParameter(control);
//         });
//         advElement.refreshParamButton.addEventListener('click', () => {
//            this.refreshPluginsParameters(track, control);
//         });
//         advElement.presetsSelect.addEventListener('change', () => {
//             this.app.presetsController.selectPreset(control, track);
//         });
//         advElement.savePresetButton.addEventListener('click', () => {
//             // this.app.presetsController.savePreset(control, track);
//         });
//         advElement.deletePresetButton.addEventListener('click', () => {
//             // this.app.presetsController.deletePreset(control, track);
//         });
//     }
//
//     defineTrackControlListeners(control: TrackControl) {
//         let ctrlElement = control.controlElement;
//         ctrlElement.addEventListener('click', () => {
//             // this.app.tracksController.selectTrack(control.trackId);
//         });
//     }
//
//     createBindParameter(control: TrackControl) {
//         let name = window.prompt("Enter the name of the bind", "Bind name");
//         if (name == null) {
//             alert("Bind name cannot be empty");
//             return;
//         }
//
//         this.createBind(control, name);
//     }
//
//     createBind(control: TrackControl, name: string) {
//         let trackBind = document.createElement("track-bind-control-element") as TrackBindControlElement;
//
//         let btn = control.advancedElement.addBindButton(name);
//         let bind = new BindOld(name, trackBind, btn);
//         btn.onclick = async () => {
//             control.advancedElement.clickBind(btn, bind);
//         }
//
//         // TODO Check for existing
//
//         control.binds.push(bind);
//
//         control.controlElement.controlsContainer.appendChild(trackBind);
//         trackBind.setNameLabel(name);
//         trackBind.slider.oninput = async () => {
//             await this.updatePluginParameter(trackBind.slider.value, control, bind);
//         }
//     }
//
//     async createBindJsonAsync(control: TrackControl, name: string) {
//         let trackBind = document.createElement("track-bind-control-element") as TrackBindControlElement;
//         this.app.controlsView.advancedMount.appendChild(control.advancedElement);
//         control.controlElement.controlsContainer.appendChild(trackBind);
//
//         let trackPromise = new Promise<void>((resolve) => {
//             const checkTrackBindInitiated = setInterval(() => {
//                 if (trackBind.slider) {
//                     clearInterval(checkTrackBindInitiated);
//                     resolve();
//                 }
//             }, 100);
//         });
//         await trackPromise;
//
//         let btn = control.advancedElement.addBindButton(name);
//         let bind = new BindOld(name, trackBind, btn);
//         btn.onclick = async () => {
//             control.advancedElement.clickBind(btn, bind);
//         }
//
//         // TODO Check for existing
//
//         control.binds.push(bind);
//
//         trackBind.setNameLabel(name);
//         trackBind.slider.oninput = async () => {
//             await this.updatePluginParameter(trackBind.slider.value, control, bind);
//         }
//     }
//
//     addParameterToBind(control: TrackControl) {
//         if (control.advancedElement.activeBind == undefined) {
//             alert("No bind selected");
//             return;
//         }
//         else {
//             this.addParameter(control, control.advancedElement.activeBind);
//         }
//     }
//
//     async addParameter(control: TrackControl, bind: BindOld) {
//         let parameterBindEl = document.createElement("bind-parameter-element") as BindParameterElement;
//         bind.bindParameters.push(parameterBindEl);
//         if (control.advancedElement.parametersContainer) {
//             control.advancedElement.parametersContainer.appendChild(parameterBindEl);
//         }
//
//         parameterBindEl.options.onchange = (e) => {
//             // @ts-ignore
//             parameterBindEl.selected = e.target!.value;
//             let track = this.app.tracks.getTrack(control.trackId)!;
//             if (track.plugin.initialized) {
//                 // @ts-ignore
//                 track.plugin.instance?._audioNode.getParameterInfo([parameterBindEl.selected]).then((response) => {
//                     if (response) {
//                         // @ts-ignore
//                         let {minValue, maxValue} = response[parameterBindEl.selected];
//
//                         let MinMax = getMinMax(parameterBindEl.selected);
//                         if (MinMax) {
//                             minValue = MinMax.min;
//                             maxValue = MinMax.max;
//                         }
//
//                         parameterBindEl.selectParam(minValue, maxValue);
//                     }
//                 });
//             }
//         }
//
//         parameterBindEl.minInput.onchange = () => {
//             if (parameterBindEl.selected == "none") return;
//             let min = parseFloat(parameterBindEl.minInput.value);
//             if (min < parameterBindEl.originalMin) {
//                 parameterBindEl.setMin(parameterBindEl.originalMin);
//             } else if (min > parameterBindEl.max!) {
//                 parameterBindEl.setMin(parameterBindEl.max!);
//             } else if (min > parameterBindEl.originalMax) {
//                 parameterBindEl.setMin(parameterBindEl.originalMax);
//             } else {
//                 parameterBindEl.setMin(min);
//             }
//         }
//
//         parameterBindEl.maxInput.onchange = () => {
//             if (parameterBindEl.selected == "none") return;
//             let max = parseFloat(parameterBindEl.maxInput.value);
//             if (max > parameterBindEl.originalMax) {
//                 parameterBindEl.setMax(parameterBindEl.originalMax);
//             } else if (max < parameterBindEl.min!) {
//                 parameterBindEl.setMax(parameterBindEl.min!);
//             } else if (max < parameterBindEl.originalMin) {
//                 parameterBindEl.setMax(parameterBindEl.originalMin);
//             } else {
//                 parameterBindEl.setMax(max);
//             }
//         }
//
//         parameterBindEl.deleteBtn.onclick = () => {
//             bind.bindParameters.splice(bind.bindParameters.indexOf(parameterBindEl), 1);
//             parameterBindEl.remove();
//         }
//
//         let track = this.app.tracks.getTrack(control.trackId)!;
//         if (track.plugin.initialized) {
//             await this.refreshPluginsParameters(track, control)
//         }
//
//         return parameterBindEl;
//     }
//
//     async addParameterAsync(control: TrackControl, bind: BindOld) {
//         let parameterBindEl = await this.addParameter(control, bind);
//
//         let parameterPromise = new Promise<void>(async (resolve) => {
//             const checkParameterBindInitiated = setInterval(async () => {
//                 if (parameterBindEl.options) {
//                     clearInterval(checkParameterBindInitiated);
//                     console.log("refreshing")
//                     await this.refreshPluginsParameters(this.app.tracks.getTrack(control.trackId)!, control);
//                     resolve();
//                 }
//             }, 100);
//         });
//         await parameterPromise;
//
//         return parameterBindEl;
//     }
//
//     removeBind(control: TrackControl) {
//         let bind = control.advancedElement.activeBind;
//         if (bind == undefined) {
//             alert("No bind selected");
//             return;
//         }
//         else {
//             let presetsTracks = this.app.tracks.trackList.filter(t => t.tag == control.advancedElement.tag);
//             let controls = presetsTracks.map(t => this.getControl(t.id)!);
//
//
//             control.binds.splice(control.binds.indexOf(bind), 1);
//             bind.bindButton.remove();
//             bind.trackBindElement.remove();
//             bind.bindParameters.forEach(param => param.remove());
//             bind = undefined;
//         }
//     }
//
//     async updatePluginParameter(value: string, control: TrackControl, bind: BindOld) {
//         for (const bindParam of bind.bindParameters) {
//            if (bindParam.selected != "none") {
//                let track = this.app.tracks.getTrack(control.trackId)!;
//                if (track.plugin.initialized) {
//                    let param = bindParam.selected
//                    // @ts-ignore
//                    let response = await track.plugin.instance?._audioNode.getParameterInfo([param]);
//                    if (response) {
//
//                        // @ts-ignore
//                        let {minValue, maxValue, type} = response[param];
//
//                        let MinMax = getMinMax(param);
//                        if (MinMax) {
//                             minValue = MinMax.min;
//                             maxValue = MinMax.max;
//                        }
//
//                        let normalizedValue = this.normalizeValue(value, bindParam.min, bindParam.max, minValue, maxValue, type);
//                        let events = [];
//                        events.push({ type: 'wam-automation', data: { id: param, value: normalizedValue }, time: this.app.host.audioCtx.currentTime })
//                        // @ts-ignore
//                        track.plugin.instance?._audioNode.scheduleEvents(...events);
//                    }
//                }
//            }
//         }
//     }
//
//     normalizeValue(value: string, min: number | undefined, max: number | undefined, minValue: number, maxValue: number, type: string) {
//         let nodeRange = maxValue - minValue;
//         let normalizedValue = minValue + (nodeRange * parseFloat(value) / 100);
//
//         if (type == "float") {
//             normalizedValue = parseFloat(normalizedValue.toFixed(2));
//         }
//         else if (type == "integer") {
//             normalizedValue = Math.round(normalizedValue);
//         }
//
//         let istart = minValue ;
//         let istop = maxValue
//         let ostart = (min !== undefined) ? min : minValue;
//         let ostop = (max) !== undefined ? max : maxValue;
//
//         return ostart + (ostop - ostart) * ((normalizedValue - istart) / (istop - istart));
//     }
//
// }