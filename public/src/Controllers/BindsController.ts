import App from "../App";
import Track from "../Models/Track";
import BindControl from "../Models/BindControl";
import AdvancedElement from "../Components/Binds/AdvancedElement";
import TrackBindElement from "../Components/Binds/TrackBindElement";
import BindsView from "../Views/BindsView";
import Parameter from "../Models/Parameter";
import Bind from "../Models/Bind";
import BindSliderElement from "../Components/Binds/BindSliderElement";
import ParameterElement from "../Components/Binds/ParameterElement";
import {getMinMax, normalizeValue, verifyString} from "../Utils/Normalizer";


export default class BindsController {

    app: App;
    view: BindsView;
    uniqueIdCounter: number = 0;

    constructor(app: App) {
        this.app = app;
        this.view = this.app.bindsView;
    }

    addBindListener(track: Track) {
        let advElement = document.createElement("advanced-element") as AdvancedElement;
        let trackBindElement = document.createElement("track-bind-element") as TrackBindElement;

        trackBindElement.trackId = track.id;
        trackBindElement.id = "track-bind-" + track.id;

        let bindControl = new BindControl(track.id, advElement, trackBindElement, track.tag);
        track.bindControl = bindControl;

        this.view.loadingZone.appendChild(advElement);
        this.view.addTrackBindElement(trackBindElement);

        this.addVolumeSlider(track);

        this.defineBindListener(bindControl, track);
        this.app.presetsController.refreshPresetList(track.tag);
    }

    removeBindControl(track: Track) {
        let bindControl = track.bindControl;
        this.view.removeTrackBindElement(track.id);
        bindControl.advElement.remove();
    }

    addVolumeSlider(track: Track) {
        let slider = document.createElement("bind-slider-element") as BindSliderElement;
        track.volumeSlider = slider;
        track.bindControl.trackBindElement.addBindSliderElement(slider);
        slider.id = "volume";
        slider.setNameLabel("Volume");
        slider.slider.value = "50";
        slider.valueLabel.innerHTML = "50";
        // set color to white
        slider.style.backgroundColor = "#646464";
        slider.slider.oninput = async () => {
            let value = parseInt(slider.slider.value) / 100;
            track.setVolume(value);
        }
    }

    private defineBindListener(bindControl: BindControl, track: Track) {

        // Presets Controllers
        bindControl.advElement.presetsSelect.onchange = async () => {
            bindControl.trackBindElement.selectPresets(bindControl.advElement.presetsSelect.value);
            await this.app.presetsController.changePreset(bindControl, track);
            this.app.projectController.saved = false;
        }
        bindControl.advElement.savePresetBtn.onclick = async () => {
            await this.app.presetsController.savePreset(bindControl, track);
            this.app.projectController.saved = false;
        }
        bindControl.advElement.deletePresetBtn.onclick = async () => {
            await this.app.presetsController.deletePreset(bindControl, track);
        }

        // Binds Controllers
        bindControl.advElement.newBindBtn.onclick = async () => {
            let bind = await this.createBind(track);
            if (!bind) return;
            track.bindControl.advElement.bindsSelect.value = bind!.name;
            await this.selectBind(track);
            this.app.projectController.saved = false;
        }
        bindControl.advElement.removeBindBtn.onclick = async () => {
            await this.deleteBind(track);
            this.app.projectController.saved = false;
        }
        bindControl.advElement.refreshParamBtn.onclick = async () => {
            await this.refreshParam(track);
            this.app.projectController.saved = false;
        }
        bindControl.advElement.bindsSelect.onchange = async () => {
            await this.selectBind(track);
            this.app.projectController.saved = false;
        }
        bindControl.advElement.addParamBtn.onclick = async () => {
            await this.createParameter(track);
            this.app.projectController.saved = false;
        }
        bindControl.trackBindElement.presetsSelect.onchange = async () => {
            bindControl.advElement.selectPreset(bindControl.trackBindElement.presetsSelect.value);
            await this.app.presetsController.changePreset(bindControl, track);
            this.app.projectController.saved = false;
        }
    }

    // BINDS CONTROLLERS

    /**
     * Create a new bind for the track. It creates the bindControl object that will be used to store the bind.
     * It also creates the bindSliderElement that will be used to display the bind.
     * @param track
     * @param name
     * @param value
     */
    async createBind(track: Track, name?: string, value?: string) {
        let bindControl = track.bindControl;
        if (!name) {
            let pname = window.prompt("Enter the name of the bind (16 char max a-Z) no special characters", "Bind");

            if (!verifyString(pname)) return null;
            if (bindControl.binds.find(b => b.name === pname)) {
                alert("The bind "+ pname + " already exists");
                return null;
            }
            name = pname!;
        }

        let bind = new Bind(name!);
        bind.currentValue = value ? value : "50";
        bindControl.binds.push(bind);

        let slider = document.createElement("bind-slider-element") as BindSliderElement;
        bindControl.trackBindElement.addBindSliderElement(slider);
        slider.id = "slider-"+name;
        slider.setNameLabel(name!);
        slider.slider.value = bind.currentValue;
        slider.valueLabel.innerHTML = bind.currentValue;
        slider.slider.oninput = async () => {
            await this.updateBindValue(track, bind, slider.slider.value);
            this.app.projectController.saved = false;
        }

        bindControl.advElement.addBindOption(name!);

        return bind;
    }

    /**
     * Delete a bind from the track. It will delete the parameters associated with the bind and the elements.
     *
     * @param track
     * @param bind
     * @private
     */
    async deleteBind(track: Track, bind?: Bind) {
        let activeBindName = bind ? bind.name : track.bindControl.advElement.bindsSelect.value;
        if (activeBindName !== "none") {
            let bind = track.bindControl.binds.find(b => b.name === activeBindName)!;

            let parameterElements = track.bindControl.advElement.parameters;
            let parametersToDelete: ParameterElement[] = [];
            for (let parameterElement of parameterElements) {
                if (parameterElement.id.includes(bind.name)) {
                    parametersToDelete.push(parameterElement);
                }
            }

            for (let parameterElement of parametersToDelete) {
                await this.deleteParameter(track, bind, parameterElement);
            }

            track.bindControl.removeBind(bind);
            track.bindControl.advElement.removeBindOption(bind.name);
            track.bindControl.trackBindElement.removeBindSliderElement(bind.name);
        }
    }

    /**
     * Selects the bind to display the parameters associated with it. It will hide all the parameters and display the ones associated with the bind.
     *
     * @param track
     * @private
     */
    async selectBind(track: Track) {
        track.bindControl.advElement.hideAllParameters();
        let activeBindName = track.bindControl.advElement.bindsSelect.value;
        if (activeBindName !== "none") {
            for (let parameterElement of track.bindControl.advElement.parameters) {
                let idFiltered = parameterElement.id.split("-");
                let name = idFiltered[1];
                if (name === activeBindName) {
                    parameterElement.style.display = "";
                }
            }
        }
    }

    async updateBindValue(track: Track, bind: Bind, value: string) {
        if (!track.plugin.initialized) return;
        bind.currentValue = value;

        for (let parameter of bind.parameters) {
            if (parameter.parameterName !== "none") {
                // @ts-ignore
                let parameterInfo = await track.plugin.instance!._audioNode.getParameterInfo([parameter.parameterName]);

                let {minValue, maxValue, type} = parameterInfo[parameter.parameterName];
                let minMaxNormalized = getMinMax(parameter.parameterName);
                if (minMaxNormalized) {
                    minValue = minMaxNormalized.min;
                    maxValue = minMaxNormalized.max;
                }

                let normalizedValue = normalizeValue(value, parameter.currentMin, parameter.currentMax, minValue, maxValue, type);
                let events = [];
                events.push({ type: 'wam-automation', data: { id: parameter.parameterName, value: normalizedValue }, time: this.app.host.audioCtx.currentTime })
                // @ts-ignore
                track.plugin.instance?._audioNode.scheduleEvents(...events);
            }
        }
    }

    async deleteAllBinds(track: Track) {
        let bindControl = track.bindControl;
        let bindsToDelete: Bind[] = [];
        for (let bind of bindControl.binds) {
            bindsToDelete.push(bind);
        }
        for (let bind of bindsToDelete) {
            await this.deleteBind(track, bind);
        }
    }

    // PARAMETERS CONTROLLERS

    /**
     * Create a new parameter for the bind. It creates the parameter element that will be used to display the parameter.
     * @param track
     * @param name
     */
    async createParameter(track: Track, name?: string) {
        let bindControl = track.bindControl;
        let bindName = name ? name : bindControl.advElement.bindsSelect.value;
        let bind = bindControl.binds.find(b => b.name === bindName);

        if (bindName == null || bindName == "none") {
            alert("Please select a bind first");
            return;
        }

        let parameterElement = document.createElement("parameter-element") as ParameterElement;
        parameterElement.id = "parameter-"+bind!.name+"-"+this.uniqueIdCounter;
        this.uniqueIdCounter++;
        track.bindControl.advElement.addParameterElement(parameterElement);

        await this.refreshParam(track);

        parameterElement.deleteBtn.onclick = async () => {
            await this.deleteParameter(track, bind!, parameterElement);
            this.app.projectController.saved = false;
        }
        parameterElement.options.onchange = async () => {
            await this.updateParameter(track, bind!, parameterElement);
            this.app.projectController.saved = false;
        }
        parameterElement.minInput.onchange = async () => {
            this.verifyNumber(parameterElement, true);
            this.app.projectController.saved = false;
        }
        parameterElement.maxInput.onchange = async () => {
            this.verifyNumber(parameterElement);
            this.app.projectController.saved = false;
        }

        return parameterElement;
    }

    /**
     * Update the parameter element with the new selected parameter.
     * It creates if needed the Parameter, and set the min and the max values.
     *
     * @param track
     * @param bind
     * @param parameterElement
     * @param param
     * @private
     */
    async updateParameter(track: Track, bind: Bind, parameterElement: ParameterElement, param?: Parameter) {
        if (param) {
            let newParameter = param.clone();
            parameterElement.selectParam(newParameter);
            bind.parameters.push(newParameter);
        }
        else {
            let parameter = parameterElement.parameter;
            let paramName =  parameterElement.options.value;
            if (parameter === undefined || parameter.parameterName !== parameterElement.options.value) {
                // @ts-ignore
                let paramInfo = await track.plugin.instance?._audioNode.getParameterInfo([paramName]);
                if (paramInfo === undefined) {
                    alert("The parameter "+paramName+" doesn't exist");
                    return;
                }
                // @ts-ignore
                let {minValue, maxValue, discreteStep} = paramInfo[paramName];

                // Normalize values for the equalizer...
                let minMaxNormalized = getMinMax(paramName);
                if (minMaxNormalized !== undefined) {
                    minValue = minMaxNormalized.min;
                    maxValue = minMaxNormalized.max;
                }

                parameter = new Parameter(paramName, maxValue, minValue, discreteStep);
                parameterElement.selectParam(parameter);
                bind.parameters.splice(bind.parameters.indexOf(parameterElement.parameter!), 1);
                bind.parameters.push(parameter);
            }
        }
    }

    /**
     * Delete the parameter from the bind. It removes the parameter from the bindControl if it was already added.
     * It also deletes the parameter element from the trackBindElement.
     *
     * @param track
     * @param bind
     * @param parameterElement
     * @private
     */
    private async deleteParameter(track: Track, bind: Bind, parameterElement: ParameterElement) {
        console.log("before delete", bind.parameters);
        if (parameterElement.parameter !== undefined) {
            bind.parameters.splice(bind.parameters.indexOf(parameterElement.parameter!), 1);
        }
        parameterElement.parameter = undefined;
        track.bindControl.advElement.removeParameterElement(parameterElement);
        console.log("after delete", bind.parameters)
    }

    /**
     * Refresh the parameters of the track's plugin.
     * It will update the parameters of the track's bindControl accordingly.
     * It takes the parameters of the plugin and update the parameters of the bindControl.
     *
     * @param track
     * @private
     */
    async refreshParam(track: Track) {

        // TODO : Check if the selected parameter is still available in the plugin !!!

        let plugin = track.plugin;
        if (plugin.initialized) {
            let parameters = await plugin.instance!._audioNode.getParameterInfo();
            for (let parameterEl of track.bindControl.advElement.parameters) {
                parameterEl.refreshParam(parameters);
            }
        }
    }

    private verifyNumber(parameterEl: ParameterElement, isMin: boolean = false) {
        let parameter = parameterEl.parameter;
        if (parameter === undefined) {
            return;
        }
        let input = isMin ? parameterEl.minInput : parameterEl.maxInput;
        let number = parseFloat(input.value);

        if (isMin) {
            if (Number.isNaN(number)) {
                parameter.currentMin = parameter.min
            }
            else if (number < parameter.min) {
                parameter.currentMin = parameter.min
            }
            else if (number > parameter.currentMax) {
                parameter.currentMin = parameter.currentMax;
            }
            else if (number > parameter.max) {
                parameter.currentMin = parameter.max;
            }
            else {
                parameter.currentMin = number;
            }
            input.value = parameter.currentMin.toString();
        }
        else {
            if (Number.isNaN(number)) {
                parameter.currentMax = parameter.max
            }
            if (number > parameter.max) {
                parameter.currentMax = parameter.max
            }
            else if (number < parameter.currentMin) {
                parameter.currentMax = parameter.currentMin;
            }
            else if (number < parameter.min) {
                parameter.currentMax = parameter.min;
            }
            else {
                parameter.currentMax = number;
            }
            input.value = parameter.currentMax.toString();
        }
    }

}