import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import TrackElement from './Views/Components/TrackElement';
import ControlElement from "./Views/Components/ControlElement";

customElements.define(
    "track-element",
    TrackElement
);
customElements.define(
    "control-element",
    ControlElement
);

const audioCtx = new AudioContext();
audioCtx.suspend();
const app = new App();

(async () => {
    await app.initHost();
})();

export { app, audioCtx };