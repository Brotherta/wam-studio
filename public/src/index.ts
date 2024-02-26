import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import TrackElement from './Components/TrackElement';

import SaveProjectElement from "./Components/Project/SaveProjectElement";
import LoadProjectElement from "./Components/Project/LoadProjectElement";

import AdvancedElement from "./Components/Binds/AdvancedElement";
import BindSliderElement from "./Components/Binds/BindSliderElement";
import ParameterElement from "./Components/Binds/ParameterElement";
import TrackBindElement from "./Components/Binds/TrackBindElement";
import LoginElement from "./Components/Project/LoginElement";
import ConfirmElement from "./Components/ConfirmElement";
import ExportProjectElement from "./Components/Project/ExportProjectElement";

customElements.define(
    "track-element",
    TrackElement
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
    "advanced-element",
    AdvancedElement
);
customElements.define(
    "bind-slider-element",
    BindSliderElement
);
customElements.define(
    "parameter-element",
    ParameterElement
);
customElements.define(
    "track-bind-element",
    TrackBindElement
);
customElements.define(
    "confirm-element",
    ConfirmElement
);
customElements.define(
    "export-project-element",
    ExportProjectElement
);

const audioCtx = new AudioContext();
(window as any).audioCtx = audioCtx;

// TODO tzfeng - commented out because it's annoying
// window.addEventListener('beforeunload', (e) => {
//     e.returnValue = 'test';
// });

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
})();

export { app, audioCtx };