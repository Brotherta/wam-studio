import { doc } from "../Utils/dom";

const template = doc/*html*/`
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
    #input {
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
      &:focus {
        outline: none;
        border: none;
        font-style: italic;
      }
      &:hover{
        font-weight: bold;
      }
    }
    #label {
      color: lightgrey;
      font-family: Arial;
      font-size: 14px;
      margin: 0;
      padding: 0;
      border: 0;
    }
    :host:invalid {
      color:red;
    }
  </style>
  <div class="time-signature-section">
    <input id="input" value="4/4" id="time-signature" pattern="^([1-9][0-9]*/[1-9][0-9]*)$" maxlength=5> 
    <span id="label">sig</span> 
  </div>
`;

/**
 * A custom element that allows the user to select a time signature.
 */
export default class TimeSignatureElement extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.shadowRoot !== null) {
      this.shadowRoot.replaceChildren(template)
      this.defineListeners();
    }
  }

  get input(){ return this.shadowRoot!.querySelector("#input") as HTMLInputElement }

  /**
   * The time signature as a array. 
   * Per example: 4/4 is [4,4], 8/4 is [8,4]
   */
  get timeSignature(): [number,number] {
    const splitted= this.input.value.split("/")
    try{
      return [parseInt(splitted[0]), parseInt(splitted[1])]
    }catch(e){
      return [1,1]
    }
  }

  set timeSignature(value: [number,number]) {
    this.input.value = Math.max(1,value[0]) + "/" + Math.max(1,value[1])
  }


  private defineListeners() {
    this.input.addEventListener("change", (event)=> this.on_change.forEach(f=>f(this.timeSignature)))
  }

  readonly on_change= new Set<(newTimeSignature:[number,number])=>void>()
}

customElements.define("wamstudio-time-signature", TimeSignatureElement);