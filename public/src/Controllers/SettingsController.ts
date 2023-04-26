import App from "../App";
import SettingsView from "../Views/SettingsView";
import {audioCtx} from "../index";


export default class SettingsController {

    app: App;
    settingsView: SettingsView;

    inputDevices: MediaDeviceInfo[];
    outputDevices: MediaDeviceInfo[];
    selectedInputDevice: MediaDeviceInfo;
    selectedOutputDevice: MediaDeviceInfo;

    constraints: MediaStreamConstraints;

    constructor(app: App) {
        this.app = app;
        this.settingsView = app.settingsView;
        navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                this.outputDevices = devices.filter(device => device.kind === "audiooutput");
                this.inputDevices = devices.filter(device => device.kind === "audioinput");

                this.selectedOutputDevice = this.outputDevices.find(device => device.deviceId === "default")!;
                this.selectedInputDevice = this.inputDevices.find(device => device.deviceId === "default")!;

                if (this.selectedOutputDevice === undefined || this.selectedInputDevice === undefined) {
                    this.selectedOutputDevice = this.outputDevices[0];
                    this.selectedInputDevice = this.inputDevices[0];
                }

                this.settingsView.updateOutputDevices(this.outputDevices);
                this.settingsView.updateInputDevices(this.inputDevices);

                this.constraints = {
                    audio: {
                        deviceId: this.selectedInputDevice.deviceId ? {exact: this.selectedInputDevice.deviceId} : undefined,
                        echoCancellation: false,
                        noiseSuppression: false,
                        autoGainControl: false
                    }
                }
            });
        });

        this.defineListeners();
    }

    defineListeners() {
        this.app.hostView.settingsBtn.addEventListener("click", () => {
            this.settingsView.settingsWindow.hidden = false;
        });
        this.settingsView.closeBtn.addEventListener("click", () => {
            this.settingsView.settingsWindow.hidden = true;
        });

        navigator.mediaDevices.addEventListener("devicechange", async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            let audioInputDevices = devices.filter(device => device.kind === "audioinput");
            let audioOutputDevices = devices.filter(device => device.kind === "audiooutput");
            this.settingsView.updateInputDevices(audioInputDevices);
            this.settingsView.updateOutputDevices(audioOutputDevices);
            if (audioInputDevices.find(device => device.deviceId === this.selectedInputDevice.deviceId) === undefined) {
                this.selectedInputDevice = audioInputDevices[0];
                this.changeInputDevice(this.selectedInputDevice.deviceId);
            }
            if (audioOutputDevices.find(device => device.deviceId === this.selectedOutputDevice.deviceId) === undefined
            && audioOutputDevices[0] !== undefined) {
                this.selectedOutputDevice = audioOutputDevices[0];
                this.changeOutputDevice(this.selectedOutputDevice.deviceId);
            }
        });

        this.settingsView.selectInputDevice.addEventListener("change", () => {
            this.selectedInputDevice = this.inputDevices.find(device => device.deviceId === this.settingsView.selectInputDevice.value)!;
            this.changeInputDevice(this.selectedInputDevice.deviceId);
        });

        this.settingsView.selectOutputDevice.addEventListener("change", () => {
            this.selectedOutputDevice = this.outputDevices.find(device => device.deviceId === this.settingsView.selectOutputDevice.value)!;
            if (this.selectedOutputDevice !== undefined) {
                this.changeOutputDevice(this.selectedOutputDevice.deviceId);
            }
        });
    }

    async changeInputDevice(deviceId: string) {
        this.constraints = {
            audio: {
                deviceId: deviceId ? {exact: deviceId} : undefined,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        }
        for (let track of this.app.tracksController.trackList) {
            if (track.micRecNode) {
                let stream = await navigator.mediaDevices.getUserMedia(this.constraints);
                track.micRecNode.disconnect();
                track.micRecNode = audioCtx.createMediaStreamSource(stream);
                track.micRecNode.connect(track.monitorSlitterNode);
            }
        }
    }

    async changeOutputDevice(deviceId: string) {
        // @ts-ignore
        await audioCtx.setSinkId(deviceId);
    }
}