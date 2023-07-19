import Track from "../Models/Track";
import TracksView from "../Views/TracksView";
import App from "../App";
import Host from "../Models/Host";
import {audioCtx} from "../index";
import OperableAudioBuffer from "../Audio/OperableAudioBuffer";
import WamEventDestination from "../Audio/WAM/WamEventDestination";
import WamAudioWorkletNode from "../Audio/WAM/WamAudioWorkletNode";
import {SongTagEnum} from "../Utils/SongTagEnum";
import TrackElement from "../Components/TrackElement";
import Plugin from "../Models/Plugin";
import {RATIO_MILLS_BY_PX} from "../Utils/Utils";

/**
 * Controller for the track view. This controller is responsible for adding and removing tracks from the track view.
 */
export default class TracksController {
    
    app: App;
    tracksView: TracksView;
    trackList: Track[];
    trackIdCount: number;

    constructor(app: App) {
        this.app = app;
        this.tracksView = this.app.tracksView;
        this.trackIdCount = 1;
        this.trackList = [];

        this.defineNewTrackCallback();
    }


    async newEmptyTrack(song?: any) {
        let wamInstance = await WamEventDestination.createInstance(this.app.host.hostGroupId, audioCtx);
        let node = wamInstance.audioNode as WamAudioWorkletNode;

        let track = this.createTrack(node);
        if (song) {
            track.url = song.url;
            track.element.name = song.name;
            track.tag = song.tag;
        }
        else {
            track.element.name = `Track ${track.id}`;
            track.tag = SongTagEnum.OTHER;
        }

        return track;
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
        trackElement.id = "track-" + this.trackIdCount;

        let track = new Track(this.trackIdCount, trackElement, node);
        track.plugin  = new Plugin(this.app);
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
    deleteTrack(track: Track) {
        let trackIndex = this.trackList.indexOf(track);
        this.trackList.splice(trackIndex, 1);
        track.node!.removeAudio();
        track.node!.disconnectEvents();
        track.node!.disconnect();
        track.isDeleted = true;
    }

    /**
     * Jump to the given position in px.
     *
     * @param pos the position in px
     */
    jumpTo(pos: number) {
        this.app.host.playhead = (pos * RATIO_MILLS_BY_PX) /1000 * audioCtx.sampleRate

        this.trackList.forEach((track) => {
            track.node!.port.postMessage({playhead: this.app.host.playhead+1})
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
            if (track.isSolo) {
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


    getTrack(trackId: number) {
        return this.trackList.find(track => track.id === trackId);
    }

    defineNewTrackCallback() {
        this.tracksView.newTrackDiv.addEventListener('click', () => {
            this.newEmptyTrack()
                .then(async (track) => {
                    await this.initTrackComponents(track);
                    track.element.progressDone();
                });
        });
    }

    /**
     * It adds a new track to the track view. the color of the track is also changed.
     * It also defines the listeners for the track.
     * 
     * @param track Track to be added to the track view.
     */
    addNewTrackInit(track: Track) {
        this.tracksView.addTrack(track.element);
        this.tracksView.changeColor(track);
        this.defineTrackListener(track);
        track.element.switchMode(this.app.hostController.advancedMode);
    }

    async initTrackComponents(track: Track) {
        await track.plugin.initPlugin(this.app.host.pluginWAM);
        document.getElementById("loading-zone")!.appendChild(track.plugin.dom);
        this.app.tracksController.connectPlugin(track);
        this.app.tracksController.addNewTrackInit(track);
        this.app.bindsController.addBindListener(track);
    }

    /**
     * Removes a track from the track view. It also removes the track from the audio controller.
     * 
     * @param track Track to be removed from the track view.
     */
    removeTrack(track: Track) {
        this.app.pluginsController.removePlugins(track);
        this.tracksView.removeTrack(track.element);
        this.deleteTrack(track);
        this.app.bindsController.removeBindControl(track);
    }

    /**
     * Defines the listeners for the track. It defines the listeners for the close, solo, mute, volume and balance sliders.
     * @param track
     */
    defineTrackListener(track: Track) {
        track.element.addEventListener("click", () => {
            if (!track.removed) {
                this.app.pluginsController.selectTrack(track);
                if (!this.app.bindsView.advancedWindow.hidden) {
                    if (track.bindControl.advElement.firstOpen) {
                        this.app.presetsController.refreshPresetList(track.tag);
                        track.bindControl.advElement.selectPreset("Default");
                        track.bindControl.advElement.firstOpen = false;
                    }
                    this.app.bindsView.showAdvancedWindow(track);
                }
            }
        })

        track.element.closeBtn.onclick = () => {
            track.removed = true;
            this.removeTrack(track);
        }

        track.element.soloBtn.onclick = () => {
            track.isSolo = !track.isSolo;

            if (track.isSolo) {
                this.setSolo(track);
                track.element.solo();
            }
            else {
                this.unsetSolo(track);
                track.element.unsolo();
            }
        }

        track.element.muteBtn.onclick = () => {
            if (track.isMuted) {
                track.unmute();
                track.element.unmute();
            }
            else {
                track.mute();
                track.element.mute();
            }
            track.isMuted = !track.isMuted;
        }

        track.element.balanceSlider.oninput = () => {
            let value = parseFloat(track.element.balanceSlider.value);
            track.setBalance(value);
        }

        track.element.settingsBtn.onclick = () => {
            if (track.bindControl.advElement.firstOpen) {
                this.app.presetsController.refreshPresetList(track.tag);
                track.bindControl.advElement.selectPreset("Default");
                track.bindControl.advElement.firstOpen = false;
            }
            this.app.bindsView.showAdvancedWindow(track);
        }
    }

    /**
     * Connects the plugin to the track. If the track is the host, it connects the plugin to the host gain node.
     * @param track
     */
    connectPlugin(track: Track) {
        if (track.id === -1) {
            let host = track as Host;
            host.gainNode.disconnect(audioCtx.destination);
            host.gainNode
                .connect(host.plugin.instance!._audioNode)
                .connect(host.audioCtx.destination);
        }
        else {
            track.node!.disconnect(track.pannerNode);
            track.node!
                .connect(track.plugin.instance!._audioNode)
                .connect(track.pannerNode);
        }
    }

    /**
     * Disconnects the plugin from the track. If the track is the host, it disconnects the plugin from the host gain node.
     * @param track
     */
    disconnectPlugin(track: Track) {
        if (track.plugin.initialized && track.id === -1) {
            let host = track as Host;
            host.gainNode.disconnect(host.plugin.instance!._audioNode);
            host.gainNode.connect(host.audioCtx.destination);
        }
        else if (track.plugin.initialized) {
            track.node!.disconnect(track.plugin.instance!._audioNode);
            track.node!.connect(track.pannerNode);
        }
    }

    clearAllTracks() {
        for (let track of this.trackList) {
            this.app.pluginsController.removePlugins(track);
            this.app.bindsController.removeBindControl(track);
            this.tracksView.removeTrack(track.element);
            track.node!.removeAudio();
            track.node!.disconnectEvents();
            track.node!.disconnect();
        }
        this.trackList = [];
    }

    async openSong(song:any, name: string) {
        this.app.tracksController.clearAllTracks();
        this.app.hostView.headerTitle.innerHTML = name;
        this.app.hostController.maxTime = 0;
        for (let trackSong of song.songs) {
            console.log(trackSong.name);
            let track = await this.newEmptyTrack(trackSong);
            await this.app.tracksController.initTrackComponents(track);
        }
        for (let track of this.trackList) {
            console.log("loading utl ", track.element.name);
            this.app.tracksController.loadTrackUrl(track);
        }
    }

    loadTrackUrl(track: Track) {
        if (!track.url) return;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', track.url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onprogress = (event) => {
            if (event.lengthComputable) {
                let percentComplete = event.loaded / event.total * 100;
                // update progress bar on track element
                // Stop the request if the track has been removed
                if (track.isDeleted) {
                    xhr.abort();
                    return;
                }
                track.element.progress(percentComplete, event.loaded, event.total);
            }
        };

        xhr.onload = () => {
            if (xhr.status == 200) {
                let audioArrayBuffer = xhr.response;
                audioCtx.decodeAudioData(audioArrayBuffer)
                    .then((audioBuffer) => {
                        if (track.isDeleted) {
                            xhr.abort();
                            return;
                        }
                        let operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype) as OperableAudioBuffer;
                        // @ts-ignore
                        track.node.setAudio(operableAudioBuffer.toArray());
                        track.audioBuffer = operableAudioBuffer;
                        this.app.hostController.maxTime = Math.max(this.app.hostController.maxTime, track.audioBuffer!.duration*1000);
                        track.element.progressDone();
                    });
            } else {
                // Error occurred during the request
                console.error('An error occurred fetching the track:', xhr.statusText);
            }
        };

        xhr.onerror = () => {
            console.error('An error occurred fetching the track');
        };

        xhr.send();
    }
}