# Wam-Studio
Updated September 7, 2023

Wam-Studio’s is an online tool for creating audio projects that you can imagine as multi-track music. Each track corresponds to a different "layer" of audio content that can be recorded, edited, or just integrated (using audio files for example). Some track can be used to control virtual instruments: in that case we record the sound that is generated internally by these virtual instruments (and played using a MIDI piano keyboard, for example). Tracks can be added or removed, played isolated or with other tracks. They can also be "armed" for recording, and when the recording starts, all other tracks will play along, while the armed track will record new content.

Current features: robust audio track recording, track regions, loop area on tracks, track plugin fx chain, parameter automation, audio input and output device selection, latency measuring tool + inout latency compensation when recording, project saving on cloud (audio + all metadata), rendering mix with choice of tracks to render, viewport management on tracks (zoom in/out) using pixiJS/WebGL canvas.

<img width="800" alt="image" src="https://i.ibb.co/DkzGZrc/Wam-Studio-Sept2023.jpg">
### Citation

If you use our resource, please cite the following articles:

```
@inproceedings{buffa2023wam,
  title={WAM-studio, a Digital Audio Workstation (DAW) for the Web},
  author={Buffa, Michel and Vidal-Mazuy, Antoine},
  booktitle={Companion Proceedings of the ACM Web Conference 2023},
  pages={543--548},
  year={2023}
}
```

