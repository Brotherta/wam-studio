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
    selectMIDIInputDevice =  document.getElementById("select-midi-input-device") as HTMLSelectElement;

    constructor() {
        super(document.getElementById("settings-header") as HTMLDivElement, document.getElementById("settings-window") as HTMLDivElement);
    }
    
}