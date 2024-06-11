import { audioCtx } from "../../..";
import App from "../../../App.js";
import MIDIRegion, { MIDI } from "../../../Models/Region/MIDIRegion";
import MIDITrack from "../../../Models/Track/MIDITrack";
import MIDIRegionView from "../../../Views/Editor/Region/MIDIRegionView";
import WaveformView from "../../../Views/Editor/WaveformView.js";
import { TrackList } from "../Track/TracksController.js";
import RegionController from "./RegionController";

/**
 * Class that control the regions of the editor.
 */
export default class MIDIRegionController extends RegionController<MIDIRegion, MIDIRegionView> {

  constructor(app: App) {
    super(app)
    console.log("MIDIRegionController")
    audioCtx.audioWorklet.addModule(new URL("../../../Audio/MIDI/MIDIAudioProcessor.js", import.meta.url))
  }


  protected override _regionViewFactory(region: MIDIRegion, waveform: WaveformView): MIDIRegionView{
    return new MIDIRegionView(this._editorView, region.trackId, region)
  }

  protected override _dummyRegion(track: MIDITrack, start: number, id: number, duration?: number): MIDIRegion{
    return new MIDIRegion(track.id,new MIDI(100,[]),start,id)
  }
  
  protected override _tracks(): TrackList<MIDIRegion,MIDITrack> {
      return this._app.tracksController.midiTracks
  }
}
