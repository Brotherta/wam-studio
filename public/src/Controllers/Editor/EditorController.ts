import App, { crashOnDebug } from "../../App";
import { MIDI } from "../../Audio/MIDI/MIDI";
import { parseNoteList } from "../../Audio/MIDI/MIDILoaders";
import OperableAudioBuffer from "../../Audio/OperableAudioBuffer";
import { RATIO_MILLS_BY_PX, ZOOM_LEVEL, decrementZoomLevel, incrementZoomLevel } from "../../Env";
import MIDIRegion from "../../Models/Region/MIDIRegion";
import { RegionOf } from "../../Models/Region/Region";
import SampleRegion from "../../Models/Region/SampleRegion";
import Track from "../../Models/Track/Track";
import EditorView from "../../Views/Editor/EditorView";
import { audioCtx } from "../../index";

/**
 * Interface of the custom event of the ScrollBarElement.
 */
export interface ScrollEvent extends Event {
    detail?: {
        value: number,
        type: string
    }
}

/**
 * Controller class that binds the events of the editor. It controls the zoom and the render of the editor.
 */
export default class EditorController {

    /**
     * The file loaders used to load dragged files.
     * It should return the loaded region or null if the file is not supported.
     */
    static DRAG_LOADERS: ((start:number, file:ArrayBuffer, type: string)=>Promise<RegionOf<any>|null>)[]= [
        // Load MIDI files through note list
        async function(start, buffer, type){
            const midi= await parseNoteList(buffer)
            if(midi)return new MIDIRegion(midi, start)
            else return null
        },
        // Load MIDI files
        async function(start, buffer, type){
            if(!["audio/mid"].includes(type))return null
            const midi= await MIDI.load2(buffer)
            if(midi)return new MIDIRegion(midi, start)
            else return null
        },
        // Load sample files
        async function(start, buffer, type){
            if(!["audio/mpeg","audio/ogg","audio/wav","audio/x-wav"].includes(type))return null
            try{
                let audioArrayBuffer = buffer
                let audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
                let operableAudioBuffer = OperableAudioBuffer.make(audioBuffer);
                return new SampleRegion(operableAudioBuffer, start)
            }catch(e){
                console.error(e)
                return null
            }
        },
    ]

    /** Route Application. */
    private _app: App;

    /** View of the editor. */
    private _view: EditorView;

    /** Timeout for the zoom to be rendered. Contains the callback of the final render for the waveforms. */
    private _timeout: NodeJS.Timeout;

    /** Pointer to the current zoom level. */
    private _currentLevel = 5;

    /** Last zoom level executed. */
    private _lastExecutedZoom = 0

    /** Minimum ratio of pixels by milliseconds. */
    private readonly MIN_RATIO = 1;

    /** Maximum ratio of pixels by milliseconds. */
    private readonly MAX_RATIO = 500;

    /** Number of zoom steps. */
    private readonly ZOOM_STEPS = 12;

    /** Last zoom level executed. */
    private readonly THROTTLE_TIME = 10;

    constructor(app: App) {
        this._view = app.editorView;
        this._app = app;

        this.bindEvents();
    }

    /**
     * Zoom in the editor. If the value is not passed, it will take the current level of zoom.
     *
     * @param value the of the zoom in pixel
     */
    public zoomIn(value?: number): void {

        // for the moment, do not allow zoom in/out while playing
        if (this._app.host.isPlaying) return;

        // if zoom button has been pressed, zoom out should be enabled
        this._app.hostView.zoomOutBtn.classList.remove("zoom-disabled");
        this._app.hostView.zoomOutBtn.classList.add("zoom-enabled");

        if (this._timeout) clearInterval(this._timeout);
        let ratio;
        if (value) { // Scroll - Linear zoom
            ratio = Math.max(RATIO_MILLS_BY_PX - (value) / 2, this.MIN_RATIO);
        } else { // Button pressed - Find nearest step and adjust to that step
            this._currentLevel = this.getNearestZoomLevel();
            let level = this._currentLevel;

            this._currentLevel = Math.max(this._currentLevel - 1, 0);

            if (this._currentLevel === 0) {
                // level is at max zoom value
                this._app.hostView.zoomInBtn.classList.remove("zoom-enabled");
                this._app.hostView.zoomInBtn.classList.add("zoom-disabled");
            }

            if (level === this._currentLevel) return;

            ratio = this.getZoomRatioByLevel(this._currentLevel);
        }
        //updateRatioMillsByPx(ratio);
        incrementZoomLevel();
        this.updateZoom();

        //this._view.stage.scale.x *= ZOOM_LEVEL;

    }

    /**
     * Zoom out the editor. If the value is not passed, it will take the current level of zoom.
     *
     * @param value the of the zoom in pixel
     */
    public zoomOut(value?: number): void {


        // for the moment, do not allow zoom in/out while playing
        if (this._app.host.isPlaying) return;

        // if zoom ouy button has been pressed, zoom in should be enabled
        this._app.hostView.zoomInBtn.classList.remove("zoom-disabled");
        this._app.hostView.zoomInBtn.classList.add("zoom-enabled");

        if (this._timeout) clearInterval(this._timeout);
        let ratio;
        if (value) { // Scroll - Linear zoom
            ratio = Math.min(RATIO_MILLS_BY_PX + (value) / 2, this.MAX_RATIO);
        } else { // Button pressed - Find nearest step and adjust to that step
            this._currentLevel = this.getNearestZoomLevel();
            let level = this._currentLevel;

            this._currentLevel = Math.min(this.ZOOM_STEPS - 1, this._currentLevel + 1);

            if (this._currentLevel === this.ZOOM_STEPS - 1) {
                this._app.hostView.zoomOutBtn.classList.remove("zoom-enabled");
                this._app.hostView.zoomOutBtn.classList.add("zoom-disabled");
            }

            if (level === this._currentLevel) return;

            ratio = this.getZoomRatioByLevel(this._currentLevel);
        }
        //updateRatioMillsByPx(ratio);
        decrementZoomLevel();
        this.updateZoom();
    }


    /**
     * Defines the drag and drop functionality for the editor.
     * It adds the dropped files to the track _view.
     */
    private bindEvents(): void {
        window.addEventListener("resize", () => {
            this._view.resizeCanvas();
        });
        window.addEventListener("wheel", (e) => {
            const currentTime = Date.now();
            if (currentTime - this._lastExecutedZoom < this.THROTTLE_TIME) return;

            this._lastExecutedZoom = currentTime;

            const isMac = navigator.platform.toUpperCase().includes('MAC');
            if (isMac && e.metaKey || !isMac && e.ctrlKey) {
                const zoomIn = e.deltaY > 0;
                if (zoomIn) this._app.editorController.zoomIn(e.deltaY);
                else this._app.editorController.zoomOut(e.deltaY * -1);
            }
            else {
                this._view.handleWheel(e);
            }
        });
        this._view.horizontalScrollbar.addEventListener("change", (e: ScrollEvent) => {
            this._view.handleHorizontalScroll(e);
        });
        this._view.verticalScrollbar.addEventListener("change", (e: ScrollEvent) => {
            this._view.handleVerticalScroll(e);
        });
        this._view.canvasContainer.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
        });
        window.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
        });
        this._view.canvasContainer.addEventListener('drop', (e: DragEvent) => {
            console.log("drag called !!!!")
            e.preventDefault();


            if (e.dataTransfer?.getData("audioFileURL")) {
                // LEt's fetch the audio file and create a new region (drag'n'drop from audio loop browser)
                let audioFileURL = e.dataTransfer?.getData("audioFileURL");
                this.importDraggedAudioLoop(audioFileURL, e.clientX, e.clientY);
            } else {
                // check if dragged data is one or several files (drag'n'drop from desktop)
                if (e.dataTransfer?.items) {

                    this.importDraggedFiles([...e.dataTransfer.items], e.clientX, e.clientY);
                }
            }


        })
        window.addEventListener('drop', (e) => {
            e.preventDefault();
        })
    }

    /**
     * Given the level, returns the ratio px / ms. The steps are logarithmic. More the level is high, more the steps are
     * large.
     *
     * @param level - The current level to determines the corresponding ratio.
     * @return the ratio of pixels by milliseconds.
     */
    private getZoomRatioByLevel(level: number): number {
        const range = Math.log(this.MAX_RATIO) - Math.log(this.MIN_RATIO);
        const step = range / (this.ZOOM_STEPS - 1);
        return Math.exp(Math.log(this.MIN_RATIO) + step * level);
    }

    /**
     * Updates the zoom according to the new size and the new ratio of pixels by milliseconds.
     * It first stretches the waveforms and sets a timeout for the renderer. If a new zoom is recorded before 
     * the timeout
     * has been called, it will cancel the current timeout to set a new one.
     */
    private async updateZoom(): Promise<void> {
        let offsetPlayhead = this._view.playhead.position.x;

        this._view.resizeCanvas();
        this._view.loop.updatePositionFromTime(...this._app.hostController.loopRange);
        this._app.automationController.updateBPFWidth();

        // let's scroll the viewport + recompute size and pos of the horizontal scrollbar
        let scrollValue = this._view.playhead.position.x - offsetPlayhead;
        this._view.horizontalScrollbar.customScrollTo(scrollValue);

        this._view.spanZoomLevel.innerHTML = ("x" + ZOOM_LEVEL.toFixed(2));

        this._app.tracksController.tracks.forEach(track => {
            // MB : this seems unecessary
            //track.updateBuffer(audioCtx, this._app.host.playhead);
            this._view.stretchRegions(track);
        });

        // MB: Center the viewport around the playhead if it is visible,
        // otherwise around the center of the viewport
        // get playhead x pos
        //const pos = this._view.playhead.position.x;
        //this._view.playhead.resize();
        //this._app.playheadController.centerViewportAround();


        this._timeout = setTimeout(() => {
            //console.log("Dans le timeout")
            // if playhead pos is more viewport width/2, center the viewport around the playhead, 
            // recenter the viewport 
            console.log("playhead pos = " + this._view.playhead.position.x + " width/2=" + this._view.width / 2);
            if (this._view.playhead.position.x > this._view.width / 2)
                this._app.playheadController.centerViewportAround();



            this._app.tracksController.tracks.forEach(track => {
                this._view.drawRegions(track);
            });
        }, 1000);
    }

    /**
     * @return the nearest zoom level depending on the current ratio of pixels by milliseconds.
     */
    private getNearestZoomLevel(): number {
        let nearestLevel = 0;
        let smallestDifference = Number.MAX_VALUE;

        for (let i = 0; i < this.ZOOM_STEPS; i++) {
            const ratioForLevel = this.getZoomRatioByLevel(i);
            const difference = Math.abs(RATIO_MILLS_BY_PX - ratioForLevel);

            if (difference < smallestDifference) {
                smallestDifference = difference;
                nearestLevel = i;
            }
        }
        return nearestLevel;
    }

    /**
     * Import files that has been dragged on the page.
     * 
     * @param file - Files that must be dragged
     * @param clientX - x pos of the drop
     * @param clientY - y pos of the drop
     */
    private async importDraggedFiles(_items: DataTransferItem[], clientX: number, clientY: number) {
        // /!\ The file have to be getted before the first "await" /!\
        // The DataTransferItem is emptied, once out of the event listener, if a listener of drop event
        // call this function, you have to get the files before the first await.
        const items= _items.map(f => ({type:f.type, file:f.getAsFile()}))

        // Get the track under the given position
        const target = await this.getTrackAt(clientX, clientY, true)
        if(!target)return

        // Then import the loaded files
        let success=false
        let needNewTrack=false
        for(const item of items){
            // If need a new track, create a new track
            if(needNewTrack){
                const tracks=this._app.tracksController.tracks
                let next_track=tracks.get(tracks.indexOf(target.track)+1)
                if(next_track==null){
                    next_track=await this._app.tracksController.createTrack()
                }
                target.track=next_track
                needNewTrack=false
            }
            // Import the file
            const result=await this.importFile(
                async () => {
                    const audioFile = item.file
                    if(!audioFile)return null
                    target.track.element.name=audioFile.name
                    return {buffer:await audioFile.arrayBuffer(), type: item.type}
                },
                target.track,
                target.start
            )
            // If the file has been successfully imported, update the start position of the next file
            // And set the success flag to true, so the track fetch is not cancelled
            if(result){
                success=true
                needNewTrack=true
            }
        }
        if(!success)target.cancel()
    }

    private showLoadingIcon(show: boolean): void {
        let loadingIcon = document.querySelector('#loading-icon') as HTMLElement;
        if (show) {
            if (!loadingIcon) {
                loadingIcon = document.createElement('div') as HTMLElement;
                loadingIcon.id = 'loading-icon';
                loadingIcon.style.position = 'fixed';
                loadingIcon.style.top = '0';
                loadingIcon.style.left = '0';
                loadingIcon.style.width = '100vw';
                loadingIcon.style.height = '100vh';
                loadingIcon.style.display = 'flex';
                loadingIcon.style.alignItems = 'center';
                loadingIcon.style.justifyContent = 'center';
                loadingIcon.style.zIndex = '9999';
                loadingIcon.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                loadingIcon.innerHTML = `
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only"></span>
                    </div>
                `;
                document.body.appendChild(loadingIcon);
            }
        } else {
            if (loadingIcon) loadingIcon.remove();
        }
    }



    private async importDraggedAudioLoop(url: string, clientX: number, clientY: number) {
        // Get the track under the given position
        const target = await this.getTrackAt(clientX, clientY, true)
        if(!target)return

        // Then import the loaded file 
        const result=await this.importFile(
            async () => {
                let file = await fetch(url,{mode:"cors"});
                return {buffer:await file.arrayBuffer(), type: file.headers.get("content-type")||""}
            },
            target.track,
            target.start
        )
        if(!result)target.cancel()
    }

    /**
     * Get the track at the given position (or create it if doCreate is true).
     * Return null if there is no track at the given position if doCreate is not set to true
     * or if the track can't be created at the given position.
     * @param clientX The x position
     * @param clientY The y position
     * @param doCreate If true, create a new track if no track is found at the given position
     * @returns The track at the given position and the position of the given position in the track as duration in milliseconds.
     * And a function you can call to cancel the creation of the track if a track has been created.
     */
    private async getTrackAt(clientX: number, clientY: number, doCreate=false): Promise<{start:number, track:Track, cancel:()=>void}|null>{
        let offsetLeft = this._view.canvasContainer.offsetLeft // offset x of the canvas
        let offsetTop = this._view.canvasContainer.offsetTop // offset y of the canvas

        if ((clientX >= offsetLeft && clientX <= offsetLeft + this._view.width) &&
            (clientY >= offsetTop && clientY <= offsetTop + this._view.height)) {

            // Get the start location
            const start = (this._app.editorView.viewport.left + (clientX - offsetLeft)) * RATIO_MILLS_BY_PX;

            // Check if the position is on an existing track
            let waveform = this._view.getWaveformAtPos(clientY - offsetTop);

            // Else create the track if asked to
            if (!waveform) {
                if(doCreate){
                    const track = await this._app.tracksController.createTrack();
                    track.element.name = "NEW TRACK"
                    return {start, track, cancel:()=>this._app.tracksController.removeTrack(track)}
                }
                else return null
            }
            else{
                const track = this._app.tracksController.getTrackById(waveform.trackId)!;
                if(track)return {start, track, cancel:()=>{}}
                else{
                    crashOnDebug("A track should be associated to this waveform")
                    return null
                }
            }
        }
        return null
    }

    /**
     * Import a file as a region in a track at a given position.
     * @param bufferLoader The function that loads the file, returning the file content as an arraybuffer and the file type
     * @param track The track to import the file in
     * @param start The start position of the loaded region
     */
    private async importFile(bufferLoader: ()=>Promise<{buffer:ArrayBuffer, type:string}|null>, track: Track, start: number): Promise<RegionOf<any>|null>{
        this.showLoadingIcon(true)
        track.element.progress();
        
        // Fetch the file
        const file = await bufferLoader()
        if(!file){
            this.showLoadingIcon(false)
            console.error("File could not be loaded")
            return null
        }

        // Get the array buff
        const {buffer,type} = file

        // Decode the audio file as a node
        let region: RegionOf<any>|null= null
        for(const loader of EditorController.DRAG_LOADERS){
            // Try each audio file loader until one can decode the file
            let loaded_region = await loader(start, buffer, type)
            if(loaded_region!==null){
                region=loaded_region
                this._app.regionsController.addRegion(track, loaded_region)
                break
            }
        }
        track.element.progressDone();
        this.showLoadingIcon(false)
        return region
    }

}