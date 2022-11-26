import App from "../App";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import WamEventDestination from "../Audio/WAM/WamEventDestination";
import TrackElement from "../Components/TrackElement";
import { SongInfo } from "../Controllers/MenuController";
import { audioCtx } from "../index";
import Track from "./Track";

export default class Audios {

    app: App;

    audioCtx: AudioContext;
    trackList: Track[];
    trackIdCount: number;

    constructor(app: App) {
        this.app = app;
        this.audioCtx = audioCtx;
        this.trackList = [];
        this.trackIdCount = 1;
    }
    
    async newTrackWithAudio(path: String, songInfo: SongInfo) {    
        let number = songInfo.number;
        let songs = songInfo.songs;
        
        let newTrack = [];

        for (let i = 0; i < number; i++) {
            let wamInstance = await WamEventDestination.createInstance(this.app.host.hostGroupId, this.audioCtx);
            let node = wamInstance.audioNode as WamAudioWorkletNode;

            let response = await fetch(`${path}/${songs[i]}`);
            let audioArrayBuffer = await response.arrayBuffer();
            let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
            console.log("duration : "+ audioBuffer.duration);
            

            let operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;

            node.setAudio(operableAudioBuffer.toArray());
            node.connect(this.app.host.gainNode);

            // @ts-ignore
            let track = this.newTrack(node);
            newTrack.push(track);
        }
        return newTrack;
    }

    newTrack(node: WamAudioWorkletNode) {
        let trackElement = document.createElement("track-element") as TrackElement;
        trackElement.trackId = this.trackIdCount;

        let track = new Track(this.trackIdCount, trackElement, node);
        this.trackList.push(track);
        
        this.trackIdCount++;
        return track;
    }

    removeTrack(track: Track) {
        let trackIndex = this.trackList.indexOf(track);
        this.trackList.splice(trackIndex, 1);  
        track.node.removeAudio();
        track.node.disconnectEvents();
        track.node.disconnect();
    }

    jumpTo(pos: number) {
        console.log("pos :", pos);
        
    }

}