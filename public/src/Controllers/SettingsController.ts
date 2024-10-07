import App from "../App";
import { createSelect } from "../Utils/dom";
import SettingsView from "../Views/SettingsView";
import { audioCtx } from "../index";

/**
 * The class that control the events related to the global settings of the host.
 */
export default class SettingsController {

    /** Called each time a MIDI Event is received. **/ // @ts-ignore 
    public on_midi_message = new Set<(message: MIDIMessageEvent) => void>()

    /** The selected microphone input node. */
    public soundInputNode: AudioNode = audioCtx.createGain()


    /** Settings view. */
    private view: SettingsView;

    /** The constraints for the media stream. */
    public constraints: MediaStreamConstraints | undefined;

    constructor(app: App) {
        this.view = app.settingsView;

        this.initMIDIInputDevice()
        this.initAudioInputOutputDevice()
        this.bindEvents()
    }



    //// MIDI INPUT DEVICE ////
    private initMIDIInputDevice() {
        const that = this

        // On midi message callback
        // @ts-ignore
        function onMidiMessage(e: MIDIMessageEvent) {
            that.on_midi_message.forEach((callback) => callback(e))
        }

        // @ts-ignore
        navigator.requestMIDIAccess?.()?.then((midiAccess) => {

            const refresh = function () {
                createSelect(
                    that.view.selectMIDIInputDevice,
                    "midiinput",
                    "No MIDI Input",
                    [...midiAccess.inputs.values()],
                    it => [it.name ?? "Unknown", it.id],
                    selected => {
                        if (that._selectedMIDIInputDevice != null) {
                            that._selectedMIDIInputDevice.removeEventListener("midimessage", onMidiMessage)
                            that._selectedMIDIInputDevice = null
                        }
                        if (selected != null) {
                            that._selectedMIDIInputDevice = selected
                            selected.addEventListener("midimessage", onMidiMessage)
                        }
                    },
                    -1
                )
            }
            midiAccess.onstatechange = refresh
            refresh()
        })
    }

    //@ts-ignore
    private _selectedMIDIInputDevice: MIDIInput | null = null;



    //// AUDIO INPUT AND OUTPUT DEVICE ////
    private async initAudioInputOutputDevice() {
        const that = this

        async function refresh() {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log(devices.map(it => it.kind + " " + it.groupId + " " + it.deviceId + " " + it.label + "\n"))

            // Input Device
            createSelect(
                that.view.selectInputDevice,
                "audioinput",
                "No Input Device",
                devices.filter(it => it.kind === "audioinput"),
                it => [it.label ?? "Unknown", it.deviceId],
                async device => {
                    if (that._selectedInputDevice != null) {
                        that._selectedInputDevice.disconnect(that.soundInputNode)
                        that._selectedInputDevice = null
                    }
                    if (device != undefined) {
                        const constraints = { audio: { deviceId: { exact: device.deviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false } }
                        that.constraints = constraints
                        let stream = await navigator.mediaDevices.getUserMedia(constraints)
                        that._selectedInputDevice = audioCtx.createMediaStreamSource(stream)
                        that._selectedInputDevice.connect(that.soundInputNode)
                    }
                },
                -1
            )

            // Output Device
            // @ts-ignore
            const baseSinkId = audioCtx.sinkId

            createSelect(
                that.view.selectOutputDevice,
                "audiooutput",
                "Base Output Device",
                devices.filter(it => it.kind === "audiooutput"),
                it => [it.label ?? "Unknown", it.deviceId],
                async device => {
                    try {
                        // @ts-ignore
                        if (audioCtx.setSinkId) await audioCtx.setSinkId(device != null ? device.deviceId : baseSinkId);
                    } catch (e) {
                        console.log("Error with setSinkId: " + e)
                    }
                },
                -1
            )

            console.log("devices: " + devices.filter(it => it.kind === "audioinput").map(it => it.kind + " " + it.groupId + " " + it.deviceId + " " + it.label + "\n"))

            console.log("devices: " + devices.map(it => it.kind + " " + it.groupId + " " + it.deviceId + " " + it.label + "\n"))

        }
        refresh()
        navigator.mediaDevices.addEventListener("devicechange", () => refresh())
    }

    private _selectedInputDevice: AudioNode | null = null;

    /**
     * Opens the settings window. It also updates the list of input and output devices. 
     */
    public async openSettings(): Promise<void> {
        this.view.settingsWindow.hidden = false;
    }

    private bindEvents() {
        this.view.closeBtn.onclick = () => this.view.settingsWindow.hidden = true
    }
}