import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import TrackElement from './Components/TrackElement';
// @ts-ignore
import BPF from './Components/BPF';

customElements.define(
    "track-element",
    TrackElement
);
customElements.define(
    "bpf-automation",
    BPF
);
const audioCtx = new AudioContext();
const app = new App();

setTimeout(() => {

    // @ts-ignore
    console.info("Audio Context Output Latency = " + audioCtx.outputLatency + " ms");
    audioCtx.suspend().then(async () => {
        await app.initHost();
    });
}, 1000);

export { app, audioCtx };