import { BACKEND_URL } from "../Env";

export default class MetronomeComponent extends HTMLElement {
    private isPlaying: boolean = false;
    private bpm: number = 120;
    private beatsPerMeasure: number = 4;
    private noteValue: number = 4; // This will be 4 for quarter notes
    private resolution: number = 4; // Default to quarter notes (4), changeable to 8 for eighth notes
    private precount: number = 1;
    private currentBeat: number = 0;
    private currentMeasure: number = 0;
    private audioContext: AudioContext;
    private click1: HTMLAudioElement;
    private click2: HTMLAudioElement;
    private metronomeInterval: number | undefined;
    private tempoSelector: HTMLElement;
    private timeSignatureSelector: HTMLElement;
    private recordBtn: HTMLDivElement;
    private metroBtn: HTMLDivElement;
    override shadowRoot: ShadowRoot;
    URL_SERVER: string;
    playBtn: HTMLDivElement;
    metroBtnArrow: HTMLDivElement;

    constructor(tempoSelector: HTMLElement, timeSignatureSelector: HTMLElement) {
        super();
        this.audioContext = new window.AudioContext();
        this.URL_SERVER = BACKEND_URL;
        this.click1 = new Audio(`${this.URL_SERVER}/AudioMetro/metroBig.wav`);
        this.click2 = new Audio(`${this.URL_SERVER}/AudioMetro/metroSmall.wav`);
        this.initDOMElements();
        this.tempoSelector = tempoSelector;
        this.timeSignatureSelector = timeSignatureSelector;
        this.playBtn = document.getElementById("play-btn") as HTMLDivElement;
        this.recordBtn = document.getElementById("record-btn") as HTMLDivElement;
        this.metroBtn = document.getElementById("metro-btn") as HTMLDivElement;
        this.metroBtnArrow = document.getElementById("metro-btn-arrow") as HTMLDivElement;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .metronome-container {
                    font-family: Arial, sans-serif;
                    font-size: 10px;
                    padding: 20px;
                    background: #f0f0f0;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: absolute;
                    top: 10%;
                    left: 47%;
                    transform: translate(-50%, -10%);
                    z-index: 1000;
                }
                h2 {
                    margin-top: 0;
                    color: #333;
                }
                input[type="number"], select {
                    padding: 8px;
                    margin-top: 5px;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                }
            </style>

            <div class="metronome-container" style="display: none;">
                <h2>Metronome Settings</h2>
                <!-- Resolution Section -->
                <label for="resolution">Resolution:</label>
                <select id="resolution">
                    <option value="4" selected>4th</option>
                    <option value="8">8th</option>
                    <option value="16">16th</option>
                </select>

                <!-- Measures Section -->
                <label for="precount">Precount:</label>
                <select id="precount">
                    <option value="0">0 measures</option>
                    <option value="1">1 measure</option>
                    <option value="2" selected>2 measures</option>
                </select>
            </div>
        `;
    }

    connectedCallback() {
        this.initDOMElements();

        // listening to tempo updates
        this.tempoSelector.addEventListener('tempochanged', (event: any) => {
            // sent by the tempoSelector Web Component (custom event has its data in event.detail)
            const newTempo = event.detail.tempo;
            this.setBPM(newTempo);
        });

        // Listening to time signature updates
        this.timeSignatureSelector.addEventListener('timeSignatureChanged', (event: any) => {
            const newNumerator = event.detail.nbStepsPerBar.toString();
            const newDenominator = event.detail.nbStepsPerBeat.toString();
            this.updateTimeSignature(newNumerator, newDenominator);
        });

        this.metroBtnArrow.addEventListener('click', () => {
            const metronomeContainer = this.shadowRoot?.querySelector('.metronome-container') as HTMLDivElement;
            metronomeContainer.style.display = metronomeContainer.style.display === 'none' ? 'flex' : 'none';
        });

    }

    initDOMElements() {
        const resolutionSelect = this.shadowRoot?.querySelector('#resolution') as HTMLSelectElement;
        resolutionSelect?.addEventListener('change', () => this.setResolution(parseInt(resolutionSelect.value)));

        const precountSelect = this.shadowRoot?.querySelector('#precount') as HTMLSelectElement;
        precountSelect?.addEventListener('change', () => this.setPrecount(parseInt(precountSelect.value)));

    }

    //stop the metronome
    public stopMetronome(): void {
        this.isPlaying = false;
        this.pauseMetronome();
        this.currentBeat = 0;
        this.currentMeasure = 0;
    }


    private setBPM(bpm: string): void {
        this.bpm = parseInt(bpm, 10);
        console.log(`BPM updated to ${this.bpm}`);
        if (this.isPlaying) {
            this.updateInterval();
        }
    }

    // updateTimeSignature needs parameters to work with the new values
    private updateTimeSignature(numerator: string, denominator: string): void {
        this.beatsPerMeasure = parseInt(numerator, 10);
        this.noteValue = parseInt(denominator, 10);
        console.log(`Updated internal time signature to ${numerator}/${denominator}`);
        if (this.isPlaying) {
            this.updateInterval();
        }
    }

    private setResolution(newResolution: number): void {
        this.resolution = newResolution;
        if (this.isPlaying) {
            this.updateInterval();
        }else{
            return;
        }
    }

    private setPrecount(count: number): void {
        this.precount = count;
    }

    private updateInterval(): void {
        clearInterval(this.metronomeInterval);
        const interval = (60 / this.bpm) * 1000 * (this.noteValue / this.resolution);
        this.playClick();
        this.metronomeInterval = window.setInterval(() => this.playClick(), interval);
    }

    // public PlayPauseMetro(): void {
    //     this.isPlaying = !this.isPlaying;
    //     if (this.isPlaying) {
    //         if (!this.metronomeInterval) {  // Start the metronome if not already running
    //             this.updateInterval();
    //         }
    //     } else {
    //         this.pauseMetronome();  // Pause the metronome, but do not reset
    //     }
    // }
    

    public startMetronome(): void {
        this.isPlaying = true;
        if (!this.metronomeInterval) {
            this.updateInterval();
        }
    }

    public pauseMetronome(): void {
        clearInterval(this.metronomeInterval);
        this.metronomeInterval = undefined;
    }

    private playClick(): void {
        console.log('playing click, currentBeat:', this.currentBeat, 'currentMeasure:', this.currentMeasure)
        const audioToPlay = (this.currentBeat % this.beatsPerMeasure === 0) ? this.click1 : this.click2;
        audioToPlay.currentTime = 0;
        audioToPlay.play();

        this.currentBeat++;
        if (this.currentBeat >= (this.beatsPerMeasure * this.resolution / this.noteValue)) {
            this.currentBeat = 0;
            this.currentMeasure++;
        }

        // Continuous loop, do not stop
        if (this.currentMeasure >= this.precount) {
            this.currentMeasure = 0;  // Reset measure count to continue looping
        }
    }

}

window.customElements.define('metronome-component', MetronomeComponent);