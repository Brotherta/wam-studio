import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import TrackElement from './Views/Components/TrackElement';
import ControlElement from "./Views/Components/ControlElement";
import AdvancedElement from "./Views/Components/AdvancedElement";

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

const audioCtx = new AudioContext();
audioCtx.suspend();
const app = new App();

(async () => {
    await app.initHost();
})();

export { app, audioCtx };