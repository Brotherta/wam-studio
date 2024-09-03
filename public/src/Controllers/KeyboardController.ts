import App from "../App";
import { registerOnKeyUp } from "../Utils/keys";

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
        registerOnKeyUp((key)=>{
            switch (key) {
                case " ": // Space bar pressed : play/pause
                    this._app.hostController.onPlayButton()
                    break
            }
        })
    }

}