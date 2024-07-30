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
    .tempo-section {
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
      &:invalid {
        color:red;
      }
    }
    
    #label {
      color: lightgrey;
      font-family: "Roboto Condensed";
      font-size: 14px;
      margin: 0;
      padding: 0;
      border: 0;
    }
    
    .arrows {
      display: inline-flex;
      flex-direction: column;
      position: relative;
      top: -10px;
      margin-left: -3px;
    }
    
    .arrowButton {
      padding-bottom: 0;
      color: lightgrey;
      border: none ;
      background-color: transparent;
      width: 24px;
      height: 24px;
      &:hover {
        scale: 1.1;
      }
      cursor: pointer;
    }
    
    .icon-arrow-down {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='lightgrey' class='bi bi-arrow-up-square' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm8.5 9.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z'/%3E%3C/svg%3E");
    
      transform:rotate(180deg) translate(9px, 4px) scale(1.2, 1.2);;
    
      width:24px;
      height:100%;
      margin-left:-2px;
    
      background-repeat:no-repeat;
      color:#33cca0;
      display:inline-block;
    }
    .icon-arrow-up {
      transform:translate(1px, 4px) scale(1.2, 1.2);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='lightgrey' class='bi bi-arrow-up-square' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm8.5 9.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z'/%3E%3C/svg%3E");
      width:24px;
      height:100%;
      margin-left:-2px;
      background-repeat:no-repeat;
      color:#33cca0;
      display:inline-block;
    }
  </style>

  <div class="tempo-section">
    <input id="input" value="120" id="tempo" pattern="[0-9]+" maxlength=3> 
    <span id="label">bpm</span> 
    <div class="arrows">
      <button class="arrowButton" id="upArrowButton">
        <i class="icon-arrow-up"></i>
      </button> 
      <button class="arrowButton" id="downArrowButton">
        <i class="icon-arrow-down"></i>
      </button>
    </div>
  </div>
`;

export default class TempoElement extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.shadowRoot !== null) {
      this.shadowRoot.replaceChildren(template.cloneNode(true));
      this.defineListeners();
    }
  }

  get input() { return this.shadowRoot!.querySelector("#input") as HTMLInputElement }

  get upArrow() { return this.shadowRoot!.querySelector("#upArrowButton") as HTMLButtonElement }

  get downArrow() { return this.shadowRoot!.querySelector("#downArrowButton") as HTMLButtonElement }
  
  /** The tempo in BPM(beat per minute) */
  get tempo(): number { return parseInt(this.input.value) }

  set tempo(newTempo: number) {
    this.input.value = Math.max(1, newTempo??120).toString();
    this.on_change.forEach((callback) => callback(this.tempo));
  }

  defineListeners() {
    this.input.addEventListener("change", ()=>this.on_change.forEach(callback=>callback(this.tempo)) )
    this.upArrow.addEventListener("click", ()=>this.tempo++ )
    this.downArrow.addEventListener("click", ()=>this.tempo-- )
  }

  readonly on_change= new Set<(newTempo:number)=>void>()
}


customElements.define("wamstudio-tempo-selector", TempoElement);