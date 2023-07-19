import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import TrackElement from './Components/TrackElement';

// @ts-ignore
import BPF from './Components/BPF';

import SaveProjectElement from "./Components/Project/SaveProjectElement";
import LoadProjectElement from "./Components/Project/LoadProjectElement";

import AdvancedElement from "./Components/Binds/AdvancedElement";
import BindSliderElement from "./Components/Binds/BindSliderElement";
import ParameterElement from "./Components/Binds/ParameterElement";
import TrackBindElement from "./Components/Binds/TrackBindElement";
import LoginElement from "./Components/Project/LoginElement";
import ConfirmElement from "./Components/ConfirmElement";
import PlaceholderElement from "./Components/PlaceholderElement";

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
    "placeholder-element",
    PlaceholderElement
);

const audioCtx = new AudioContext();

window.addEventListener('beforeunload', (e) => {
    e.returnValue = 'test';
});

const app = new App();
(async () => {
    await app.initHost();
})();

export { app, audioCtx };