const template = document.createElement("template");
template.innerHTML = `
<style>
:host {
    
    width: 100%;
      height: 52px;
      padding: 1px;
      display: flex;
      flex-direction: column;
      font-family: Roboto;
      overflow: hidden;
      z-index: 1;
      position: relative;
      -webkit-font-smoothing: antialiased;  
      padding-right: 10px;
      border-right: solid 1px rgb(111, 111, 111);
      background-color:transparent;
}
.time-signature-section {
    border-color: rgba(255,255,255,0.05);
  }
  
  .time-signature-input {
    color: lightgrey;
      display: inline-block;
      border: none;
      background-color: transparent;
      padding: 0;
      border-radius: 0;
      font-family: "Unica One";
      font-size: 28px;
      height: 52px;
      line-height: 52px;
      width: 56px;
      text-align: right;
      margin-left:-5px;
  }
  
  .time-signature-input:focus {
    outline-width: 0;
 }

  .time-signature-label {
    color: lightgrey;
    font-family: "Roboto Condensed";
    font-size: 14px;
    margin: 0;
    padding: 0;
    border: 0;
  }
 
  
  #time-signature:invalid {
    color:red;
  }
</style>

<div id="container">
  <div class="time-signature-section">
    <input class="time-signature-input" value="4/4" id="time-signature" 
    pattern="^(2\/2|3\/2|2\/4|3\/4|4\/4|5\/4|7\/4|3\/8|5\/8|6\/8|7\/8|9\/8|12\/8|)$" maxlength=5> 
    <span class="time-signature-label">sig</span> 
  </div>
</div>
`;

export default class TimeSignatureSelectorElement extends HTMLElement {
  container?: HTMLDivElement;
  timeSignatureInput?: HTMLInputElement;

  timeSignature: string = "4/4";
  nbStepsPerBar: number = 4;
  nbStepsPerBeat: number = 4;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.shadowRoot !== null) {
      this.shadowRoot.innerHTML = template.innerHTML;

      this.defineListeners();
    }
  }

  setTimeSignature(newSignature: string) {
    this.timeSignature = newSignature;
    this.nbStepsPerBar = parseInt(this.timeSignature.split("/")[0]);
    this.nbStepsPerBeat = parseInt(this.timeSignature.split("/")[1]);
  }

  defineListeners() {

    this.container = this.shadowRoot!.querySelector("#container") as HTMLDivElement;
    this.container.onkeydown = (event: any) => {
      event.stopPropagation();
    }

    this.timeSignatureInput = this.shadowRoot!.querySelector(
      "#time-signature"
    ) as HTMLInputElement;

    this.timeSignatureInput.onchange = (event: any) => {
      console.log(event.target.validity);
      if (!event.target?.validity.valid) return;

      // value entered is valid, change properties
      this.timeSignature = event.target.value;
      this.nbStepsPerBar = parseInt(this.timeSignature.split("/")[0]);
      this.nbStepsPerBeat = parseInt(this.timeSignature.split("/")[1]);
      console.log("time signature changed to " + this.timeSignature);
      console.log("nbStepsPerBar=" + this.nbStepsPerBar);
      console.log("nbStepsPerBeat=" + this.nbStepsPerBeat);

      // propagate a custom event named "timeSignatureChanged"
      this.timeSignatureInput?.dispatchEvent(
        new CustomEvent("timeSignatureChanged", {
          detail: {
            signature: this.timeSignature,
            nbStepsPerBar: this.nbStepsPerBar,
            nbStepsPerBeat: this.nbStepsPerBeat,
          },
          composed: true,
        })
      );
    };
  }
}
