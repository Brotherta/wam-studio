import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import TrackElement from './Components/TrackElement';
// @ts-ignore
import BPF from './Components/BPF';
import SaveProjectElement from "./Components/Project/SaveProjectElement";
import LoadProjectElement from "./Components/Project/LoadProjectElement";
import LoginElement from "./Components/Project/LoginElement";
import PlaceholderElement from "./Components/Utils/PlaceholderElement";
import ConfirmElement from "./Components/Utils/ConfirmElement";
import DialogElement from "./Components/Utils/DialogElement";
import ScrollBarElement from "./Components/ScrollBarElement";

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
customElements.define(
    "login-element",
    LoginElement
);
customElements.define(
    "confirm-element",
    ConfirmElement
);
customElements.define(
    "dialog-element",
    DialogElement
);
customElements.define(
    "placeholder-element",
    PlaceholderElement
);
customElements.define(
    "scrollbar-element",
    ScrollBarElement
);

window.addEventListener('beforeunload', (e) => {
    e.returnValue = 'test';
});

const audioCtx = new AudioContext({latencyHint: 0.00001});
const app = new App();

(async () => {
    const showLoading = () => {
        // Find the loading overlay and display it
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            (loadingOverlay as HTMLElement).style.display = 'flex';
            document.body.classList.add('loading'); // This class is added to blur the content behind the overlay
        }
    }

    const hideLoading = () => {
        // Find the loading overlay and hide it
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            (loadingOverlay as HTMLElement).style.display = 'none';
            document.body.classList.remove('loading'); // Remove the class to un-blur the content
        }
    }

    showLoading();
    await app.initHost();
    hideLoading();
    let interval: NodeJS.Timer;

    interval = setInterval(() => {
        audioCtx.resume().then((_onfulfilled) => {
            clearInterval(interval);
        });
    }, 100);


})();



export {app, audioCtx};
