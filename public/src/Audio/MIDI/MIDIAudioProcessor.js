// @ts-check

/** @typedef {import("../../Models/Region/MIDIRegion.js").MIDIInstant} MIDIInstant */


// TODO gérer la durée de vie du processor pour éviter les fuites de mémoire
// Voir: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process#return_value
class MIDIAudioProcessor extends AudioWorkletProcessor {

    /** @type {MIDIInstant[]} @see MIDI */
    instants = []

    /** @type {number} The durations of one MIDIInstant in milliseconds @see MIDI */
    instant_duration = 100

    /** @type {number} The playhead position in milliseconds */
    playhead= 0
    previousPlayhead= -1

    constructor(){
        super()
        this.port.onmessage= this.onmessage.bind(this)
    }

    /**
     * @param {MessageEvent} event
     */
    onmessage(event){
        if("instants" in event.data){
            this.instants = event.data.instants
        }
        if("instant_duration" in event.data){
            this.instant_duration = event.data.instant_duration
        }
        if("playhead" in event.data){
            this.playhead = event.data.playhead
            this.previousPlayhead = this.playhead-1
        }
    }
    
    /**
     * 
     * @param {Float32Array[][]} inputs 
     * @param {Float32Array[][]} outputs 
     * @param {Record<string, Float32Array>} parameters 
     * @returns {boolean}
     */
    process(inputs, outputs, parameters)  {
        if(!parameters["isPlaying"][0])return true

        // Get the note
        let instantI = Math.floor(this.playhead/this.instant_duration)
        if(instantI>=this.instants.length)return true
        let instant = this.instants[instantI]

        let localPrevious= this.previousPlayhead-this.instant_duration*instantI
        let localCurrent= this.playhead-this.instant_duration*instantI

        let selectedNote=-1
        for(const {offset,note} of instant){
            if(localPrevious<offset && offset<=localCurrent){
                selectedNote=note.note
                this.port.postMessage({note: selectedNote})
            }
        }
        this.previousPlayhead= this.playhead
        this.playhead+= outputs[0][0].length/sampleRate*1000

        //selectedNote*10

        // Play the note
        if(selectedNote===-1)return true
        for(let c=0; c<outputs[0].length; c++){
            for(let i=0; i<outputs[0][c].length; i++){
                outputs[0][c][i] = Math.sin((currentFrame+i)/selectedNote*10)*0.2;
            }
        }
        return true
    }
    
    /** @type {import("@webaudiomodules/api").AudioParamDescriptor[]} */
    static parameterDescriptors=[
        {name:"isPlaying", defaultValue:0, minValue:0, maxValue:1, automationRate:"k-rate"}
    ]
}

console.log("audio side")

registerProcessor("jempasam.midi-audio-processor", MIDIAudioProcessor);