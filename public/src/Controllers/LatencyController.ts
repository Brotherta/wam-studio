import App from "../App";
import HostView from "../Views/HostView";
import LatencyView from "../Views/LatencyView";
import { audioCtx } from "../index";


export default class LatencyController {

    /**
     * Route Application.
     */
    private _app: App;
    /**
     * View of the latency menu.
     */
    private _view: LatencyView;
    /**
     * Host view.
     */
    private _hostView: HostView;
    /**
     * Audio context to record the latency.
     */
    private _recordAudioContext: AudioContext;
    /**
     * Boolean that indicates if the latency is being calibrated.
     */
    private _calibrating: boolean;

    constructor(app: App) {
        this._app = app;
        this._view = app.latencyView;
        this._hostView = app.hostView;
        this._calibrating = false;

        this.getLocalStorages();
        this.bindEvents();
    }

    /**
     * Binds all the events for the latency menu.
     * @private
     */
    private bindEvents(): void {
        this._view.latencyInput.addEventListener("input", () => {
            //@ts-ignore
            const outputLatency = audioCtx.outputLatency * 1000;
            const inputLatency = Number(this._view.latencyInput.value);
            this._app.host.latency = inputLatency;

            this._view.updateLatencyLabels(outputLatency, inputLatency);

            localStorage.setItem("latency-compensation", inputLatency.toString());
        });
        this._view.closeWindowButton.addEventListener("click", async () => {
            this._view.closeWindow();
            if (this._calibrating) {
                await this.stopCalibrate();
            }
        });
        this._view.calibrationButton.addEventListener("click", async () => {
            if (this._calibrating) {
                await this.stopCalibrate();
            }
            else {
                await this.startCalibrate();
            }
        });
    }

    /**
     * Setups the audio worklet to measure the latency.
     * @private
     */
    private async setupWorklet(): Promise<void> {
        this._recordAudioContext = new AudioContext({latencyHint: 0.00001});
        await this._recordAudioContext.suspend();
        await this._recordAudioContext.audioWorklet.addModule(new URL('../Audio/LatencyProcessor.js', import.meta.url))

        const stream = await navigator.mediaDevices.getUserMedia(this._app.settingsController.constraints);
        const mic = this._recordAudioContext.createMediaStreamSource(stream);

        const workletNode = new AudioWorkletNode(this._recordAudioContext, 'measure-processor', {outputChannelCount: [1]});

        workletNode.channelCount = 1;
        workletNode.port.postMessage({threshold: 0.20 });

        workletNode.port.onmessage = (e) => {
            const roundtripLatency = e.data.latency * 1000;
            // @ts-ignore
            const outputLatency = audioCtx.outputLatency * 1000;
            const inputLatency = roundtripLatency - outputLatency;
            this._app.host.latency = inputLatency;

            this._view.latencyInput.value = inputLatency.toFixed(2).toString();
            this._view.updateLatencyLabels(outputLatency, inputLatency, roundtripLatency);

            localStorage.setItem("latency-compensation", inputLatency.toFixed(2).toString());
        }

        mic.connect(workletNode).connect(this._recordAudioContext.destination);
    }

    /**
     * Starts the calibration of the latency.
     */
    private async startCalibrate(): Promise<void> {
        await this.setupWorklet()
        await this._recordAudioContext.resume();
        this._calibrating = true;
        this._view.calibrationButton.innerText = "Stop Calibration";
    }

    /**
     * Stops the calibration of the latency.
     * @private
     */
    private async stopCalibrate(): Promise<void> {
        await this._recordAudioContext.close()
        this._calibrating = false;
        this._view.calibrationButton.innerText = "Calibrate Latency";
    }

    /**
     * Gets the latency from the local storage.
     * @private
     */
    private getLocalStorages() {
        if (localStorage.getItem("latency-compensation") !== null) {
            const latency = parseFloat(localStorage.getItem("latency-compensation")!);
            this._app.host.latency = latency
            this._view.latencyInput.value = latency.toString();
            this._view.inputLatencyLabel.innerText = "Compensation : -" + latency.toFixed(2) + "ms";
        }
    }
}