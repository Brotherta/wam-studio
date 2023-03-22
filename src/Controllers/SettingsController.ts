import App from "../App";
import SettingsView from "../Views/SettingsView";
import HostView from "../Views/HostView";


export default class SettingsController {

    app: App;
    settingsView: SettingsView;
    hostView: HostView;
    ac: AudioContext;
    calibrateInitialized: boolean;
    calibrating: boolean;

    mic: MediaStreamAudioSourceNode | undefined;
    workletNode: AudioWorkletNode;
    constraints: MediaStreamConstraints;
    stream: MediaStream;

    constructor(app: App) {
        this.app = app;
        this.settingsView = app.settingsView;
        this.hostView = app.hostView;
        this.calibrateInitialized = false;
        this.calibrating = false;
        this.ac = new AudioContext();
        this.constraints = { audio : {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        };
        this.ac.audioWorklet.addModule(new URL('../Audio/LatencyProcessor.js', import.meta.url))
            .then(async () => {
                this.workletNode = new AudioWorkletNode(this.ac, 'measure-processor', {outputChannelCount: [1]});
                this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            });
        this.defineListeners();
    }

    defineListeners() {
        this.settingsView.latencyInput.addEventListener("input", () => {
            this.app.host.latency = Number(this.settingsView.latencyInput.value);
            this.settingsView.calibrationLabel.innerText = "Latency: " + this.app.host.latency + "ms";
        });
        this.settingsView.closeWindowButton.addEventListener("click", () => {
           this.settingsView.closeWindow();
        });
        this.hostView.settingsBtn.addEventListener("click", () => {
            this.settingsView.openWindow();
        });
        this.settingsView.calibrationButton.addEventListener("click", () => {
            if (this.calibrating) {
                this.stopCalibrate();
            }
            else {
                this.startCalibrate();
            }
        });
    }

    async startCalibrate() {
        await this.ac.resume();
        this.calibrating = true;


        this.mic = this.ac.createMediaStreamSource(this.stream);

        this.workletNode.channelCount = 1;
        this.mic.connect(this.workletNode).connect(this.ac.destination);

        this.workletNode.port.postMessage({threshold: 0.20 });

        this.workletNode.port.onmessage = (e) => {
            this.settingsView.latencyInput.value = (e.data.latency * 1000).toFixed(2).toString();
            this.settingsView.calibrationLabel.innerText = "Latency: " + this.settingsView.latencyInput.value + "ms";
            // @ts-ignore
            this.app.host.latency = Number(this.settingsView.latencyInput.value)- this.ac.outputLatency * 1000;
        }
        this.settingsView.calibrationButton.innerText = "Stop Calibration";
    }

    stopCalibrate() {
        this.ac.suspend();
        this.calibrating = false;
        this.settingsView.calibrationButton.innerText = "Calibrate Latency";
    }
}