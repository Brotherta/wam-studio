import App from "../App";
import SettingsView from "../Views/SettingsView";
import HostView from "../Views/HostView";


export default class SettingsController {

    app: App;
    settingsView: SettingsView;
    hostView: HostView;

    constructor(app: App) {
        this.app = app;
        this.settingsView = app.settingsView;
        this.hostView = app.hostView;
        this.defineListeners();
    }

    defineListeners() {
        this.settingsView.latencyInput.addEventListener("change", () => {
            if (+this.settingsView.latencyInput.value < 0)
                this.settingsView.latencyInput.value = "0";
            else if (+this.settingsView.latencyInput.value > 1000)
                this.settingsView.latencyInput.value = "1000";
            this.app.host.latency = Number(this.settingsView.latencyInput.value);
        });
        this.settingsView.closeWindowButton.addEventListener("click", () => {
           this.settingsView.closeWindow();
        });
        this.hostView.settingsBtn.addEventListener("click", () => {
            this.settingsView.openWindow();
        });
    }
}