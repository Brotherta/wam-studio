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
import {getMinMax, normalizeValue} from "../Utils/Normalizer";


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

        this.defineBindListener(bindControl, track);
    }

    removeBindControl(track: Track) {
        let bindControl = track.bindControl;
        this.view.removeTrackBindElement(track.id);
        bindControl.advElement.remove();
    }

    private defineBindListener(bindControl: BindControl, track: Track) {

        // Presets Controllers
        bindControl.advElement.bindsSelect.onchange = async () => {
            await this.app.presetsController.changePreset(bindControl, track);
        }
        bindControl.advElement.savePresetBtn.onclick = async () => {
            await this.app.presetsController.savePreset(bindControl, track);
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
        }
        bindControl.advElement.removeBindBtn.onclick = async () => {
            await this.deleteBind(track);
        }
        bindControl.advElement.refreshParamBtn.onclick = async () => {
            await this.refreshParam(track);
        }
        bindControl.advElement.bindsSelect.onchange = async () => {
            await this.selectBind(track);
        }
        bindControl.advElement.addParamBtn.onclick = async () => {
            await this.createParameter(track);
        }
    }

    // BINDS CONTROLLERS

    /**
     * Create a new bind for the track. It creates the bindControl object that will be used to store the bind.
     * It also creates the bindSliderElement that will be used to display the bind.
     * @param track
     */
    async createBind(track: Track) {
        let bindControl = track.bindControl;
        let name = window.prompt("Enter the name of the bind (16 char max a-Z) no special characters", "Bind");

        if (!this.verifyString(name)) return null;
        if (bindControl.binds.find(b => b.name === name)) {
            alert("The bind "+ name + " already exists");
            return null;
        }

        let bind = new Bind(name!);
        bindControl.binds.push(bind);

        let slider = document.createElement("bind-slider-element") as BindSliderElement;
        bindControl.trackBindElement.addBindSliderElement(slider);
        slider.id = "slider-"+name;
        slider.setNameLabel(name!);
        slider.slider.oninput = async () => {
            console.log("slider input " + slider.slider.value);
            await this.updateBindValue(track, bind, slider.slider.value);
        }

        bindControl.advElement.addBindOption(name!);

        return bind;
    }

    /**
     * Delete a bind from the track. It will delete the parameters associated with the bind and the elements.
     *
     * @param track
     * @private
     */
    private async deleteBind(track: Track) {
        let activeBindName = track.bindControl.advElement.bindsSelect.value;
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
        }
    }

    /**
     * Selects the bind to display the parameters associated with it. It will hide all the parameters and display the ones associated with the bind.
     *
     * @param track
     * @private
     */
    private async selectBind(track: Track) {
        track.bindControl.advElement.hideAllParameters();
        let activeBindName = track.bindControl.advElement.bindsSelect.value;
        if (activeBindName !== "none") {
            for (let parameterElement of track.bindControl.advElement.parameters) {
                if (parameterElement.id.includes(activeBindName)) {
                    parameterElement.style.display = "";
                }
            }
        }
    }

    private async updateBindValue(track: Track, bind: Bind, value: string) {
        if (!track.plugin.initialized) return;

        for (let parameter of bind.parameters) {
            if (parameter.parameterName !== "none") {
                // @ts-ignore
                let parameterInfo = await track.plugin.instance!._audioNode.getParameterInfo([parameter.parameterName]);

                // @ts-ignore
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

    // PARAMETERS CONTROLLERS

    /**
     * Create a new parameter for the bind. It creates the parameter element that will be used to display the parameter.
     * @param track
     */
    async createParameter(track: Track) {
        let bindControl = track.bindControl;
        let bindName = bindControl.advElement.bindsSelect.value;
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
        }
        parameterElement.options.onchange = async () => {
            await this.updateParameter(track, bind!, parameterElement);
        }
        parameterElement.minInput.onchange = async () => {
            this.verifyNumber(parameterElement, true);
        }
        parameterElement.maxInput.onchange = async () => {
            this.verifyNumber(parameterElement);
        }
    }

    /**
     * Update the parameter element with the new selected parameter.
     * It creates if needed the Parameter, and set the min and the max values.
     *
     * @param track
     * @param bind
     * @param parameterElement
     * @private
     */
    private async updateParameter(track: Track, bind: Bind, parameterElement: ParameterElement) {
        let parameter = parameterElement.parameter;
        let paramName = parameterElement.options.value;
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
            bind.parameters.push(parameter);
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
        if (parameterElement.parameter !== null) {
            bind.parameters.slice(bind.parameters.indexOf(parameterElement.parameter), 1);
        }
        track.bindControl.advElement.removeParameterElement(parameterElement);
    }

    /**
     * Refresh the parameters of the track's plugin.
     * It will update the parameters of the track's bindControl accordingly.
     * It takes the parameters of the plugin and update the parameters of the bindControl.
     *
     * @param track
     * @private
     */
    private async refreshParam(track: Track) {

        // TODO : Check if the selected parameter is still available in the plugin !!!

        let plugin = track.plugin;
        if (plugin.initialized) {
            let parameters = await plugin.instance!._audioNode.getParameterInfo();
            for (let parameterEl of track.bindControl.advElement.parameters) {
                parameterEl.refreshParam(parameters);
            }
        }
    }


    private verifyString(toVerify: string | null) {
        if (toVerify == null || toVerify == '') {
            alert("Not empty please !");
            return false;
        }
        if (!/^[a-zA-Z]+$/.test(toVerify)) {
            alert("Only letters please (a-Z)");
            return false;
        }
        if (toVerify.length > 16) {
            alert("No more than 16 chars please...");
            return false;
        }
        return true;
    }

    private verifyNumber(parameterEl: ParameterElement, isMin: boolean = false) {
        let parameter = parameterEl.parameter;
        if (parameter === null) {
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