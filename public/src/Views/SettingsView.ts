

export default class SettingsView {

    closeBtn = document.getElementById("settings-close-button") as HTMLButtonElement;
    settingsWindow = document.getElementById("settings-window") as HTMLDivElement;

    selectInputDevice = document.getElementById("select-input-device") as HTMLSelectElement;
    selectOutputDevice = document.getElementById("select-output-device") as HTMLSelectElement;

    updateInputDevices(devices: MediaDeviceInfo[]) {
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

    updateOutputDevices(devices: MediaDeviceInfo[]) {
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