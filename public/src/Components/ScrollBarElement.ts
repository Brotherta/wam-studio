const template = document.createElement("template");
template.innerHTML = `
<style>
:host {
  display: block;
  position: relative;
  height: 100%;
  width: 100%;
  background-color: #333;
}

#track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #333; /* Changed color to a lighter gray */
  margin: 1px;
  padding: 1px;
}

#handle {
  position: absolute;
  background-color: #666; /* Changed color to a darker gray */
  border-radius: 10px; /* Add rounded corners */
  width: 8px; /* If the scrollbar is vertical */
  height: 8px; /* If the scrollbar is horizontal */
  transition: background-color 0.2s ease-in-out;
}

#handle:hover {
    background-color: #888; /* Add a dark-grey color on hover */
}

</style>

<div id="track">
    <div id="handle"></div>
</div>
`;

/**
 * Custom scrollbar element that can be used to scroll a viewport. It is designed to be used with
 * pixi-viewport, but can be used with any viewport that has a center property and a moveCenter method.
 *
 * @author Antoine Vidal-Mazuy
 */
export default class ScrollBarElement extends HTMLElement {
  public readonly SCROLL_THICKNESS: number = 12;
  private readonly MIN_HANDLE_SIZE: number = 5;

  private isDragging: boolean = false; // Is the scrollbar being dragged
  private dragStart: number = 0; // Where did the drag start
  private startValue: number = 0; // What was the value when the drag started
  private size: number = 0; // The size of the viewport
  private worldSize: number = 0; // The size of the world
  private value: number = 0; // The current value of the scrollbar
  private orientation: string = "vertical"; // The orientation of the scrollbar
  private handlePos: number = 0; // The position of the handle

  private animationFrameId: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    if (this.shadowRoot !== null) {
      if (!this.hasAttribute("orientation")) {
        throw new Error("CustomScrollbar must have orientation attribute");
      }

      this.orientation = this.getAttribute("orientation")!;
      this.size = 0;
      this.worldSize = 0;
      this.value = 0;
      if (this.orientation === "horizontal") {
        this.style.height = `${this.SCROLL_THICKNESS}px`;
      } else {
        this.style.width = `${this.SCROLL_THICKNESS}px`;
      }

      this.bindEvents();
      this.updateHandleSize();
      this.updateHandlePosition("connectedCallback");
    }
  }

  /**
   * Update the size of the handle based on the size of the viewport and the size of the world
   * It will update the size of the handle based on the ratio of the viewport size to the world size
   * and the size of the track.
   * @param size the new size of the viewport
   * @param worldSize the new size of the world
   */
  resize(size: number, worldSize: number) {
    this.size = size;
    this.worldSize = worldSize;

    this.value = Math.max(0, Math.min(this.value, this.worldSize - this.size));
    this.updateHandleSize();
    this.updateHandlePosition("resize");
  }

  /**
   * Scroll the handle. If positive is true, scroll down/right, otherwise scroll up/left
   * The sensitivity is a constant that determines how much the handle moves
   * @param positive true/false : up/down or left/right
   */
  customScrollTo(scroll: number) {
    const newValue = Math.max(
      0,
      Math.min(this.value + scroll, this.worldSize - this.size)
    );
    const startValue = this.value;
    const changeInValue = newValue - startValue;
    const duration = 50; // Duration of the animation in milliseconds
    const startTime = performance.now();

    // If an animation is already running, cancel it
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
    }

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      if (timeElapsed < duration) {
        // Use linear interpolation to calculate the current value
        this.value = startValue + changeInValue * (timeElapsed / duration);
        this.updateHandlePosition("customScrollTo animation");
        this.animationFrameId = window.requestAnimationFrame(animateScroll);
      } else {
        // Ensure the final value is correct
        this.value = newValue;
        this.updateHandlePosition("customScrollTo animation finished");
        this.animationFrameId = null; // Reset the animation frame ID when the animation finishes
      }
    };

    this.animationFrameId = window.requestAnimationFrame(animateScroll);
  }

  customScrollTop(top: number) {
    let newValue = Math.max(0, Math.min(top, this.worldSize - this.size));
    this.value = newValue;
    this.updateHandlePosition("propagate off");
  }

  /**
   * Bind the events to the scrollbar
   * - Handle dragging
   * - Handle clicking on the track
   */
  bindEvents() {
    const track = this.shadowRoot!.querySelector("#track") as HTMLElement;
    const handle = this.shadowRoot!.querySelector("#handle") as HTMLElement;

    handle.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.dragStart = this.orientation === "vertical" ? e.clientY : e.clientX;
      this.startValue = this.value;
      e.preventDefault();
    });

    track.addEventListener("mousedown", (e) => {
      if(this.orientation === "horizontal") {
        // 200 = width of the left track panel
        let clickPos = e.clientX - 200;
        //console.log("Click on scrollbar track x = " + clickPos + " handle x pos = " 
        //+ this.handlePos + " worldSize = " + this.worldSize + " trackSize = " + track.offsetWidth);

        this.customScrollTo(clickPos - this.handlePos);
      } else {
        // 60 is the height of the top panel
        let clickPos = e.clientY -60;
        //console.log("Click on scrollbar track y = " + clickPos + " handle y pos = " 
        //+ this.handlePos + " trackSize = " + track.offsetHeight);
        this.customScrollTo(clickPos - this.handlePos);
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;

      let delta =
        this.orientation === "vertical"
          ? e.clientY - this.dragStart
          : e.clientX - this.dragStart;
      let trackSize =
        this.orientation === "vertical"
          ? track.offsetHeight
          : track.offsetWidth;
      let handleSize =
        this.orientation === "vertical"
          ? handle.offsetHeight
          : handle.offsetWidth;

      // Translate delta pixel of the client movement into value change depending on the world size
      let valueChange =
        (delta / (trackSize - handleSize)) * (this.worldSize - this.size);

      if (isNaN(valueChange)) return; // If the handle is the same size as the track, don't do anything
      this.value = Math.max(
        0,
        Math.min(this.startValue + valueChange, this.worldSize - this.size)
      );
      this.updateHandlePosition("dragging");
    });

    document.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
  }

  /**
   * Update the size of the handle depending on the size of the viewport and the size of the world
   */
  updateHandleSize() {
    const handle = this.shadowRoot!.querySelector("#handle") as HTMLElement;
    let handleSize = (this.size / this.worldSize) * 100;
    handleSize = Math.max(handleSize, this.MIN_HANDLE_SIZE);
    if (this.worldSize <= this.size) {
      this.worldSize = this.size;
      handleSize = 0;
    }
    if (this.orientation === "vertical") {
      handle.style.height = `${handleSize}%`;
    } else {
      handle.style.width = `${handleSize}%`;
    }
  }

  /**
   * When we click on the host button to go back to the beginning of tracks
   * we need to update the handle position.
   */
  moveToBeginning() {
    this.value = 0;
    // MB: not sure about the param we need to pass there...
    this.updateHandlePosition("moveToBeginning");
  }

  /* update horizontal scrollbar pos without dispatching events */
  moveTo(value: number) {
    const track = this.shadowRoot!.querySelector("#track") as HTMLElement;
    const handle = this.shadowRoot!.querySelector("#handle") as HTMLElement;
    let handleSize = handle.offsetWidth;

    // value is the viewport center position
    this.value = value;


    let trackSize = track.offsetWidth;

    // translate value into pixel position
    this.handlePos =
      (this.value / (this.worldSize - this.size)) * (trackSize - handleSize);

    handle.style.left = `${this.handlePos}px`;
  }

  /**
   * Update the position of the handle based on the current value
   */
  updateHandlePosition(type = "default") {
    const handle = this.shadowRoot!.querySelector("#handle") as HTMLElement;
    const track = this.shadowRoot!.querySelector("#track") as HTMLElement;
    let trackSize =
      this.orientation === "vertical" ? track.offsetHeight : track.offsetWidth;
    let handleSize =
      this.orientation === "vertical"
        ? handle.offsetHeight
        : handle.offsetWidth;

    let oldHandlePos = this.handlePos;

    // if the size of the world is the same as the size of the viewport, then the handle should be at the top
    if (this.size === this.worldSize) {
      this.handlePos = 0;
    } else {
      // translate value into pixel position
      this.handlePos =
        (this.value / (this.worldSize - this.size)) * (trackSize - handleSize);
    }

    if (this.orientation === "vertical") {
      // Update the handle position only if it has changed
      if (oldHandlePos !== this.handlePos) {
        handle.style.top = `${this.handlePos}px`;
      }
    } else {
      if (oldHandlePos !== this.handlePos) {
        handle.style.left = `${this.handlePos}px`;
      }
    }

    this.dispatchEvent(
      console.log("SCROLLBAR ELEMENT dispatch event;
      new CustomEvent("change", {
        detail: { value: this.handlePos, type: type },
        bubbles: true, // Allows the event to bubble up through the shadow DOM boundary
        composed: true, // Allows the event to propagate across the shadow DOM boundary
      })
    );
  }
}
