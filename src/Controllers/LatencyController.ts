import App from "../App";
import LatencyView from "../Views/LatencyView";
import HostView from "../Views/HostView";
import {audioCtx} from "../index";


export default class LatencyController {

    app: App;
    latencyView: LatencyView;
    hostView: HostView;
    ac: AudioContext;
    calibrateInitialized: boolean;
    calibrating: boolean;

    mic: MediaStreamAudioSourceNode | undefined;
    workletNode: AudioWorkletNode;
    stream: MediaStream;

    roundtripLatency = 0;
    inputLatency = 0;
    outputLatency = 0;

    constructor(app: App) {
        this.app = app;
        this.latencyView = app.latencyView;
        this.hostView = app.hostView;
        this.calibrateInitialized = false;
        this.calibrating = false;

        this.getLocalStorages();

        this.defineListeners();
    }

    getLocalStorages() {
        if (localStorage.getItem("latency-compensation") !== null) {
            this.inputLatency = parseFloat(localStorage.getItem("latency-compensation")!);
            this.latencyView.latencyInput.value = this.inputLatency.toString();
            this.app.host.latency = this.inputLatency;
            this.latencyView.inputLatencyLabel.innerText = "Compensation : -" + this.inputLatency.toFixed(2) + "ms";
        }
    }

    async setupWorklet() {
        this.ac = new AudioContext({latencyHint: 0.00001});
        await this.ac.suspend();
        await this.ac.audioWorklet.addModule(new URL('../Audio/LatencyProcessor.js', import.meta.url))

        this.stream = await navigator.mediaDevices.getUserMedia(this.app.settingsController.constraints);
        this.mic = this.ac.createMediaStreamSource(this.stream);

        if (this.workletNode !== undefined) {
            this.workletNode.disconnect();
            this.mic?.disconnect();
        }
        this.workletNode = new AudioWorkletNode(this.ac, 'measure-processor', {outputChannelCount: [1]});
        this.workletNode.channelCount = 1;
        this.workletNode.port.postMessage({threshold: 0.20 });

        this.workletNode.port.onmessage = (e) => {
            this.roundtripLatency = e.data.latency * 1000;
            // @ts-ignore
            this.outputLatency = this.ac.outputLatency * 1000;
            this.inputLatency = this.roundtripLatency - this.outputLatency;
            this.latencyView.latencyInput.value = this.inputLatency.toFixed(2).toString();

            this.latencyView.roundtripLatencyLabel.innerText = "Measured Roundtrip: " + this.roundtripLatency.toFixed(2) + "ms";
            this.latencyView.outputLatencyLabel.innerText = "Output Latency: " + this.outputLatency.toFixed(2) + "ms";
            this.latencyView.inputLatencyLabel.innerText = "Compensation : -" + this.inputLatency.toFixed(2) + "ms";
            // @ts-ignore
            // this.app.host.latency = Number(this.settingsView.latencyInput.value)- this.ac.outputLatency * 1000;
            this.app.host.latency = this.inputLatency;
        }

        // @ts-ignore
        this.mic.connect(this.workletNode).connect(this.ac.destination);

    }

    defineListeners() {
        this.latencyView.latencyInput.addEventListener("input", () => {
            //@ts-ignore
            let outputLatency = audioCtx.outputLatency * 1000;
            //@ts-ignore
            this.inputLatency = Number(this.latencyView.latencyInput.value);
            this.app.host.latency = this.inputLatency;
            //@ts-ignore
            this.latencyView.inputLatencyLabel.innerText = "Compensation : -" + this.inputLatency + "ms";
            this.latencyView.outputLatencyLabel.innerText = "Output Latency : " + outputLatency.toFixed(2) + "ms";
            localStorage.setItem("latency-compensation", this.inputLatency.toString());
        });
        this.latencyView.closeWindowButton.addEventListener("click", () => {
           this.latencyView.closeWindow();
           if (this.calibrating) {
               this.stopCalibrate();
           }
        });
        this.hostView.latencyBtn.addEventListener("click", () => {
            this.latencyView.openWindow();
        });
        this.latencyView.calibrationButton.addEventListener("click", async () => {
            if (this.calibrating) {
                await this.stopCalibrate();
            }
            else {
                await this.startCalibrate();
            }
        });
    }

    async startCalibrate() {
        await this.setupWorklet()
        await this.ac.resume();
        this.calibrating = true;
        this.latencyView.calibrationButton.innerText = "Stop Calibration";
    }

    async stopCalibrate() {
        await this.ac.close()
        this.calibrating = false;
        this.latencyView.calibrationButton.innerText = "Calibrate Latency";
    }
}