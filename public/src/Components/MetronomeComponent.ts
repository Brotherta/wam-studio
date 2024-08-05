import { BACKEND_URL } from "../Env";
import { doc } from "../Utils/dom";
import { observed as observe } from "../Utils/observable/class_annotation";

const template=doc/*html*/`
    <style>
        :host {
            background: #413e3e;

            color:white;
            font-family: Arial, sans-serif;
            font-size: 10px;
            padding: 20px;
            
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            position: absolute;
            top: 20%;
            left: 47%;
            transform: translate(-50%, -10%);
            z-index: 1000;
        }
        h2 {
            margin-top: 0;
        }
        input[type="number"], select {
            padding: 8px;
            margin-top: 5px;
            border-radius: 5px;
            border: 1px solid #ccc;
        }
    </style>
    <h2>Metronome Settings</h2>
    <!-- Measures Section -->
    <label for="precount">Precount:</label>
    <select id="precount">
        <option value="0" selected>0 measures</option>
        <option value="1">1 measure</option>
        <option value="2">2 measures</option>
    </select>
`

export default class MetronomeComponent extends HTMLElement {
    private click1: HTMLAudioElement;
    private click2: HTMLAudioElement;
    URL_SERVER: string;
    playBtn: HTMLDivElement;


    get precountSelector(){ return this.shadowRoot!.querySelector('#precount') as HTMLSelectElement }


    constructor() {
        super();
        this.URL_SERVER = BACKEND_URL;
        this.click1 = new Audio(`${this.URL_SERVER}/AudioMetro/metroBig.wav`);
        this.click1.crossOrigin="anonymous"
        this.click2 = new Audio(`${this.URL_SERVER}/AudioMetro/metroSmall.wav`);
        this.click2.crossOrigin="anonymous"
        this.attachShadow({ mode: 'open' });
        this.shadowRoot?.replaceChildren(template.cloneNode(true))
    }

    connectedCallback() {
        const precountSelect = this.shadowRoot?.querySelector('#precount') as HTMLSelectElement;

        precountSelect?.addEventListener('change', () => {
            this.precount = parseInt(precountSelect.value);
        });
    }

    /** The tempo of the metronome in BPM */
    @observe.set(MetronomeComponent.prototype.updateInterval)
    public tempo= 120

    /** The time signature of the metronome, with [x,y] being x/y */
    @observe.set(MetronomeComponent.prototype.updateInterval)
    public timeSignature: [number,number]= [4,4]

    /** Start the metronome with the given time position in ms */
    start(start: number){
        this.isStarted= true
        this.playhead= start
    }

    /** Stop the metronome */
    stop(){
        this.isStarted= false
        this.updateInterval()
    }

    private isStarted= false


    /** Set the current time position of the metronome in ms. */
    set playhead(position: number){
        this._playhead= position
        this.updateInterval()
    }
    private _playhead=0

    /** Set the precount of the metronome */
    set precount(precount: number){
        precount=Math.max(0, Math.min(precount, 2))
        if(this._precount!==precount) this.precountSelector.value= precount.toString()
        this._precount= precount
    }

    get precount(){ return this._precount }

    private _precount= 0

    /** Stop the previous interval handler, and create a new using the current timeSignature, playhead, and tempo */
    private updateInterval(): void {
        // TODO Change selon si l'affichage actuel de la grille est valide ou non

        // Stop the previous interval handler
        if(this.timeout) clearTimeout(this.timeout)
        if(this.interval) clearInterval(this.interval)
        this.timeout= undefined
        this.interval= undefined

        if(this.isStarted){
            // Start the next interval handler
            const interval= 60_000/this.tempo/(this.timeSignature[1]/4)
            console.log(this.tempo, this.timeSignature, interval)
            const byMeasure= this.timeSignature[0]


            let currentTick=Math.ceil(this._playhead/interval)
            console.log("currentTick",currentTick)
            
            const beep= ()=>{
                const audioToPlay = (currentTick % byMeasure === 0) ? this.click1 : this.click2
                audioToPlay.play()
                currentTick++
            }

            this.timeout= setTimeout(()=>{
                beep()
                this.interval = window.setInterval(beep, interval)
            }, currentTick*interval-this._playhead)
        }
    }

    private timeout?: any
    private interval?: any
}

window.customElements.define('wamstudio-metronome', MetronomeComponent);