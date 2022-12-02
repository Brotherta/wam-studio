import App from "../App";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import WamEventDestination from "../Audio/WAM/WamEventDestination";
import TrackElement from "../Components/TrackElement";
import { SongInfo } from "../Controllers/AudioController";
import { audioCtx } from "../index";
import { RATIO_MILLS_BY_PX, SAMPLE_RATE } from "../Utils";
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
        
        let newTracks = [];

        for (let i = 0; i < number; i++) {
            let wamInstance = await WamEventDestination.createInstance(this.app.host.hostGroupId, this.audioCtx);
            let node = wamInstance.audioNode as WamAudioWorkletNode;

            let response = await fetch(`${path}/${songs[i]}`);
            let audioArrayBuffer = await response.arrayBuffer();
            let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

            let operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;

            node.setAudio(operableAudioBuffer.toArray());

            // @ts-ignore
            let track = this.createTrack(node);
            track.addBuffer(operableAudioBuffer);
            track.element.name = songs[i];
            newTracks.push(track);
        }
        return newTracks;
    }

    createTrack(node: WamAudioWorkletNode) {
        let trackElement = document.createElement("track-element") as TrackElement;
        trackElement.trackId = this.trackIdCount;

        let track = new Track(this.trackIdCount, trackElement, node);

        track.gainNode.connect(this.app.host.gainNode);

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
        this.app.host.playhead = (pos * RATIO_MILLS_BY_PX) /1000 * SAMPLE_RATE
        
        this.trackList.forEach((track) => {
            track.node.port.postMessage({playhead: this.app.host.playhead+1})
        });

        this.app.host.hostNode?.port.postMessage({playhead: this.app.host.playhead+1});
    }

    unsetSolo(trackToUnsolo: Track) {
        let isHostSolo = false;

        this.trackList.forEach(track => {
            if (track.isSolo){
                isHostSolo = true;
            }
        });

        if (!isHostSolo) {
            this.trackList.forEach(track => {
                if (!track.isSolo) {
                    if (track.isMuted) {
                        track.muteSolo();
                    }
                    else {
                        track.unmute();
                    }
                }
            });
        } else {
            trackToUnsolo.muteSolo();
        }
    }

    setSolo(trackToSolo: Track) {
        this.trackList.forEach((track) => {
            if (track !== trackToSolo && !track.isSolo) {
                track.muteSolo();
            }
        });
        if (!trackToSolo.isMuted) {
            trackToSolo.unmute();
        }
    }
}