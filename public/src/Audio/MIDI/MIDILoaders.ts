import { ArrayBufferReader } from "../../Utils/ArrayBufferReader";
import { MIDI, MIDIAccumulator, MIDIBuilder, MIDINote } from "./MIDI";


export async function parseNoteList(buffer: ArrayBuffer): Promise<MIDI|null>{
    if(String.fromCharCode(...new Uint8Array(buffer).subarray(0, 10))!="NOTE_LIST ")return null

    const notes: {[key:string]:number} = {do: MIDI.DO, re: MIDI.RE, mi: MIDI.MI, fa: MIDI.FA, sol: MIDI.SOL, la: MIDI.LA, si: MIDI.SI}
    try{
        let decoder= new TextDecoder().decode(buffer) // Decode the file
        let splitted= decoder.split(/[\n \t]+/g) // Split the file content
        let cleared= splitted.filter((line)=>line.length>0) // Remove empty lines

        // Get the base time unit in milliseconds
        let base_time= parseInt(cleared[1])
        if(isNaN(base_time))return null
        let current_start= 0

        // For each note
        const accumulator=new MIDIBuilder()
        for(let i=2; i<cleared.length; i++){
            let event= cleared[i]
            
            // Skip time
            if(event=="_"){
                current_start+=base_time
                continue
            }

            // Walk back
            if(event=="<"){
                current_start-=base_time
                continue
            }

            // Get note duration
            let duration=base_time
            while(event.endsWith("=")){
                duration+=base_time
                event=event.slice(0, -1)
            }

            // Get the octave offset
            let note=0
            while(event.endsWith("+")){
                note+=MIDI.octave_width
                event=event.slice(0, -1)
            }
            while(event.endsWith("-")){
                note-=MIDI.octave_width
                event=event.slice(0, -1)
            }

            // Get demi-tone offset
            if(event.endsWith("#")){
                event=event.slice(0, -1)
                note++
            }
            if(event.endsWith("b")){
                event=event.slice(0, -1)
                note--
            }

            // Get the note
            note+= notes[event.toLowerCase()] ?? 0

            accumulator.addNote(new MIDINote(note, 1, 0, duration), current_start)

            current_start+=base_time
        }
        return accumulator.build()
    }
    catch(e){
        return null
    }
}

/**
 * Load a .mid (Standard MIDI File) file into a new MIDI Object.
 * @param buffer 
 * @returns 
 */
export async function parseSFMMidi(buffer: ArrayBuffer): Promise<MIDI|null>{
    let reader= new ArrayBufferReader(buffer)
    let accumulator=new MIDIAccumulator()
    
    const header= reader.readString(4)
    if(header!="MThd"){  console.error("Invalid MIDI file header"); return null }

    const header_length= reader.readUint32()
    if(header_length!=6){ console.error("Invalid MIDI file header length"); return null }

    const format= reader.readUint16()
    const track_count= reader.readUint16()
    const tick_= reader.readByte()
    const _quarter = reader.readByte()
    if(tick_>128){
        console.error("Unsupported MIDI division type")
        return null
    }
    const tick_per_quarter_note= (tick_-128)/_quarter

    // For each track to read
    try{
        for(let i=0; i<track_count; i++){
            const track_header= reader.readString(4)
            const track_length= reader.readUint32()
            let nano_per_beat=500_000
            let current_time=0
            // Read all events
            while(!reader.end){
                const delta_time= reader.readVarUInt()
                const midi_event= reader.readUint8();
                const event_type= midi_event&0xF0
                console.log("Event :", event_type, "= 0x"+event_type.toString(16), "= 0b"+event_type.toString(2))
                // Meta events
                if(midi_event==0xff){
                    const meta_type= reader.readUint8()
                    const meta_length= reader.readVarUInt()
                    if(meta_type==0x2F){
                        reader.readBytes(meta_length)
                        break
                    }
                    /*if(meta_type==0x51){ // Tempo settings
                        nano_per_beat= reader.readUint24()
                    }
                    else */reader.readBytes(meta_length)
                }
                else if(event_type==0x90){
                    const channel= midi_event&0x0F
                    const note= reader.readUint8()
                    const velocity= reader.readUint8()
                    accumulator.noteOn(note, channel, velocity/127, current_time)
                    current_time+=500
                }else if(event_type==0x80){
                    const channel= midi_event&0xf0/0x10
                    const note= reader.readUint8()
                    const velocity= reader.readUint8()
                    accumulator.noteOff(note, channel, current_time)
                }else{
                    console.error("     Not YOU")
                }
            }
        }
    }catch(e){
        console.error("Error while reading MIDI", e)
    }
    return accumulator.build()
}