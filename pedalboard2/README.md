# Pedalboard 2
## Presentation
Pedalboard 2 is a composite WAM that integrates multiple WAMs into a single chain. Events are sent to all included WAMs, and their sounds are processed sequentially.

Sound outputs cannot be discarded. If one or more WAMs lack an audio input in the chain, the previous audio outputs are connected to the next available audio input.

This setup allows multiple MIDI instruments to be connected in one chain, enabling simultaneous processing of MIDI events and audio input.

## WAM Libraries
The Pedalboard 2 WAM list can be easily modified by providing a different WAM Library URL. A WAM Library contains WAMs and library presets, and can include many other libraries via their URLs.

A composite WAM that contains multiple WAMs, assembling them in a chain. The events are sent to all contained WAMs and their sounds are assembled in a chain.

A sound output cannot be discarded. If one or multiple WAMs don't have an audio input in the chain, the previous audio outputs are connected to the first available audio input.

This allows multiple MIDI instruments to be placed in one chain, enabling the chain to process both MIDI events and input sound simultaneously.

## WAM Libraries
The Pedalboard 2 WAM list can be easily changed by providing a different WAM Library URL. A WAM Library contains WAMs, library presets, and can include many other libraries through their URLs.

Download the library json schema here: [Library Schema](static/library_schema.json)

Download the example library here: [Example Library](static/library.json)