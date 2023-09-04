
/**
 * Class to make a window draggable. 
 * It allows to drag the window by clicking on the header.
 */
export default class DraggableWindow {

    isDragging = false;
    currentX: number;
    currentY: number;
    initialX: number;
    initialY: number;
    xOffset = 0;
    yOffset = 0;

    header: HTMLElement;
    resizableWindow: HTMLElement;

    constructor(header: HTMLElement, resizableWindow: HTMLElement) {
        this.header = header;
        this.resizableWindow = resizableWindow;
        this.header.addEventListener("mousedown", this.dragStart);
        this.header.addEventListener("mouseup", this.dragEnd);
        window.addEventListener("mousemove", this.drag);
    }

    dragStart = (e: { clientX: number; clientY: number; }) => {
        this.initialX = e.clientX - this.xOffset;
        this.initialY = e.clientY - this.yOffset;

        this.isDragging = true;
    }

    dragEnd = () => {
        this.initialX = this.currentX;
        this.initialY = this.currentY;

        this.isDragging = false;
    }

    drag = (e: { preventDefault: () => void; clientX: number; clientY: number; }) => {
        if (this.isDragging) {
            e.preventDefault();
            this.currentX = e.clientX - this.initialX;
            this.currentY = e.clientY - this.initialY;

            this.xOffset = this.currentX;
            this.yOffset = this.currentY;

            this.setTranslate(this.currentX, this.currentY, this.resizableWindow);
        }
    }

    setTranslate = (xPos: string | number, yPos: string | number, el: HTMLElement | null) => {
        // @ts-ignore
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
}
