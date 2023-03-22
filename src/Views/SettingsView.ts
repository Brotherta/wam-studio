import {focusWindow} from "../Controllers/StaticController";


export default class SettingsView {

    latencyInput = document.getElementById("manual-latency") as HTMLInputElement;
    closeWindowButton = document.getElementById("settings-close-button") as HTMLButtonElement;
    setingsWindow = document.getElementById("settings-window") as HTMLDivElement;
    calibrationButton = document.getElementById("calibration-button") as HTMLDivElement;
    calibrationLabel = document.getElementById("latency-label") as HTMLLabelElement;

    closeWindow() {
        this.setingsWindow.hidden = true;
    }

    openWindow() {
        this.setingsWindow.hidden = false;
        focusWindow(this.setingsWindow);
    }
}