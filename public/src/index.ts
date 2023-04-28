import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import TrackElement from './Components/TrackElement';
// @ts-ignore
import BPF from './Components/BPF';
import LoadProjectElement from "./Components/Project/LoadProjectElement";
import SaveProjectElement from "./Components/Project/SaveProjectElement";

customElements.define(
    "track-element",
    TrackElement
);
customElements.define(
    "bpf-automation",
    BPF
);
customElements.define(
    "save-project-element",
    SaveProjectElement
);
customElements.define(
    "load-project-element",
    LoadProjectElement
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
