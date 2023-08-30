import App from "../App";
import LatencyView from "../Views/LatencyView";
import HostView from "../Views/HostView";
import {audioCtx} from "../index";


export default class LatencyController {

    app: App;
    view: LatencyView;
    hostView: HostView;
    recordAudioContext: AudioContext;
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
        this.view = app.latencyView;
        this.hostView = app.hostView;
        this.calibrateInitialized = false;
        this.calibrating = false;

        this.getLocalStorages();

        this.defineListeners();
    }

    getLocalStorages() {
        if (localStorage.getItem("latency-compensation") !== null) {
            this.inputLatency = parseFloat(localStorage.getItem("latency-compensation")!);
            this.view.latencyInput.value = this.inputLatency.toString();
            this.app.host.latency = this.inputLatency;
            this.view.inputLatencyLabel.innerText = "Compensation : -" + this.inputLatency.toFixed(2) + "ms";
        }
    }

    async setupWorklet() {
        this.recordAudioContext = new AudioContext({latencyHint: 0.00001});
        await this.recordAudioContext.suspend();
        await this.recordAudioContext.audioWorklet.addModule(new URL('../Audio/LatencyProcessor.js', import.meta.url))

        this.stream = await navigator.mediaDevices.getUserMedia(this.app.settingsController.constraints);
        this.mic = this.recordAudioContext.createMediaStreamSource(this.stream);

        if (this.workletNode !== undefined) {
            this.workletNode.disconnect();
            this.mic?.disconnect();
        }
        this.workletNode = new AudioWorkletNode(this.recordAudioContext, 'measure-processor', {outputChannelCount: [1]});
        this.workletNode.channelCount = 1;
        this.workletNode.port.postMessage({threshold: 0.20 });

        this.workletNode.port.onmessage = (e) => {
            this.roundtripLatency = e.data.latency * 1000;
            // @ts-ignore
            this.outputLatency = this.recordAudioContext.outputLatency * 1000;
            this.inputLatency = this.roundtripLatency - this.outputLatency;
            this.view.latencyInput.value = this.inputLatency.toFixed(2).toString();

            this.view.roundtripLatencyLabel.innerText = "Measured Roundtrip: " + this.roundtripLatency.toFixed(2) + "ms";
            this.view.outputLatencyLabel.innerText = "Output Latency: " + this.outputLatency.toFixed(2) + "ms";
            this.view.inputLatencyLabel.innerText = "Compensation : -" + this.inputLatency.toFixed(2) + "ms";
            localStorage.setItem("latency-compensation", this.inputLatency.toFixed(2).toString());
            // @ts-ignore
            // this.app.host.latency = Number(this.settingsView.latencyInput.value)- this.ac.outputLatency * 1000;
            this.app.host.latency = this.inputLatency;
        }

        // @ts-ignore
        this.mic.connect(this.workletNode).connect(this.recordAudioContext.destination);

    }

    defineListeners() {
        this.view.latencyInput.addEventListener("input", () => {
            //@ts-ignore
            let outputLatency = audioCtx.outputLatency * 1000;
            //@ts-ignore
            this.inputLatency = Number(this.view.latencyInput.value);
            this.app.host.latency = this.inputLatency;
            //@ts-ignore
            this.view.inputLatencyLabel.innerText = "Compensation : -" + this.inputLatency + "ms";
            this.view.outputLatencyLabel.innerText = "Output Latency : " + outputLatency.toFixed(2) + "ms";
            localStorage.setItem("latency-compensation", this.inputLatency.toString());
        });
        this.view.closeWindowButton.addEventListener("click", () => {
           this.view.closeWindow();
           if (this.calibrating) {
               this.stopCalibrate();
           }
        });
        this.hostView.latencyBtn.addEventListener("click", () => {
            this.view.openWindow();
        });
        this.view.calibrationButton.addEventListener("click", async () => {
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
        await this.recordAudioContext.resume();
        this.calibrating = true;
        this.view.calibrationButton.innerText = "Stop Calibration";
    }

    async stopCalibrate() {
        await this.recordAudioContext.close()
        this.calibrating = false;
        this.view.calibrationButton.innerText = "Calibrate Latency";
    }
}