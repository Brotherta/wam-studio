import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import TrackElement from './Components/TrackElement';

customElements.define(
    "track-element",
    TrackElement
);

const audioCtx = new AudioContext();
audioCtx.suspend();
const app = new App();

(async () => {
    await app.initHost();
})();

export { app, audioCtx };