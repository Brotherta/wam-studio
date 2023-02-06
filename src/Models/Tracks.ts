import App from "../App";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import WamEventDestination from "../Audio/WAM/WamEventDestination";
import TrackElement from "../Components/TrackElement";
import { SongInfo } from "../Controllers/HostController";
import { audioCtx } from "../index";
import {MAX_DURATION_SEC, RATIO_MILLS_BY_PX, SAMPLE_RATE} from "../Utils";
import Track from "./Track";
import AudioPlugin from "./AudioPlugin";

/**
 * Model for the audios buffers stored in each tracks. 
 * It contains the list of tracks and the audio context.
 */
export default class Tracks {

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
    
    /**
     * Create a new TracksView for all files given in parameters with the given information. Fetching audio files and initialize
     * the audio nodes and the canvas.
     * 
     * @param path the path to the audio files
     * @param songInfo the object containing the number of files and the names of the files
     * @returns the new tracks that have been created
     */
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

    /**
     * Create the track with the given file. It verifies the type of the file and then create the track.
     *
     * It returns undefined if the file is not an audio file and if the duration of the file is too long.
     *
     * @param file
     */
    async newTrackWithFile(file: File) {
        if (file.type === "audio/mpeg" || file.type === "audio/wav" || file.type === "audio/mp3") {
            let wamInstance = await WamEventDestination.createInstance(this.app.host.hostGroupId, this.audioCtx);
            let node = wamInstance.audioNode as WamAudioWorkletNode;

            let audioArrayBuffer = await file.arrayBuffer();
            let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
            if (audioBuffer.duration > MAX_DURATION_SEC) {
                console.warn("Audio file too long, max duration is " + MAX_DURATION_SEC + " seconds");
                return undefined;
            }
            let operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;

            node.setAudio(operableAudioBuffer.toArray());

            // @ts-ignore
            let track = this.createTrack(node);
            track.addBuffer(operableAudioBuffer);
            track.element.name = file.name;
            return track;
        }
        else {
            console.warn("File type not supported");
            return undefined;
        }
    }

    /**
     * Create a new TracksView with the given audio node. Initialize the audio nodes and the canvas.
     *  
     * @param node 
     * @returns the created track
     */
    createTrack(node: WamAudioWorkletNode) {
        let trackElement = document.createElement("track-element") as TrackElement;
        trackElement.trackId = this.trackIdCount;

        let track = new Track(this.trackIdCount, trackElement, node);
        track.plugin  = new AudioPlugin(this.app);
        track.gainNode.connect(this.app.host.gainNode);

        this.trackList.push(track);
        
        this.trackIdCount++;
        return track;
    }

    /**
     * Remove the given track from the track list and disconnect the audio node.
     * 
     * @param track the track to remove
     */
    removeTrack(track: Track) {
        let trackIndex = this.trackList.indexOf(track);
        this.trackList.splice(trackIndex, 1);  
        track.node.removeAudio();
        track.node.disconnectEvents();
        track.node.disconnect();
    }

    /**
     * Jump to the given position in px.
     * 
     * @param pos the position in px
     */
    jumpTo(pos: number) {
        this.app.host.playhead = (pos * RATIO_MILLS_BY_PX) /1000 * SAMPLE_RATE
        
        this.trackList.forEach((track) => {
            track.node.port.postMessage({playhead: this.app.host.playhead+1})
        });

        this.app.host.hostNode?.port.postMessage({playhead: this.app.host.playhead+1});
    }

    /**
     * Mute or unmute all tracks except the given one.
     * 
     * @param trackToUnsolo the track to unsolo.
     */

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

    /**
     * Mute all tracks except the given one.
     * 
     * @param trackToSolo the track to solo.
     */
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