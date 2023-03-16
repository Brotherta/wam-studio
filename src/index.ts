import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import TrackElement from './Components/TrackElement';
import TrackControlElement from "./Components/TrackControlElement";
import AdvancedControlElement from "./Components/AdvancedControlElement";
// @ts-ignore
import BPF from './Components/BPF';
import BindParameterElement from "./Components/BindParameterElement";
import TrackBindControlElement from "./Components/TrackBindControlElement";

customElements.define(
    "track-element",
    TrackElement
);
customElements.define(
    "control-element",
    TrackControlElement
);
customElements.define(
    "advanced-element",
    AdvancedControlElement
)
customElements.define(
    "bpf-automation",
    BPF
);
customElements.define(
    "bind-parameter-element",
    BindParameterElement
);
customElements.define(
    "track-bind-control-element",
    TrackBindControlElement
)

const audioCtx = new AudioContext();
audioCtx.suspend();
const app = new App();
(async () => {
    await app.initHost();
})();

export { app, audioCtx };