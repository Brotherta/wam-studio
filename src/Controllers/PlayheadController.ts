import App from "../App";


export default class PlayheadController {

    app: App

    constructor(app: App) {
        this.app = app;

        this.app.canvasView.playheadRange.value = "0";
        this.defineControllers();
    }

    defineControllers() {
        this.app.canvasView.playheadRange.oninput = () => {
            this.app.canvasView.movePlayheadLine(
                parseInt(this.app.canvasView.playheadRange.value)
            );
            this.app.audios.jumpTo(parseInt(this.app.canvasView.playheadRange.value)); 
        };

        this.app.canvasView.playheadRange.onmousedown = () {
            
        }

        // this.app.canvasView.playheadRange.onchange = (ev) => {
                      
        //     this.app.audios.jumpTo(parseInt(this.app.canvasView.playheadRange.value)); 
        // }
    }
}