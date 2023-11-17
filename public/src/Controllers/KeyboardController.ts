import App from "../App";

/**
 * The class that control the events related to the keyboard.
 */
export default class KeyboardController {

    /**
     * Route Application.
     */
    private _app: App;

    constructor(app: App) {
        this._app = app;

        this.bindEvents();
    }

    /**
     * Bind on initialisation the events related to the keyboard : keypress, keydown, keyup and so on...
     * @private
     */
    private bindEvents() {
        window.addEventListener("keypress", (e) => {
            // If the user is typing in an input, we don't want to trigger the keyboard shortcuts
            if(e.target != document.body) return;

            switch (e.key) {
                case " ": // Space bar pressed : play/pause
                    this._app.hostController.play();
                    break;
                default:
                    break;
            }
        });
    }

}