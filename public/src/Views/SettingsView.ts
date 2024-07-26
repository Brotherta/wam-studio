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
        this.initMIDIInputDevice()
    }



    /* MIDI INPUT DEVICE */
    private selectMIDIInputDevice = document.getElementById("select-midi-input-device") as HTMLSelectElement;
    // @ts-ignore
    private _selectedMIDIInputDevice: MIDIInput | null = null;

    //@ts-ignore
    public on_midi_message=new Set<(message: MIDIMessageEvent)=>void>()

    public get selectedMIDIInputDevice() {
        return this._selectedMIDIInputDevice;
    }

    
    private initMIDIInputDevice() {
        // On midi message callback
        const that=this
        // @ts-ignore
        function onMidiMessage(e: MIDIMessageEvent){
            that.on_midi_message.forEach((callback)=>callback(e))
        }

        // @ts-ignore
        if(navigator.requestMIDIAccess){
            this.selectMIDIInputDevice?.add
            // @ts-ignore
            navigator.requestMIDIAccess().then((midiAccess) => {
                const that=this
                function selectDevice(id: string){
                    that.selectedMIDIInputDevice?.removeEventListener("midimessage", onMidiMessage)
                    if(id === "-1") that._selectedMIDIInputDevice=null
                    const selectedDevice = midiAccess.inputs.get(id)
                    if(selectedDevice) that._selectedMIDIInputDevice = selectedDevice
                    that.selectedMIDIInputDevice?.addEventListener("midimessage", onMidiMessage)
                }

                // On change of the midi list:
                const refreshSelect=() => {
                    console.log("MIDI Access granted", midiAccess)

                    // Remember the selected device
                    const selectedDeviceId = this._selectedMIDIInputDevice?.id ?? "-1"

                    // Add options in the select
                    this.selectMIDIInputDevice.innerHTML = "";
                    const noMidi= this.selectMIDIInputDevice.add(new Option("No MIDI Input", "-1"));
                    // @ts-ignore
                    midiAccess.inputs.forEach((input) => {
                        this.selectMIDIInputDevice.add(new Option(input.name??"Unknown", input.id));
                    })

                    // Reselect the already selected device
                    const reselected= this.selectMIDIInputDevice.querySelector(`option[value="${selectedDeviceId}"]`) as HTMLOptionElement ?? noMidi
                    reselected.selected=true

                    selectDevice(reselected.value)
                }
                midiAccess.addEventListener("statechange", refreshSelect)
                refreshSelect()
                if(this.selectMIDIInputDevice.options.length>1)selectDevice(this.selectMIDIInputDevice.options[1].value)

                // On device selection:
                this.selectMIDIInputDevice.addEventListener("input", (e)=>selectDevice(this.selectMIDIInputDevice.value))
            })
        }
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