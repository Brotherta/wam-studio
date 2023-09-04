import DraggableWindow from "../Utils/DraggableWindow";

/**
 * Class of the settings view.
 * It contains all the elements of the settings window.
 */
export default class SettingsView extends DraggableWindow {

    closeBtn = document.getElementById("settings-close-button") as HTMLButtonElement;
    settingsWindow = document.getElementById("settings-window") as HTMLDivElement;
    settingsHeader = document.getElementById("settings-header") as HTMLDivElement;

    selectInputDevice = document.getElementById("select-input-device") as HTMLSelectElement;
    selectOutputDevice = document.getElementById("select-output-device") as HTMLSelectElement;

    constructor() {
        super(document.getElementById("settings-header") as HTMLDivElement, document.getElementById("settings-window") as HTMLDivElement);
    }


    /**
     * Updates the list of input devices.
     * @param devices - List of input devices.
     */
    public updateInputDevices(devices: MediaDeviceInfo[]) {
        this.selectInputDevice.innerHTML = "";
        let i = 1;
        for (let device of devices) {
            let option = document.createElement("option");
            option.value = device.deviceId;
            option.innerText = device.label || "Microphone " + i;
            this.selectInputDevice.appendChild(option);
            i++;
        }
    }

    /**
     * Updates the list of output devices.
     * @param devices - List of output devices.
     */ 
    public updateOutputDevices(devices: MediaDeviceInfo[]) {
        this.selectOutputDevice.innerHTML = "";
        let i = 1;
        for (let device of devices) {
            let option = document.createElement("option");
            option.value = device.deviceId;
            option.innerText = device.label || "Speaker " + i
            this.selectOutputDevice.appendChild(option);
            i++;
        }
    }
}