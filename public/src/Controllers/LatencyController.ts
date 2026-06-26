import App from "../App";
import LatencyView from "../Views/LatencyView";
import { audioCtx } from "../index";
import '@adasp/latency-test';
import type { LatencyTestElement, LatencyResultDetail, LatencyCompleteDetail } from '@adasp/latency-test';


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
     * Active <latency-test> element during calibration.
     */
    private _latencyEl: LatencyTestElement | null = null;
    /**
     * Mic stream opened for calibration.
     */
    private _calibStream: MediaStream | null = null;
    /**
     * Boolean that indicates if the latency is being calibrated.
     */
    private _calibrating: boolean;

    constructor(app: App) {
        this._app = app;
        this._view = app.latencyView;
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
            if (!Number.isFinite(inputLatency) || inputLatency < 0) return;
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
     * Creates and starts a <latency-test> element using the main audioCtx.
     * Uses audioworklet mode to match WAM Studio's recording pipeline.
     */
    private async setupLatencyTest(): Promise<void> {
        const el = document.createElement('latency-test') as LatencyTestElement;
        el.recordingMode = 'audioworklet';
        el.numberOfTests = 3;
        document.body.appendChild(el);
        this._latencyEl = el;

        let stream: MediaStream;
        try {
            const constraints = this._app.settingsController.constraints ?? {
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            };
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
            console.error('Calibration: getUserMedia failed:', err);
            if (this._latencyEl === el) this._cleanupLatencyTest();
            else el.remove();
            throw err;
        }
        // Cancellation guard: user may have clicked Stop while getUserMedia() was pending
        if (this._latencyEl !== el || !this._calibrating) {
            stream.getTracks().forEach(t => t.stop());
            return;
        }
        this._calibStream = stream;

        // Ensure main context is running before handing it to the component
        if (audioCtx.state !== 'running') {
            try {
                await audioCtx.resume();
            } catch (err) {
                console.error('Calibration: audioCtx.resume() failed:', err);
                if (this._latencyEl === el) {
                    this._cleanupLatencyTest();
                } else {
                    stream.getTracks().forEach(t => t.stop());
                    el.remove();
                }
                throw err;
            }
        }
        if (this._latencyEl !== el || !this._calibrating) {
            return;
        }

        // Use the MAIN audioCtx — matches the recording pipeline's output sink,
        // sample rate, and outputLatency. Never close it during cleanup.
        el.audioContext = audioCtx;
        el.inputStream = stream;

        el.addEventListener('latency-result', (e: Event) => {
            if (this._latencyEl !== el) return;
            const detail = (e as CustomEvent<LatencyResultDetail>).detail;
            console.log(`[latency-test] result: ${detail.latency.toFixed(1)}ms  ratio: ${detail.ratio.toFixed(1)}dB  reliable: ${detail.reliable}`);
            const outputLatency = audioCtx.outputLatency * 1000;
            if (detail.reliable) {
                this._view.updateLatencyLabels(outputLatency, detail.latency, detail.latency);
            }
        });

        el.addEventListener('latency-complete', (e: Event) => {
            if (this._latencyEl !== el) return;
            const detail = (e as CustomEvent<LatencyCompleteDetail>).detail;
            if (detail.aborted) {
                console.log('[latency-test] complete: aborted');
            } else if (!detail.results?.every(r => r.reliable)) {
                console.warn('[latency-test] complete: unreliable results — no value committed. Check mic/headphone acoustic coupling and ensure headphones are near the mic.');
            }
            if (
                !detail.aborted &&
                detail.results != null &&
                detail.results.length === 3 &&
                detail.results.every(r => r.reliable)
            ) {
                const mean = detail.mean;
                this._app.host.latency = mean;
                this._view.latencyInput.value = mean.toFixed(2);
                const outputLatency = audioCtx.outputLatency * 1000;
                this._view.updateLatencyLabels(outputLatency, mean, mean);
                localStorage.setItem('latency-compensation', mean.toFixed(2));
            }
            this._cleanupLatencyTest();
            this._calibrating = false;
            this._view.calibrationButton.innerText = 'Calibrate Latency';
        });

        el.addEventListener('latency-error', (e: Event) => {
            if (this._latencyEl !== el) return;
            console.error('latency-test error:', (e as CustomEvent).detail);
            this._cleanupLatencyTest();
            this._calibrating = false;
            this._view.calibrationButton.innerText = 'Calibrate Latency';
        });

        try {
            await el.start();
        } catch (err) {
            if (this._latencyEl !== el) return;
            console.error('Calibration: el.start() failed:', err);
            this._cleanupLatencyTest();
            this._calibrating = false;
            this._view.calibrationButton.innerText = 'Calibrate Latency';
        }
    }

    private _cleanupLatencyTest(): void {
        this._calibStream?.getTracks().forEach(t => t.stop());
        this._calibStream = null;
        this._latencyEl?.remove();
        this._latencyEl = null;
    }

    /**
     * Starts the calibration of the latency.
     */
    private async startCalibrate(): Promise<void> {
        this._calibrating = true; // set BEFORE any await — race-safe
        this._view.calibrationButton.innerText = 'Stop Calibration';
        try {
            await this.setupLatencyTest();
        } catch (_err) {
            // getUserMedia failed or other setup error — already logged and cleaned up in setupLatencyTest
            this._calibrating = false;
            this._view.calibrationButton.innerText = 'Calibrate Latency';
        }
    }

    /**
     * Stops the calibration of the latency.
     * @private
     */
    private async stopCalibrate(): Promise<void> {
        this._latencyEl?.stop(); // fires latency-complete with { aborted: true }
        this._cleanupLatencyTest(); // idempotent — safe if already cleaned up
        this._calibrating = false;
        this._view.calibrationButton.innerText = 'Calibrate Latency';
    }

    /**
     * Gets the latency from the local storage.
     * @private
     */
    private getLocalStorages() {
        const stored = localStorage.getItem("latency-compensation");
        if (stored !== null) {
            const latency = Number.parseFloat(stored);
            if (!Number.isFinite(latency) || latency < 0) return;
            this._app.host.latency = latency;
            this._view.latencyInput.value = latency.toString();
            this._view.inputLatencyLabel.innerText = "Compensation : -" + latency.toFixed(2) + "ms";
        }
    }
}
