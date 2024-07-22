import SoundProviderElement from "./SoundProviderElement";


const controls_template = document.createElement("template")
controls_template.innerHTML= /*html*/`
    <div id="solo-btn" class="icon _letter control">S</div>
    <div id="monitoring" class="control" style="padding-top: 6px">
        <i class="icon monitor-icon"></i>
    </div>
`

const controls2_template = document.createElement("template")
controls2_template.innerHTML = /*html*/`
    <div id="arm" class="control" style="padding-top: 1px">
        <i class="icon mic-icon" style="width: 15px"></i>
    </div>
    <div id="mode" class="toggle-control active hidden">mono ⇉ stereo</div>
    <div id="left" class="toggle-control active hidden">L</div>
    <div id="right" class="toggle-control hidden">R</div>
    <div id="merge" class="toggle-control active hidden">merge L / R</div>
`

const close_template = document.createElement("template")
close_template.innerHTML = /*html*/`
    <div id="close-btn" class="track-close">
        <i class="icon close-icon" style="width: 14px"></i>
    </div>
`

const automation_template = document.createElement("template")
automation_template.innerHTML = /*html*/`
    <div id="automation" class="control" style="padding-top: 1px">
        <i class="icon automation-icon" style="width: 15px"></i>
    </div>
`

/**
 * An HTMLElement that represents a track panel.
 */
export default class TrackElement extends SoundProviderElement {

    constructor() {
        super();
        if (this.shadowRoot !== null) {
            this.controls2.appendChild(controls2_template.content.cloneNode(true))
            this.muteBtn.after(controls_template.content.cloneNode(true))
            this.handBtn.after(close_template.content.cloneNode(true))
            this.fxBtn.after(automation_template.content.cloneNode(true))
            this.trackNameInput.disabled=false
        }
    }

    set isSampleRecordVisible(value: boolean){
        this.shadowRoot?.querySelectorAll("#right, #left, #merge, #mode").forEach(it => it.classList.toggle("hidden",!value))
    }

    set isSolo(value: boolean){ ["_green","_toggled"].forEach(it=>this.soloBtn.classList.toggle(it,value)) }

    set isStereoMode(value:boolean) {
        if(!this.modeBtn)return
        if(value){
            this.modeBtn.innerText = "stereo";
            this.mergeBtn.hidden = false;
            this.leftBtn.hidden = true;
            this.rightBtn.hidden = true;
        }
        else{
            this.modeBtn.innerText = "mono ⇉ stereo";
            this.mergeBtn.hidden = true;
            this.leftBtn.hidden = false;
            this.rightBtn.hidden = false;
        }
    }

    set isArmed(value: boolean){ 
        this.armBtn.classList.toggle("_toggled",value)
    }

    set isRecording(value: boolean){
        this.armBtn.children[0].classList.toggle("_green",value)
    }

    set isLeft(value:boolean) { this.leftBtn.classList.toggle("active",value)}

    set isRight(value:boolean) { this.rightBtn.classList.toggle("active",value)}

    set isMerge(value:boolean) { this.mergeBtn.classList.toggle("active",value)}

    get armBtn() { return this.shadowRoot?.getElementById("arm") as HTMLDivElement }

    get modeBtn() { return this.shadowRoot?.getElementById("mode") as HTMLDivElement }

    get leftBtn() { return this.shadowRoot?.getElementById("left") as HTMLDivElement }

    get rightBtn() { return this.shadowRoot?.getElementById("right") as HTMLDivElement }

    get mergeBtn() { return this.shadowRoot?.getElementById("merge") as HTMLDivElement }

    get soloBtn() { return this.shadowRoot?.getElementById("solo-btn") as HTMLDivElement }

    get closeBtn() { return this.shadowRoot?.getElementById("close-btn") as HTMLDivElement }

    get automationBtn() { return this.shadowRoot?.getElementById("automation") as HTMLDivElement }

    set isMonitoring(value:boolean) { this.monitoringBtn.classList.toggle("_toggled",value)}


}

customElements.define("track-element", TrackElement)