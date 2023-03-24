import {focusWindow} from "../Controllers/StaticController";


export default class LatencyView {

    latencyInput = document.getElementById("manual-latency") as HTMLInputElement;
    closeWindowButton = document.getElementById("settings-close-button") as HTMLButtonElement;
    LatencyWindow = document.getElementById("latency-window") as HTMLDivElement;
    calibrationButton = document.getElementById("calibration-button") as HTMLDivElement;

    inputLatencyLabel = document.getElementById("input-latency-label") as HTMLLabelElement;
    roundtripLatencyLabel = document.getElementById("roundtrip-latency-label") as HTMLLabelElement;
    outputLatencyLabel = document.getElementById("output-latency-label") as HTMLLabelElement;

    closeWindow() {
        this.LatencyWindow.hidden = true;
    }

    openWindow() {
        this.LatencyWindow.hidden = false;
        focusWindow(this.LatencyWindow);
    }
}