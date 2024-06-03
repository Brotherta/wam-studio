import App from "../../../App.js";
import OperableAudioBuffer from "../../../Audio/OperableAudioBuffer";
import SampleRegion from "../../../Models/Region/SampleRegion";
import SampleTrack from "../../../Models/Track/SampleTrack.js";
import TrackOf from "../../../Models/Track/Track.js";
import SampleRegionView from "../../../Views/Editor/Region/SampleRegionView";
import WaveformView from "../../../Views/Editor/WaveformView.js";
import { audioCtx } from "../../../index";
import { TrackList } from "../Track/TracksController.js";
import RegionController from "./RegionController";

/**
 * Class that control the regions of the editor.
 */
export default class SampleRegionController extends RegionController<SampleRegion, SampleRegionView> {

  constructor(app: App) {
    super(app)
  }


  protected override _regionViewFactory(region: SampleRegion, waveform: WaveformView): SampleRegionView{
    return new SampleRegionView(this._editorView, region.trackId, region)
  }

  protected override _dummyRegion(track: SampleTrack, start: number, id: number): SampleRegion{
    let buffer = new OperableAudioBuffer({ length:128, sampleRate:audioCtx.sampleRate, numberOfChannels:2});
    return new SampleRegion(track.id,buffer,start,id)
  }
  
  protected override _tracks(): TrackList<SampleRegion,SampleTrack> {
      return this._app.tracksController.sampleTracks
  }
}
