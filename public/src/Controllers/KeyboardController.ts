import App from "../App";


export default class KeyboardController {

    app: App;

    constructor(app: App) {
        this.app = app;

        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener("keypress", (e) => {
            switch (e.key) {
                case " ":
                    this.app.hostController.clickOnPlayButton();
                    break;
                default:
                    break;
            }
        });
    }

}