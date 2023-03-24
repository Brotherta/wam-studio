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
const audioCtx = new AudioContext({latencyHint: 0.00001});
const app = new App();

(async () => {
    await app.initHost();
    let interval: NodeJS.Timer;

    interval = setInterval(() => {
        audioCtx.resume().then((_onfulfilled) => {
            clearInterval(interval);
        });
    }, 100);
})();

export {app, audioCtx};