import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import BPF from './Utils/BPF';
import TrackElement from './Components/TrackElement';
import ControlElement from "./Components/ControlElement";
import AdvancedElement from "./Components/AdvancedElement";
import TrackElement from './Components/TrackElement';
// @ts-ignore
import BPF from './Components/BPF';

customElements.define(
    "track-element",
    TrackElement
);
customElements.define(
    "control-element",
    ControlElement
);
customElements.define(
    "advanced-element",
    AdvancedElement
)
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