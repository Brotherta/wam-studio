import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import TrackElement from './Components/TrackElement';
// @ts-ignore
import BPF from './Utils/BPF';

customElements.define(
    "track-element",
    TrackElement
);
customElements.define(
    "bpf-automation",
    BPF
);

const audioCtx = new AudioContext();
audioCtx.suspend();
const app = new App();

(async () => {
    await app.initHost();
})();

export { app, audioCtx };