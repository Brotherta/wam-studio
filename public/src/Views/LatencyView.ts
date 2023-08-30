import {focusWindow} from "../Controllers/StaticController";

/**
 * View for the latency window. It contains all the elements of the latency window.
 */
export default class LatencyView {

    latencyInput = document.getElementById("manual-latency") as HTMLInputElement;
    closeWindowButton = document.getElementById("latency-close-button") as HTMLButtonElement;
    LatencyWindow = document.getElementById("latency-window") as HTMLDivElement;
    calibrationButton = document.getElementById("calibration-button") as HTMLDivElement;

    inputLatencyLabel = document.getElementById("input-latency-label") as HTMLLabelElement;
    roundtripLatencyLabel = document.getElementById("roundtrip-latency-label") as HTMLLabelElement;
    outputLatencyLabel = document.getElementById("output-latency-label") as HTMLLabelElement;

    /**
     * Closes the latency window.
     */
    public closeWindow() {
        this.LatencyWindow.hidden = true;
    }

    /**
     * Opens the latency window.
     */
    public openWindow() {
        this.LatencyWindow.hidden = false;
        focusWindow(this.LatencyWindow);
    }

    /**
     * Updates the latency labels. It is called when the user press the calibration button. It shows the latency
     * measured by the calibration.
     *
     * @param outputLatency - The output latency measured by the calibration.
     * @param inputLatency - The input latency measured by the calibration.
     * @param roundtripLatency - The roundtrip latency measured by the calibration.
     */
    public updateLatencyLabels(outputLatency: number, inputLatency: number, roundtripLatency?: number, ) {
        if (roundtripLatency) {
            this.roundtripLatencyLabel.innerText = "Measured Roundtrip: " + roundtripLatency.toFixed(2) + "ms";
        }
        this.outputLatencyLabel.innerText = "Output Latency: " + outputLatency.toFixed(2) + "ms";
        this.inputLatencyLabel.innerText = "Compensation : -" + inputLatency.toFixed(2) + "ms";
    }
}