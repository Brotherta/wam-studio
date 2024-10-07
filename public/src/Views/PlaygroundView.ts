import { adoc } from "../Utils/dom";
import DraggableWindow from "../Utils/DraggableWindow";
import { RangeSet } from "../Utils/RangeSet";

/**
 * View for the about window. It contains all the elements of the about window.
 */
export default class PlaygroundWindow extends DraggableWindow {

    constructor() {
        super(document.getElementById("playground-header") as HTMLDivElement, document.getElementById("playground-window") as HTMLDivElement);
        this.playground(this.resizableWindow, this.resizableWindow.hidden)
    }

    private playground(element: HTMLElement, shown: boolean){
        element.style.display="flex"
        element.style.flexDirection="column"

        // Graphics
        const canvas= adoc/*html*/`<canvas width=800 height=400></canvas>` as HTMLCanvasElement
        const graphics= canvas.getContext("2d")!

        // Inputs
        const min=adoc/*html*/`<input placeholder="min" value=0 type=number/>` as HTMLInputElement
        const size=adoc/*html*/`<input placeholder="size" value=100 type=number/>` as HTMLInputElement
        const add=adoc/*html*/`<button>add</button>`
        const remove=adoc/*html*/`<button>remove</button>`

        element.append(canvas, min, size, add, remove)


        // Ranges
        const ranges= new RangeSet(0,800)

        function redraw(){
            graphics.fillStyle= `white`
            graphics.fillRect(0,0,800,400)

            ranges.for_range(([min,max])=>{
                console.log(min,max)
                graphics.fillStyle= `hsla(${Math.floor(Math.random()*360)} 100 50 / 0.3)`
                graphics.fillRect(min,0, max-min, 400)
            })
        }
        
        redraw()
        add.onclick= ()=>{
            const min_value= Number.parseInt(min.value)
            const max_value= min_value+Number.parseInt(size.value)
            ranges.add(min_value,max_value)
            redraw()
        }
        remove.onclick= ()=>{
            const min_value= Number.parseInt(min.value)
            const max_value= min_value+Number.parseInt(size.value)
            ranges.remove(min_value,max_value)
            redraw()
        }
    }

}