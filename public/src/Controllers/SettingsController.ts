import App from "../App";
import SettingsView from "../Views/SettingsView";
import { audioCtx } from "../index";

/**
 * The class that control the events related to the global settings of the host.
 */
export default class SettingsController {

    /**
     * Route Application.
     */
    private _app: App;
    /**
     * Settings view.
     */
    private _view: SettingsView;
    /**  
     * The list of input devices. 
     */
    private _inputDevices: MediaDeviceInfo[];
    /**
     * The list of output devices.
     */
    private _outputDevices: MediaDeviceInfo[];
    /**
     * The selected input device.
     */
    private _selectedInputDevice: MediaDeviceInfo;
    /**
     * The selected output device.
     */
    private _selectedOutputDevice: MediaDeviceInfo;

    /**
     * The constraints for the media stream. 
     */
    public constraints: MediaStreamConstraints | undefined;

    constructor(app: App) {
        this._app = app;
        this._view = app.settingsView;
        
        this.bindEvents();
    }

    /**
     * Updates the list of input and output devices.
     * It also updates the selected input and output devices.
     */
    public async updateMediaDevices(): Promise<void> {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();

        this._outputDevices = devices.filter(device => device.kind === "audiooutput");
        this._inputDevices = devices.filter(device => device.kind === "audioinput");

        this._selectedOutputDevice = this._outputDevices.find(device => device.deviceId === "default")!;
        this._selectedInputDevice = this._inputDevices.find(device => device.deviceId === "default")!;

        if (this._selectedOutputDevice === undefined || this._selectedInputDevice === undefined) {
            this._selectedOutputDevice = this._outputDevices[0];
            this._selectedInputDevice = this._inputDevices[0];
        }

        this._view.updateOutputDevices(this._outputDevices);
        this._view.updateInputDevices(this._inputDevices);

        this.constraints = {
            audio: {
                deviceId: this._selectedInputDevice.deviceId ? {exact: this._selectedInputDevice.deviceId} : undefined,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        }
    }

    /**
     * Opens the settings window. It also updates the list of input and output devices. 
     */
    public async openSettings(): Promise<void> {
        await this.updateMediaDevices();
        this._view.settingsWindow.hidden = false;
    }

    /**
     * Binds all the events for the settings menu.
     * @private
     */ 
    private bindEvents(): void {
        this._view.closeBtn.addEventListener("click", () => {
            this._view.settingsWindow.hidden = true;
        });

        // Update the list of input and output devices when a device is added or removed.
        navigator.mediaDevices.addEventListener("devicechange", async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            let audioInputDevices = devices.filter(device => device.kind === "audioinput");
            let audioOutputDevices = devices.filter(device => device.kind === "audiooutput");
            this._view.updateInputDevices(audioInputDevices);
            this._view.updateOutputDevices(audioOutputDevices);
            if (audioInputDevices.find(device => device.deviceId === this._selectedInputDevice.deviceId) === undefined) {
                this._selectedInputDevice = audioInputDevices[0];
                this.changeInputDevice(this._selectedInputDevice.deviceId);
            }
            if (audioOutputDevices.find(device => device.deviceId === this._selectedOutputDevice.deviceId) === undefined
            && audioOutputDevices[0] !== undefined) {
                this._selectedOutputDevice = audioOutputDevices[0];
                this.changeOutputDevice(this._selectedOutputDevice.deviceId);
            }
        });

        // Update the selected input devices when the user changes the device.
        this._view.selectInputDevice.addEventListener("change", () => {
            this._selectedInputDevice = this._inputDevices.find(device => device.deviceId === this._view.selectInputDevice.value)!;
            this.changeInputDevice(this._selectedInputDevice.deviceId);
        });

        // Update the selected output devices when the user changes the device.
        this._view.selectOutputDevice.addEventListener("change", () => {
            this._selectedOutputDevice = this._outputDevices.find(device => device.deviceId === this._view.selectOutputDevice.value)!;
            if (this._selectedOutputDevice !== undefined) {
                this.changeOutputDevice(this._selectedOutputDevice.deviceId);
            }
        });
    }

    /**
     * Changes the input device of all the tracks. 
     * @param deviceId - The id of the new input device.
     * @private
     */
    private async changeInputDevice(deviceId: string): Promise<void> {
        this.constraints = {
            audio: {
                deviceId: deviceId ? {exact: deviceId} : undefined,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        }

        for (let track of this._app.tracksController.tracks) {
            const {sampleRecorder} = track
            if (sampleRecorder.micRecNode) {
                let stream = await navigator.mediaDevices.getUserMedia(this.constraints);
                sampleRecorder.micRecNode.disconnect();
                sampleRecorder.micRecNode = audioCtx.createMediaStreamSource(stream);
                sampleRecorder.micRecNode.connect(sampleRecorder.recordingInputNode);
            }
        }
    }

    /**
     * Changes the output device of the host.
     * @param deviceId - The id of the new output device.
     * @private
     */
    private async changeOutputDevice(deviceId: string): Promise<void> {
        // @ts-ignore
        await audioCtx.setSinkId(deviceId);
    }
}